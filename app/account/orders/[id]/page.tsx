import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import ShopHeader from '@/components/shop-header'
import OrderStatusBadge from '@/components/orders/order-status-badge'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserOrderById, isValidUuid } from '@/lib/orders/queries'
import { formatPresentationPrice } from '@/lib/catalog/presentation-price'

function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date)
  } catch {
    return isoString
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (!isValidUuid(id)) {
    notFound()
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/account/orders/${id}`)
  }

  const order = await getUserOrderById(id, user.id)

  if (!order) {
    notFound()
  }

  const shipping = order.shippingAddress

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#03040a] via-[#07070d] to-[#0b0b10] px-6 py-8 text-zinc-100 antialiased sm:py-12">
      <div className="mx-auto max-w-6xl">
        <ShopHeader />

        <div className="py-8 sm:py-12">
          {/* Top Breadcrumb & Return Link */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Link href="/account" className="transition hover:text-white">
                Account
              </Link>
              <span>/</span>
              <Link href="/account/orders" className="transition hover:text-white">
                Orders
              </Link>
              <span>/</span>
              <span className="font-mono text-zinc-200">{order.externalOrderRef}</span>
            </div>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to all orders
            </Link>
          </div>

          {/* Header Banner */}
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">Order Details</p>
                <h1 className="mt-2 font-mono text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {order.externalOrderRef}
                </h1>
                <p className="mt-1 text-sm text-zinc-400">
                  Placed on {formatDateTime(order.placedAt || order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.status} className="text-sm px-4 py-1.5" />
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Left Column: Items & Shipping */}
            <div className="space-y-6">
              {/* Order Items List */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                <h2 className="text-lg font-bold text-white">
                  Purchased Items ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
                </h2>

                <div className="mt-6 divide-y divide-white/10">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                      {/* Product Thumbnail */}
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                        {item.productImageUrl ? (
                          <Image
                            src={item.productImageUrl}
                            alt={item.productName}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-950/60 to-rose-950/40 text-sm font-semibold text-white/30">
                            AM
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-1">
                        <Link
                          href={`/products/${item.productId}`}
                          className="font-medium text-white transition hover:text-indigo-300"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-xs text-zinc-400">
                          Qty {item.quantity} · {formatPresentationPrice(item.unitPriceInr)} each
                        </p>
                      </div>

                      {/* Line Total */}
                      <div className="text-left sm:text-right">
                        <p className="text-xs uppercase tracking-wider text-zinc-400 sm:hidden">Line Total</p>
                        <p className="font-bold text-white">{formatPresentationPrice(item.totalPriceInr)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Delivery Address */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-zinc-300">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-white">Delivery Address</h2>
                </div>

                {shipping ? (
                  <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-5 text-sm text-zinc-300">
                    <p className="font-semibold text-white">{shipping.fullName}</p>
                    <p className="mt-1 text-xs text-zinc-400">Phone: {shipping.phone}</p>
                    <p className="mt-2 text-zinc-300">
                      {shipping.addressLine1}
                      {shipping.addressLine2 ? `, ${shipping.addressLine2}` : ''}
                    </p>
                    <p className="text-zinc-300">
                      {shipping.city}, {shipping.state} {shipping.postalCode}
                    </p>
                    <p className="text-zinc-400 text-xs">{shipping.country}</p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-zinc-400">No delivery address saved for this order.</p>
                )}
              </section>
            </div>

            {/* Right Column: Order Summary & Scope */}
            <div className="space-y-6">
              {/* Order Summary */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">
                <h2 className="text-base font-bold text-white">Order Summary</h2>

                <div className="mt-5 space-y-3 border-b border-white/10 pb-5 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-medium text-white">{formatPresentationPrice(order.subtotalInr)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Delivery</span>
                    <span className="font-medium text-white">
                      {order.shippingInr === 0 ? 'Free' : formatPresentationPrice(order.shippingInr)}
                    </span>
                  </div>
                  {order.otherFeesInr > 0 && (
                    <div className="flex justify-between text-zinc-400">
                      <span>Other fees</span>
                      <span className="font-medium text-white">{formatPresentationPrice(order.otherFeesInr)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-5">
                  <span className="text-base font-semibold text-white">Total</span>
                  <span className="text-2xl font-extrabold text-white">
                    {formatPresentationPrice(order.totalInr)}
                  </span>
                </div>
              </section>

              {/* Status Notice */}
              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-xs leading-5 text-zinc-400">
                <p className="font-semibold text-zinc-300">Scope & Processing Notice</p>
                <p className="mt-1">
                  • Order recorded securely with atomic transaction integrity.
                </p>
                <p>
                  • Payment collection, autonomous supplier procurement, and carrier tracking will activate in future milestones.
                </p>
              </section>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Link
                  href="/products"
                  className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/account/orders"
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                >
                  All Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
