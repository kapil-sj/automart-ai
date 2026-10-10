'use client'

import Link from 'next/link'
import { FormEvent, useState, type ReactNode } from 'react'
import { useCart } from '@/components/cart/cart-provider'
import { setCartItems } from '@/lib/cart/store'
import { placeOrderAction, reviewCheckoutAction } from './actions'
import { DEFAULT_CHECKOUT_COUNTRY, validateShippingDetails } from '@/lib/checkout/shipping'
import type { CheckoutFieldErrors, CheckoutReview, ShippingDetails } from '@/lib/checkout/types'
import { formatPresentationPrice } from '@/lib/catalog/presentation-price'
import { itemSubtotal } from '@/lib/cart/cart'

const emptyShipping: ShippingDetails = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: DEFAULT_CHECKOUT_COUNTRY,
}

const inputClassName =
  'w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20'

export default function CheckoutView() {
  const { items, isReady, subtotal } = useCart()
  const [shipping, setShipping] = useState<ShippingDetails>(emptyShipping)
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [review, setReview] = useState<CheckoutReview | null>(null)

  // Order placement states
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [placeOrderError, setPlaceOrderError] = useState<string | null>(null)
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string
    externalOrderRef: string
    totalInr: number
    status: string
    isDuplicateReplay?: boolean
  } | null>(null)

  const [idempotencyKey] = useState<string>(() => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    return `order_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  })

  function updateField<Key extends keyof ShippingDetails>(key: Key, value: ShippingDetails[Key]) {
    setShipping((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setServerError('')
    setPlaceOrderError(null)
    setReview(null)

    const clientErrors = validateShippingDetails(shipping)
    if (items.length === 0) {
      clientErrors.items = 'Your cart is empty. Add a product before checking out.'
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      return
    }

    setIsSubmitting(true)

    const result = await reviewCheckoutAction({
      shipping,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    })

    setIsSubmitting(false)

    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {})
      setServerError(result.error)
      return
    }

    setFieldErrors({})
    setReview(result.review)
  }

  async function handleConfirmOrder() {
    if (!review) return
    setIsPlacingOrder(true)
    setPlaceOrderError(null)

    const result = await placeOrderAction({
      shipping: review.shipping,
      items: review.lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
      })),
      idempotencyKey,
    })

    setIsPlacingOrder(false)

    if (!result.ok) {
      setPlaceOrderError(result.error)
      return
    }

    // Clear cart upon successful order
    setCartItems([])

    setConfirmedOrder({
      orderId: result.orderId,
      externalOrderRef: result.externalOrderRef,
      totalInr: result.totalInr,
      status: result.status,
      isDuplicateReplay: result.isDuplicateReplay,
    })
  }

  if (confirmedOrder && review) {
    return <CheckoutSuccessCard order={confirmedOrder} shipping={review.shipping} />
  }

  if (!isReady) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-8">
        <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
        <div className="mt-8 h-40 animate-pulse rounded-2xl bg-white/5" />
      </section>
    )
  }

  if (items.length === 0 && !review) {
    return (
      <section className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">Checkout unavailable</p>
        <h2 className="mt-4 text-3xl font-extrabold text-white">Your cart is empty.</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">Add a product before starting checkout.</p>
        <Link
          href="/products"
          className="mt-8 inline-flex rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
        >
          Browse products
        </Link>
      </section>
    )
  }

  if (review) {
    return (
      <CheckoutReviewCard
        review={review}
        isPlacing={isPlacingOrder}
        placeOrderError={placeOrderError}
        onConfirm={handleConfirmOrder}
        onEdit={() => {
          setReview(null)
          setPlaceOrderError(null)
        }}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">Delivery</p>
        <h2 className="mt-3 text-2xl font-bold text-white">Shipping details</h2>
        <p className="mt-2 text-sm text-zinc-400">We only collect what is needed to deliver an order later.</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Field label="Full name" htmlFor="fullName" error={fieldErrors.fullName} className="sm:col-span-2">
            <input
              id="fullName"
              name="fullName"
              autoComplete="name"
              value={shipping.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="Phone number" htmlFor="phone" error={fieldErrors.phone} className="sm:col-span-2">
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="9876543210"
              value={shipping.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="Address line 1" htmlFor="addressLine1" error={fieldErrors.addressLine1} className="sm:col-span-2">
            <input
              id="addressLine1"
              name="addressLine1"
              autoComplete="address-line1"
              value={shipping.addressLine1}
              onChange={(event) => updateField('addressLine1', event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="Address line 2 (optional)" htmlFor="addressLine2" error={fieldErrors.addressLine2} className="sm:col-span-2">
            <input
              id="addressLine2"
              name="addressLine2"
              autoComplete="address-line2"
              value={shipping.addressLine2}
              onChange={(event) => updateField('addressLine2', event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="City" htmlFor="city" error={fieldErrors.city}>
            <input
              id="city"
              name="city"
              autoComplete="address-level2"
              value={shipping.city}
              onChange={(event) => updateField('city', event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="State" htmlFor="state" error={fieldErrors.state}>
            <input
              id="state"
              name="state"
              autoComplete="address-level1"
              value={shipping.state}
              onChange={(event) => updateField('state', event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="PIN code" htmlFor="postalCode" error={fieldErrors.postalCode}>
            <input
              id="postalCode"
              name="postalCode"
              autoComplete="postal-code"
              inputMode="numeric"
              value={shipping.postalCode}
              onChange={(event) => updateField('postalCode', event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="Country" htmlFor="country" error={fieldErrors.country}>
            <input
              id="country"
              name="country"
              autoComplete="country-name"
              value={shipping.country}
              readOnly
              className={`${inputClassName} text-zinc-300`}
            />
          </Field>
        </div>

        {serverError && (
          <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-200" role="alert">
            {serverError}
          </div>
        )}
        {fieldErrors.items && (
          <p className="mt-4 text-sm text-rose-300" role="alert">
            {fieldErrors.items}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isSubmitting ? 'Validating checkout...' : 'Review checkout totals'}
        </button>
      </section>

      <aside className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">Estimate</p>
        <h2 className="mt-3 text-xl font-semibold text-white">Order summary</h2>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item.productId} className="flex items-start justify-between gap-4 text-sm">
              <div>
                <p className="font-medium text-white">{item.name}</p>
                <p className="mt-1 text-zinc-500">
                  Qty {item.quantity} · {formatPresentationPrice(item.unitPrice)} each
                </p>
              </div>
              <p className="shrink-0 font-semibold text-white">{formatPresentationPrice(itemSubtotal(item))}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2 border-t border-white/10 pt-5 text-sm text-zinc-400">
          <SummaryRow label="Subtotal" value={formatPresentationPrice(subtotal)} />
          <SummaryRow label="Shipping" value="Calculated on review" />
          <SummaryRow label="Other fees" value="Calculated on review" />
        </div>
        <p className="mt-4 text-xs leading-5 text-zinc-500">
          Cart prices are not authoritative. The server will re-fetch products and calculate the checkout total when you review.
        </p>
      </aside>
    </form>
  )
}

function CheckoutReviewCard({
  review,
  isPlacing,
  placeOrderError,
  onConfirm,
  onEdit,
}: {
  review: CheckoutReview
  isPlacing: boolean
  placeOrderError: string | null
  onConfirm: () => void
  onEdit: () => void
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Review ready</p>
        <h2 className="mt-3 text-2xl font-bold text-white">Checkout validated.</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Totals below were calculated on the server after verifying active products. Click below to confirm and create your order.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <StatusChip>Order created: ready to confirm</StatusChip>
          <StatusChip>Payment charged: no (staged for Phase 2)</StatusChip>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-300">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Deliver to</p>
          <p className="mt-3 font-medium text-white">{review.shipping.fullName}</p>
          <p className="mt-1">{review.shipping.phone}</p>
          <p className="mt-3">
            {review.shipping.addressLine1}
            {review.shipping.addressLine2 ? `, ${review.shipping.addressLine2}` : ''}
          </p>
          <p>
            {review.shipping.city}, {review.shipping.state} {review.shipping.postalCode}
          </p>
          <p>{review.shipping.country}</p>
          {review.customerEmail && <p className="mt-3 text-zinc-400">{review.customerEmail}</p>}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPlacing}
            className="inline-flex rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isPlacing ? 'Placing order in database...' : 'Confirm & Place Order'}
          </button>
          <button
            type="button"
            onClick={onEdit}
            disabled={isPlacing}
            className="inline-flex rounded-full border border-white/15 px-5 py-3.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Edit details
          </button>
          <Link
            href="/products"
            className="inline-flex rounded-full bg-white/10 px-5 py-3.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/20 hover:text-white"
          >
            Continue shopping
          </Link>
        </div>

        {placeOrderError && (
          <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-200" role="alert">
            {placeOrderError}
          </div>
        )}
      </section>

      <aside className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">Authoritative total</p>
        <ul className="mt-6 space-y-4">
          {review.lines.map((line) => (
            <li key={line.productId} className="flex items-start justify-between gap-4 text-sm">
              <div>
                <p className="font-medium text-white">{line.name}</p>
                <p className="mt-1 text-zinc-500">
                  Qty {line.quantity} · {formatPresentationPrice(line.unit_price_inr)} each
                </p>
              </div>
              <p className="shrink-0 font-semibold text-white">{formatPresentationPrice(line.line_total_inr)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2 border-t border-white/10 pt-5 text-sm text-zinc-400">
          <SummaryRow label="Subtotal" value={formatPresentationPrice(review.subtotal_inr)} />
          <SummaryRow label="Shipping" value={formatPresentationPrice(review.shipping_inr)} />
          <SummaryRow label="Other fees" value={formatPresentationPrice(review.other_fees_inr)} />
          <div className="flex items-center justify-between pt-2 text-base font-semibold text-white">
            <span>Total</span>
            <span>{formatPresentationPrice(review.total_inr)}</span>
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-zinc-500">
          Calculated authoritative prices from the database.
        </p>
      </aside>
    </div>
  )
}

function CheckoutSuccessCard({
  order,
  shipping,
}: {
  order: { orderId: string; externalOrderRef: string; totalInr: number; status: string; isDuplicateReplay?: boolean }
  shipping: ShippingDetails
}) {
  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-emerald-500/20 bg-emerald-950/10 p-6 sm:p-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
        {order.isDuplicateReplay ? 'Order Already Placed' : 'Order Successfully Placed'}
      </p>
      <h2 className="mt-2 text-3xl font-extrabold text-white">Order Confirmed!</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        Your order has been recorded securely in the database with pending status.
      </p>

      <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-black/40 p-6 text-left text-sm">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-zinc-400">Order Reference</span>
          <span className="font-mono font-bold text-white text-base">{order.externalOrderRef}</span>
        </div>
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-zinc-400">Status</span>
          <span className="inline-flex rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase text-amber-300">
            {order.status}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-zinc-400">Total Amount</span>
          <span className="font-bold text-white text-base">{formatPresentationPrice(order.totalInr)}</span>
        </div>
        <div className="pt-1">
          <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Delivery Address</p>
          <p className="mt-1 text-zinc-300 font-medium">{shipping.fullName}</p>
          <p className="text-zinc-400 text-xs">Phone: {shipping.phone}</p>
          <p className="text-zinc-400 text-xs">
            {shipping.addressLine1}
            {shipping.addressLine2 ? `, ${shipping.addressLine2}` : ''}, {shipping.city}, {shipping.state} {shipping.postalCode}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs leading-5 text-zinc-400 text-left">
        <p className="font-medium text-zinc-300">Current Scope Notes:</p>
        <p className="mt-1">• Order & order items created in Supabase with transaction safety.</p>
        <p>• Payment integration, supplier procurement, and delivery tracking will follow in subsequent phases.</p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href={`/account/orders/${order.orderId}`}
          className="inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 shadow-lg"
        >
          View Order Details
        </Link>
        <Link
          href="/products"
          className="inline-flex rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-zinc-200 transition hover:border-white/30 hover:bg-white/10"
        >
          Continue Shopping
        </Link>
      </div>
    </section>
  )
}

function Field({
  label,
  htmlFor,
  error,
  className = '',
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-zinc-200">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-2 text-xs leading-5 text-rose-300" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <span className="text-white">{value}</span>
    </div>
  )
}

function StatusChip({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{children}</p>
}
