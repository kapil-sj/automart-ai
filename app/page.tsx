import Link from 'next/link'
import HomeHeader from '@/components/home-header'
import CatalogCard from '@/app/products/catalog-card'
import { getActiveProducts } from '@/lib/catalog/products'

export default async function Home() {
  const allProducts = await getActiveProducts()
  const featuredProducts = allProducts.slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#03040a] via-[#07070d] to-[#0b0b10] text-zinc-100 antialiased">
      <HomeHeader />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        {/* Hero Section */}
        <section className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <div className="text-sm font-semibold text-rose-400 tracking-widest uppercase">
              The Autonomous Commerce Engine
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white">
              You discover it.<br />We handle the rest.
            </h1>
            <p className="mt-4 max-w-xl text-zinc-300 text-lg leading-relaxed">
              From discovery to delivery, AutoMart AI automates the entire commerce operation — finding the right supplier, optimizing costs, placing orders, and tracking shipments.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 hover:-translate-y-0.5 transition-transform"
              >
                Shop Catalog →
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:border-white/20 transition"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Interactive AI Preview Card */}
          <div className="relative">
            <Link
              href="/products/8c1a6a69-4eec-4609-914c-560ed6509dc4"
              className="block rounded-2xl bg-gradient-to-tr from-white/[0.04] to-white/[0.07] p-6 shadow-2xl backdrop-blur-md border border-white/10 transition hover:border-white/20 hover:bg-white/[0.08] group"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider text-rose-400 font-semibold">Product Discovered</div>
                <div className="text-xs text-zinc-400">
                  Supplier match: <span className="font-semibold text-white">97%</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-white group-hover:scale-105 transition-transform">
                    PM
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">
                      Portable Mini Projector
                    </div>
                    <div className="text-xs text-zinc-400">Discovered via targeted campaign</div>
                  </div>
                </div>

                <div className="relative mt-2 p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-cyan-950/30 border border-white/10">
                  <div className="flex items-center justify-between text-sm text-zinc-300">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">AI Analysis</div>
                    </div>
                    <div className="text-xs">
                      Estimated savings: <span className="font-semibold text-white">₹642</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-[11px] text-zinc-400">Supplier match</div>
                      <div className="text-sm font-semibold text-white">97%</div>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-[11px] text-zinc-400">Delivery</div>
                      <div className="text-sm font-semibold text-white">6–8 days</div>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-[11px] text-zinc-400">Confidence</div>
                      <div className="text-sm font-semibold text-white">94%</div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-4 gap-2 text-xs text-zinc-300">
                  <div className="p-2.5 rounded-lg bg-white/[0.03] text-center border border-white/5">
                    Product<br /><span className="font-semibold text-white">Discovered</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 text-center text-white shadow font-medium">
                    AI<br /><span>Analysis</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.03] text-center border border-white/5">
                    Supplier<br /><span className="font-semibold text-white">Match</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.03] text-center border border-white/5">
                    Order<br /><span className="font-semibold text-white">Placed</span>
                  </div>
                </div>
              </div>
            </Link>
            <div className="pointer-events-none absolute -bottom-4 left-8 right-8 h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-cyan-400 opacity-35 rounded-full blur-md" />
          </div>
        </section>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section className="mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">Curated Collection</p>
                <h2 className="mt-2 text-3xl font-extrabold text-white">Featured Products</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Explore high-demand items optimized by AutoMart AI autonomous sourcing.
                </p>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition"
              >
                View all products ({allProducts.length}) →
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <CatalogCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* How It Works Section */}
        <section id="how" className="mt-28">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">Autonomous Flow</p>
            <h2 className="mt-2 text-3xl font-extrabold text-white">How It Works</h2>
            <p className="mt-3 text-sm text-zinc-400">
              A seamless architecture that turns smart customer demand into autonomous fulfillment.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-tr from-white/[0.03] to-white/[0.06] border border-white/10">
              <div className="text-2xl font-bold text-rose-400">01</div>
              <div className="mt-3 font-bold text-white">DISCOVER</div>
              <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Products reach customers through intelligent advertising, social discovery, and curated trends.
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-2xl font-bold text-rose-400">02</div>
              <div className="mt-3 font-bold text-white">ORDER</div>
              <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Customers place orders through fail-safe checkout with instant atomic transaction logging.
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-2xl font-bold text-rose-400">03</div>
              <div className="mt-3 font-bold text-white">AI PROCUREMENT</div>
              <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
                The engine evaluates suppliers, shipping reliability, and landed cost to optimize margins.
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-2xl font-bold text-rose-400">04</div>
              <div className="mt-3 font-bold text-white">DELIVER</div>
              <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Automated order routing, carrier tracking notifications, and customer status updates.
              </div>
            </div>
          </div>
        </section>

        {/* AI Engine Section */}
        <section id="engine" className="mt-28">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">Intelligence Layer</p>
            <h2 className="mt-2 text-3xl font-extrabold text-white">Autonomous Engine Capabilities</h2>
            <p className="mt-3 text-sm text-zinc-400">
              Continuous optimization powering every commerce transaction behind the scenes.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl p-6 bg-white/[0.03] border border-white/10">
              <div className="font-bold text-white">Supplier Discovery</div>
              <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Continuous onboarding and evaluation of verified, quality suppliers.
              </div>
            </div>
            <div className="rounded-2xl p-6 bg-white/[0.03] border border-white/10">
              <div className="font-bold text-white">Price Optimization</div>
              <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Dynamic landed cost calculation and competitive margin recommendations.
              </div>
            </div>
            <div className="rounded-2xl p-6 bg-white/[0.03] border border-white/10">
              <div className="font-bold text-white">Inventory Monitoring</div>
              <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Real-time stock checks and supplier availability verifications.
              </div>
            </div>
            <div className="rounded-2xl p-6 bg-white/[0.03] border border-white/10">
              <div className="font-bold text-white">Automated Procurement</div>
              <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Deterministic purchase routing without manual back-office intervention.
              </div>
            </div>
            <div className="rounded-2xl p-6 bg-white/[0.03] border border-white/10">
              <div className="font-bold text-white">Shipment Tracking</div>
              <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
                End-to-end milestone tracking and customer status notifications.
              </div>
            </div>
            <div className="rounded-2xl p-6 bg-white/[0.03] border border-white/10">
              <div className="font-bold text-white">Profit & Ledger Monitoring</div>
              <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Automated double-entry reconciliation and margin performance metrics.
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mt-28 rounded-3xl bg-gradient-to-r from-rose-500 via-indigo-600 to-cyan-500 p-8 sm:p-12 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-3xl font-extrabold tracking-tight">Commerce that runs itself.</h3>
              <p className="mt-2 text-white/90 text-base max-w-xl">
                Ready to experience intelligent e-commerce? Explore our curated catalog or create your account today.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-indigo-900 shadow-xl hover:bg-zinc-100 transition"
              >
                Browse Catalog →
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-6 py-3.5 text-sm font-semibold text-white hover:bg-black/30 transition"
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t border-white/10 pt-8 text-zinc-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-sm">
              © {new Date().getFullYear()} AutoMart AI. Autonomous Indian Commerce.
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Link href="/products" className="hover:text-white transition">
                Products
              </Link>
              <Link href="/cart" className="hover:text-white transition">
                Cart
              </Link>
              <Link href="/login" className="hover:text-white transition">
                Sign In
              </Link>
              <Link href="/signup" className="hover:text-white transition">
                Sign Up
              </Link>
              <a href="#how" className="hover:text-white transition">
                How It Works
              </a>
              <a href="#engine" className="hover:text-white transition">
                AI Engine
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
