import CatalogCard from './catalog-card'
import ShopHeader from '@/components/shop-header'
import { getActiveProducts } from '@/lib/catalog/products'

export default async function ProductsPage() {
  const products = await getActiveProducts()

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#03040a] via-[#07070d] to-[#0b0b10] px-6 py-8 text-zinc-100 antialiased sm:py-12">
      <div className="mx-auto max-w-7xl">
        <ShopHeader />

        <section className="py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-400">The AutoMart edit</p>
          <div className="mt-5 flex max-w-4xl flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">Find your next favourite.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">A considered collection of useful, beautiful products, selected for modern Indian living.</p>
            </div>
            <p className="shrink-0 text-sm text-zinc-500">{products.length} {products.length === 1 ? 'product' : 'products'} available</p>
          </div>
        </section>

        {products.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-20 text-center">
            <p className="text-lg font-semibold text-white">The collection is being refreshed.</p>
            <p className="mt-2 text-sm text-zinc-400">Check back soon for new products.</p>
          </section>
        ) : (
          <section className="grid gap-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => <CatalogCard key={product.id} product={product} />)}
          </section>
        )}
      </div>
    </main>
  )
}