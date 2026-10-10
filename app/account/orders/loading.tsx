import ShopHeader from '@/components/shop-header'

export default function OrderHistoryLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#03040a] via-[#07070d] to-[#0b0b10] px-6 py-8 text-zinc-100 antialiased sm:py-12">
      <div className="mx-auto max-w-5xl animate-pulse">
        <ShopHeader />

        <div className="py-8 sm:py-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-white/10" />
              <div className="h-8 w-48 rounded bg-white/10 sm:h-10" />
              <div className="h-4 w-64 rounded bg-white/5" />
            </div>
            <div className="h-10 w-36 rounded-full bg-white/10" />
          </div>

          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl border border-white/5 bg-white/[0.02]" />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
