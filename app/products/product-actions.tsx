'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/components/cart/cart-provider'
import { MAX_ITEM_QUANTITY, MIN_ITEM_QUANTITY, clampQuantity } from '@/lib/cart/cart'

type ProductActionsProps = {
  productId: string
  productName: string
  imageUrl: string | null
  unitPrice: number
}

export default function ProductActions({ productId, productName, imageUrl, unitPrice }: ProductActionsProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)

  function updateQuantity(value: number) {
    setQuantity(clampQuantity(value))
    setIsAdded(false)
  }

  function handleAddToCart() {
    addItem({
      productId,
      name: productName,
      imageUrl,
      unitPrice,
      quantity,
    })
    setIsAdded(true)
  }

  return (
    <div className="mt-8 border-t border-white/10 pt-8">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor="quantity" className="text-sm font-medium text-zinc-300">
          Quantity
        </label>
        <div className="flex items-center rounded-xl border border-white/10 bg-black/20">
          <button
            type="button"
            onClick={() => updateQuantity(quantity - 1)}
            aria-label="Decrease quantity"
            className="flex h-11 w-11 items-center justify-center text-lg text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            -
          </button>
          <input
            id="quantity"
            type="number"
            min={MIN_ITEM_QUANTITY}
            max={MAX_ITEM_QUANTITY}
            value={quantity}
            onChange={(event) => updateQuantity(Number(event.target.value))}
            className="h-11 w-12 border-x border-white/10 bg-transparent text-center text-sm font-semibold text-white outline-none"
            aria-label="Product quantity"
          />
          <button
            type="button"
            onClick={() => updateQuantity(quantity + 1)}
            aria-label="Increase quantity"
            className="flex h-11 w-11 items-center justify-center text-lg text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className="mt-5 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:shadow-rose-950/30"
      >
        {isAdded ? `${quantity} ${productName} added` : 'Add to Cart'}
      </button>
      {isAdded && (
        <p className="mt-3 text-center text-xs text-emerald-300" role="status">
          Added to your cart.{' '}
          <Link href="/cart" className="underline decoration-emerald-300/50 underline-offset-4 hover:text-emerald-200">
            View cart
          </Link>
        </p>
      )}
    </div>
  )
}
