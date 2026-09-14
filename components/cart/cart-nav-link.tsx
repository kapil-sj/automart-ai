'use client'

import Link from 'next/link'
import { useCart } from '@/components/cart/cart-provider'

export default function CartNavLink({ className = '' }: { className?: string }) {
  const { itemCount, isReady } = useCart()
  const showCount = isReady && itemCount > 0

  return (
    <Link href="/cart" className={`relative inline-flex items-center gap-2 transition hover:text-white ${className}`}>
      <span>Cart</span>
      <span
        className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold ${
          showCount ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white' : 'bg-white/10 text-zinc-500'
        }`}
        aria-live="polite"
        aria-label={showCount ? `${itemCount} items in cart` : 'Cart is empty'}
      >
        {showCount ? itemCount : 0}
      </span>
    </Link>
  )
}
