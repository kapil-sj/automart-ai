import ShopHeader from '@/components/shop-header'

export default function OrderDetailLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#03040a] via-[#07070d] to-[#0b0b10] px-6 py-8 text-zinc-100 antialiased sm:py-12">
      <div className="mx-auto max-w-6xl animate-pulse">
        <ShopHeader />

        <div className="py-8 sm:py-12">
          <div className="h-4 w-48 rounded bg-white/10" />

          <div className="mt-6 h-28 rounded-3xl border border-white/5 bg-white/[0.02]" />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <div className="h-64 rounded-3xl border border-white/5 bg-white/[0.02]" />
              <div className="h-40 rounded-3xl border border-white/5 bg-white/[0.02]" />
            </div>
            <div className="space-y-6">
              <div className="h-56 rounded-3xl border border-white/5 bg-white/[0.02]" />
              <div className="h-28 rounded-2xl border border-white/5 bg-white/[0.02]" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
