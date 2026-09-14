import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ShopHeader from '@/components/shop-header'
import ProductActions from '../product-actions'
import { getActiveProductById } from '@/lib/catalog/products'
import { formatPresentationPrice, getPresentationPrice } from '@/lib/catalog/presentation-price'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getActiveProductById(id)

  if (!product) {
    notFound()
  }

  const unitPrice = getPresentationPrice(product.id)

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#03040a] via-[#07070d] to-[#0b0b10] px-6 py-8 text-zinc-100 antialiased sm:py-12">
      <div className="mx-auto max-w-6xl">
        <ShopHeader />
        <Link href="/products" className="mt-8 inline-block text-sm text-zinc-400 transition hover:text-white">← Back to products</Link>
        <div className="mt-8 grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative aspect-square bg-black/20 lg:aspect-auto lg:min-h-[620px]">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill unoptimized className="object-cover" sizes="(max-width: 1024px) 100vw, 55vw" />
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center bg-gradient-to-br from-indigo-950/60 via-black/20 to-rose-950/40">
                <span className="text-7xl font-semibold text-white/20">AM</span>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center p-7 sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">{product.category?.name ?? 'AutoMart collection'}</p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{product.name}</h1>
            <p className="mt-6 text-base leading-7 text-zinc-400">{product.description || 'Thoughtfully selected for everyday life.'}</p>
            <p className="mt-8 text-3xl font-semibold text-white">{formatPresentationPrice(unitPrice)}</p>
            <ProductActions
              productId={product.id}
              productName={product.name}
              imageUrl={product.image_url}
              unitPrice={unitPrice}
            />
          </div>
        </div>
      </div>
    </main>
  )
}