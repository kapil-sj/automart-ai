import CartNavLink from '@/components/cart/cart-nav-link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#03040a] via-[#07070d] to-[#0b0b10] text-zinc-100 antialiased">
      <header className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-rose-500 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12h18" stroke="#000" strokeOpacity="0.12" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="12" r="3.2" fill="#fff" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-semibold">AutoMart AI</div>
              <div className="text-xs text-zinc-400 -mt-0.5">Autonomous Commerce</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-300">
            <a href="#products" className="hover:text-white transition">Products</a>
            <a href="#how" className="hover:text-white transition">How It Works</a>
            <a href="#engine" className="hover:text-white transition">AI Engine</a>
            <a href="#about" className="hover:text-white transition">About</a>
            <CartNavLink />
            <a href="#signin" className="hover:text-white transition">Sign In</a>
            <a href="#get-started" className="ml-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-rose-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:scale-105 transition-transform">Get Started</a>
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <CartNavLink className="text-sm text-zinc-300" />
            <button className="rounded-full bg-white/6 px-3 py-2">Menu</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <section className="grid gap-12 md:grid-cols-2 items-center">
          <div>
            <div className="text-sm font-semibold text-rose-400 tracking-widest">THE AUTONOMOUS COMMERCE ENGINE</div>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">You discover it.<br/>We handle the rest.</h1>
            <p className="mt-4 max-w-xl text-zinc-300 text-lg">From discovery to delivery, AutoMart AI automates the entire commerce operation — finding the right supplier, optimizing costs, placing orders and tracking shipments.</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#products" className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:translate-y-[-3px] transition-transform">Start Shopping →</a>
              <a href="#how" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-zinc-200 hover:bg-white/3 transition">See How It Works</a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-tr from-white/4 to-white/6 p-6 shadow-2xl backdrop-blur-md border border-white/6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-200 font-medium">PRODUCT DISCOVERED</div>
                <div className="text-xs text-zinc-400">Supplier match: <span className="font-semibold text-white">97%</span></div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-white/6 flex items-center justify-center text-sm">P</div>
                  <div>
                    <div className="text-sm font-semibold">Portable Mini Projector</div>
                    <div className="text-xs text-zinc-400">Discovered via targeted campaign</div>
                  </div>
                </div>

                <div className="relative mt-2 p-4 rounded-lg bg-gradient-to-r from-indigo-900/20 to-cyan-900/10 border border-white/6">
                  <div className="flex items-center justify-between text-sm text-zinc-300">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse"></div>
                      <div>AI ANALYSIS</div>
                    </div>
                    <div className="text-xs">Estimated savings: <span className="font-semibold text-white">₹642</span></div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="text-xs text-zinc-400">Supplier match</div>
                      <div className="text-sm font-semibold">97%</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="text-xs text-zinc-400">Delivery</div>
                      <div className="text-sm font-semibold">6–8 days</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="text-xs text-zinc-400">Confidence</div>
                      <div className="text-sm font-semibold">94%</div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-4 gap-2 text-sm text-zinc-300">
                  <div className="col-span-1 p-2 rounded-lg bg-white/4 text-center">PRODUCT<br/><span className="font-semibold text-white">Discovered</span></div>
                  <div className="col-span-1 p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 text-center text-white shadow">AI<br/><span className="font-semibold">Analysis</span></div>
                  <div className="col-span-1 p-2 rounded-lg bg-white/4 text-center">Supplier<br/><span className="font-semibold text-white">Match</span></div>
                  <div className="col-span-1 p-2 rounded-lg bg-white/4 text-center">Order<br/><span className="font-semibold text-white">Placed</span></div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-4 left-8 right-8 h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-cyan-400 opacity-35 rounded-full blur-md"></div>
          </div>
        </section>

        <section id="how" className="mt-16">
          <h2 className="text-2xl font-semibold">How It Works</h2>
          <p className="mt-2 text-zinc-400">A powerful, autonomous flow that turns discovery into delivery.</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-tr from-white/4 to-white/6 border border-white/6">
              <div className="text-2xl font-bold text-rose-400">01</div>
              <div className="mt-3 font-semibold">DISCOVER</div>
              <div className="mt-2 text-sm text-zinc-300">Products reach customers through intelligent advertising and discovery.</div>
            </div>
            <div className="p-6 rounded-xl bg-white/4 border border-white/6">
              <div className="text-2xl font-bold text-rose-400">02</div>
              <div className="mt-3 font-semibold">ORDER</div>
              <div className="mt-2 text-sm text-zinc-300">Customer purchases through AutoMart AI; payments are processed seamlessly.</div>
            </div>
            <div className="p-6 rounded-xl bg-white/4 border border-white/6">
              <div className="text-2xl font-bold text-rose-400">03</div>
              <div className="mt-3 font-semibold">AI PROCUREMENT</div>
              <div className="mt-2 text-sm text-zinc-300">Our engine compares suppliers, shipping, reliability and landed cost.</div>
            </div>
            <div className="p-6 rounded-xl bg-white/4 border border-white/6">
              <div className="text-2xl font-bold text-rose-400">04</div>
              <div className="mt-3 font-semibold">DELIVER</div>
              <div className="mt-2 text-sm text-zinc-300">The order is fulfilled; tracking and notifications are handled automatically.</div>
            </div>
          </div>
        </section>

        <section id="products" className="mt-16">
          <h3 className="text-xl font-semibold">Product Intelligence</h3>
          <p className="mt-2 text-zinc-400">One purchase. Hundreds of decisions handled by AI.</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-tr from-white/4 to-white/6 border border-white/6 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="h-28 w-28 rounded-lg bg-white/6 flex items-center justify-center text-2xl">PM</div>
                <div className="flex-1">
                  <div className="text-sm text-zinc-300">Portable Mini Projector</div>
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-md bg-white/5">
                      <div className="text-xs text-zinc-400">Supplier A</div>
                      <div className="mt-1 font-semibold">₹1,249</div>
                      <div className="text-xs text-zinc-400">Shipping ₹299 · 10–14 days</div>
                    </div>
                    <div className="p-3 rounded-md bg-gradient-to-br from-rose-500 to-indigo-600 text-white shadow-md ring-1 ring-white/10">
                      <div className="text-xs">Supplier B</div>
                      <div className="mt-1 font-semibold">₹1,399</div>
                      <div className="text-xs">Shipping ₹149 · 6–8 days</div>
                      <div className="mt-2 text-xs bg-white/6 inline-block px-2 py-1 rounded">Optimal choice</div>
                    </div>
                    <div className="p-3 rounded-md bg-white/5">
                      <div className="text-xs text-zinc-400">Supplier C</div>
                      <div className="mt-1 font-semibold">₹1,199</div>
                      <div className="text-xs text-zinc-400">Shipping ₹449 · 12–18 days</div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-6">
                    <div className="p-4 rounded-lg bg-white/6">
                      <div className="text-xs text-zinc-300">Landed cost</div>
                      <div className="font-semibold">₹1,548</div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/6">
                      <div className="text-xs text-zinc-300">AI confidence</div>
                      <div className="font-semibold">94%</div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/6">
                      <div className="text-xs text-zinc-300">Estimated customer price</div>
                      <div className="font-bold">₹2,299</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="p-6 rounded-2xl bg-white/4 border border-white/6">
              <div className="text-sm text-zinc-400">AI Insights</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center justify-between"><span>Supplier match</span><span className="font-semibold">Supplier B</span></li>
                <li className="flex items-center justify-between"><span>Estimated savings</span><span className="font-semibold">₹642</span></li>
                <li className="flex items-center justify-between"><span>Delivery</span><span className="font-semibold">6–8 days</span></li>
                <li className="flex items-center justify-between"><span>AI confidence</span><span className="font-semibold">94%</span></li>
              </ul>
            </aside>
          </div>
        </section>

        <section id="engine" className="mt-16">
          <h2 className="text-2xl font-semibold">Autonomous Engine</h2>
          <p className="mt-2 text-zinc-400">The platform operates continuously to optimize sourcing, costs and delivery.</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl p-6 bg-white/4 border border-white/6">
              <div className="font-semibold">Supplier discovery</div>
              <div className="mt-2 text-sm text-zinc-300">Continuous crawling and onboarding of high-quality suppliers.</div>
            </div>
            <div className="rounded-xl p-6 bg-white/4 border border-white/6">
              <div className="font-semibold">Price optimization</div>
              <div className="mt-2 text-sm text-zinc-300">Dynamic pricing and margin recommendations.</div>
            </div>
            <div className="rounded-xl p-6 bg-white/4 border border-white/6">
              <div className="font-semibold">Inventory monitoring</div>
              <div className="mt-2 text-sm text-zinc-300">Realtime stock and supplier availability checks.</div>
            </div>
            <div className="rounded-xl p-6 bg-white/4 border border-white/6">
              <div className="font-semibold">Automated procurement</div>
              <div className="mt-2 text-sm text-zinc-300">Orders placed and reconciled without manual work.</div>
            </div>
            <div className="rounded-xl p-6 bg-white/4 border border-white/6">
              <div className="font-semibold">Shipping tracking</div>
              <div className="mt-2 text-sm text-zinc-300">End-to-end tracking and status updates.</div>
            </div>
            <div className="rounded-xl p-6 bg-white/4 border border-white/6">
              <div className="font-semibold">Profit monitoring</div>
              <div className="mt-2 text-sm text-zinc-300">Automated profit and margin dashboards.</div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-black/40 border border-white/6">
            <div className="text-sm text-zinc-400">AI activity feed</div>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              <li>Supplier price updated</li>
              <li>₹84 cost reduction detected</li>
              <li>Order #AM1024 routed to Supplier B</li>
              <li>Shipment dispatched</li>
              <li>Customer notified</li>
            </ul>
          </div>
        </section>

        <section id="business" className="mt-16">
          <h2 className="text-2xl font-semibold">Business Model</h2>
          <p className="mt-2 text-zinc-400">Customer Price = Product Cost + Shipping + Taxes/Fees + Operating Costs + AutoMart Commission</p>

          <div className="mt-6 p-6 rounded-xl bg-white/4 border border-white/6 max-w-md">
            <div className="grid grid-cols-2 gap-2 text-sm text-zinc-300">
              <div>Product cost</div>
              <div className="text-right">₹1,399</div>
              <div>Shipping</div>
              <div className="text-right">₹149</div>
              <div>Other costs</div>
              <div className="text-right">₹201</div>
              <div>AutoMart commission</div>
              <div className="text-right">₹550</div>
              <div className="font-semibold pt-2">Customer pays</div>
              <div className="text-right font-bold pt-2">₹2,299</div>
            </div>
            <div className="mt-3 text-xs text-zinc-400">Illustrative figures for demonstration purposes only.</div>
          </div>
        </section>

        <section className="mt-16 rounded-2xl bg-gradient-to-r from-indigo-600 to-rose-500 p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">Commerce that runs itself.</h3>
              <p className="mt-2 text-zinc-100/90">Discover. Order. We handle everything else.</p>
            </div>
            <div>
              <a href="#" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-indigo-700 hover:scale-105 transition">Enter AutoMart AI →</a>
            </div>
          </div>
        </section>

        <footer className="mt-12 border-t border-white/6 pt-8 text-zinc-400">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm">© {new Date().getFullYear()} AutoMart AI</div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <a className="hover:text-white" href="#">Products</a>
              <a className="hover:text-white" href="#how">How It Works</a>
              <a className="hover:text-white" href="#engine">AI Engine</a>
              <a className="hover:text-white" href="#about">About</a>
              <a className="hover:text-white" href="#contact">Contact</a>
              <a className="hover:text-white" href="#">Privacy</a>
              <a className="hover:text-white" href="#">Terms</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
