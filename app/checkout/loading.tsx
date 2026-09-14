export default function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#03040a] via-[#07070d] to-[#0b0b10] px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-4 w-28 rounded bg-white/10" />
        <div className="mt-6 h-12 max-w-xl rounded bg-white/10" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="h-[520px] rounded-3xl bg-white/5" />
          <div className="h-[320px] rounded-3xl bg-white/5" />
        </div>
      </div>
    </main>
  )
}
