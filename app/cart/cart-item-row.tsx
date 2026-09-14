'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MAX_ITEM_QUANTITY, MIN_ITEM_QUANTITY, itemSubtotal } from '@/lib/cart/cart'
import { formatPresentationPrice } from '@/lib/catalog/presentation-price'
import type { CartItem } from '@/lib/cart/types'

type CartItemRowProps = {
  item: CartItem
  onQuantityChange: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export default function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  return (
    <article className="grid gap-5 border-b border-white/10 py-6 last:border-b-0 sm:grid-cols-[96px_1fr_auto] sm:items-center">
      <Link
        href={`/products/${item.productId}`}
        className="relative block h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-black/20"
      >
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill unoptimized className="object-cover" sizes="96px" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-950/60 via-black/20 to-rose-950/40">
            <span className="text-lg font-semibold text-white/20">AM</span>
          </div>
        )}
      </Link>

      <div className="min-w-0">
        <Link href={`/products/${item.productId}`} className="text-base font-semibold text-white transition hover:text-zinc-200">
          {item.name}
        </Link>
        <p className="mt-1 text-sm text-zinc-400">{formatPresentationPrice(item.unitPrice)} each</p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl border border-white/10 bg-black/20">
            <button
              type="button"
              onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
              disabled={item.quantity <= MIN_ITEM_QUANTITY}
              aria-label={`Decrease quantity of ${item.name}`}
              className="flex h-10 w-10 items-center justify-center text-lg text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              -
            </button>
            <input
              type="number"
              min={MIN_ITEM_QUANTITY}
              max={MAX_ITEM_QUANTITY}
              value={item.quantity}
              onChange={(event) => onQuantityChange(item.productId, Number(event.target.value))}
              className="h-10 w-12 border-x border-white/10 bg-transparent text-center text-sm font-semibold text-white outline-none"
              aria-label={`Quantity for ${item.name}`}
            />
            <button
              type="button"
              onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
              disabled={item.quantity >= MAX_ITEM_QUANTITY}
              aria-label={`Increase quantity of ${item.name}`}
              className="flex h-10 w-10 items-center justify-center text-lg text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            className="text-sm text-zinc-500 underline decoration-white/20 underline-offset-4 transition hover:text-rose-300"
          >
            Remove
          </button>
        </div>
      </div>

      <p className="text-base font-semibold text-white sm:text-right">{formatPresentationPrice(itemSubtotal(item))}</p>
    </article>
  )
}
