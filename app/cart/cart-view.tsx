'use client'

import Link from 'next/link'
import CartItemRow from './cart-item-row'
import { useCart } from '@/components/cart/cart-provider'
import { formatPresentationPrice } from '@/lib/catalog/presentation-price'

export default function CartView() {
  const { items, isReady, subtotal, updateQuantity, removeItem } = useCart()

  if (!isReady) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-8">
        <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
        <div className="mt-8 h-24 animate-pulse rounded-2xl bg-white/5" />
        <div className="mt-4 h-24 animate-pulse rounded-2xl bg-white/5" />
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">Your cart</p>
        <h2 className="mt-4 text-3xl font-extrabold text-white">Nothing here yet.</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">Browse the collection and add something you like.</p>
        <Link
          href="/products"
          className="mt-8 inline-flex rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
        >
          Continue Shopping
        </Link>
      </section>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
      <section className="rounded-3xl border border-white/10 bg-white/[0.035] px-6 py-2 sm:px-8">
        {items.map((item) => (
          <CartItemRow
            key={item.productId}
            item={item}
            onQuantityChange={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </section>

      <aside className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">Summary</p>
        <div className="mt-6 flex items-center justify-between text-sm text-zinc-400">
          <span>Subtotal</span>
          <span className="text-lg font-semibold text-white">{formatPresentationPrice(subtotal)}</span>
        </div>
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Prices shown are for presentation only. Checkout will confirm product and pricing details on the server.
        </p>

        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5"
        >
          Proceed to Checkout
        </Link>

        <Link
          href="/products"
          className="mt-4 flex w-full items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
        >
          Continue Shopping
        </Link>
      </aside>
    </div>
  )
}
