import Link from 'next/link'

export default function ProductNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#03040a] via-[#07070d] to-[#0b0b10] px-6 py-16 text-center text-zinc-100">
      <section className="max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">Product unavailable</p>
        <h1 className="mt-4 text-3xl font-bold text-white">That product is no longer here.</h1>
        <p className="mt-3 text-zinc-400">Explore the current AutoMart collection instead.</p>
        <Link href="/products" className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200">Browse products</Link>
      </section>
    </main>
  )
}