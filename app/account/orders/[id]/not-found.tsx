import Link from 'next/link'
import ShopHeader from '@/components/shop-header'

export default function OrderNotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#03040a] via-[#07070d] to-[#0b0b10] px-6 py-8 text-zinc-100 antialiased sm:py-12">
      <div className="mx-auto max-w-5xl">
        <ShopHeader />

        <div className="mx-auto mt-16 max-w-md rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">Order lookup</p>
          <h1 className="mt-3 text-2xl font-bold text-white">Order not found</h1>
          <p className="mt-3 text-sm text-zinc-400">
            We couldn&apos;t find this order. It may not exist, or you may need to sign in with a different account.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/account/orders"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              View My Orders
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
