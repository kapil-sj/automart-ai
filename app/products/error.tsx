'use client'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#03040a] via-[#07070d] to-[#0b0b10] px-6 py-16 text-center text-zinc-100">
      <section className="max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">Catalog unavailable</p>
        <h1 className="mt-4 text-3xl font-bold text-white">We couldn&apos;t load the products.</h1>
        <p className="mt-3 text-zinc-400">Please try again in a moment.</p>
        <button type="button" onClick={reset} className="mt-8 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200">
          Try again
        </button>
      </section>
    </main>
  )
}