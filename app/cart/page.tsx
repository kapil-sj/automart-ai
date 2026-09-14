import ShopHeader from '@/components/shop-header'
import CartView from './cart-view'

export default function CartPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#03040a] via-[#07070d] to-[#0b0b10] px-6 py-8 text-zinc-100 antialiased sm:py-12">
      <div className="mx-auto max-w-7xl">
        <ShopHeader />
        <section className="py-10 sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-400">Shopping cart</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Review your selection.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            Your cart stays on this device for now. Payment and order creation will arrive in a later phase.
          </p>
        </section>
        <CartView />
      </div>
    </main>
  )
}
