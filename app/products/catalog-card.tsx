import Image from 'next/image'
import Link from 'next/link'
import type { CatalogProduct } from '@/lib/catalog/products'
import { formatPresentationPrice, getPresentationPrice } from '@/lib/catalog/presentation-price'

export default function CatalogCard({ product }: { product: CatalogProduct }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]">
      <Link href={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-black/20">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            unoptimized
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-950/60 via-black/20 to-rose-950/40">
            <span className="text-4xl font-semibold text-white/20">AM</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-rose-300">
          <span>{product.category?.name ?? 'Collection'}</span>
          <span className="text-zinc-500">Available</span>
        </div>
        <h2 className="mt-3 text-lg font-semibold text-white">{product.name}</h2>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-zinc-400">
          {product.description || 'Thoughtfully selected for everyday life.'}
        </p>
        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="text-lg font-semibold text-white">
            {formatPresentationPrice(getPresentationPrice(product.id))}
          </span>
          <Link
            href={`/products/${product.id}`}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            View Product
          </Link>
        </div>
      </div>
    </article>
  )
}