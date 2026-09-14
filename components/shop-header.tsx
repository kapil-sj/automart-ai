import Link from 'next/link'
import CartNavLink from '@/components/cart/cart-nav-link'

export default function ShopHeader() {
  return (
    <header className="flex items-center justify-between border-b border-white/10 pb-6">
      <Link href="/" className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 via-indigo-500 to-cyan-400 shadow-lg">
          <span className="h-3 w-3 rounded-full bg-white" />
        </span>
        <span className="text-lg font-semibold text-white">AutoMart AI</span>
      </Link>

      <nav className="flex items-center gap-6 text-sm text-zinc-400">
        <Link href="/products" className="transition hover:text-white">
          Products
        </Link>
        <Link href="/account" className="transition hover:text-white">
          Account
        </Link>
        <CartNavLink />
      </nav>
    </header>
  )
}
