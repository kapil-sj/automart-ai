export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#03040a] via-[#07070d] to-[#0b0b10] px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-4 w-28 rounded bg-white/10" />
        <div className="mt-6 h-12 max-w-xl rounded bg-white/10" />
        <div className="mt-4 h-5 max-w-lg rounded bg-white/5" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-[420px] rounded-2xl bg-white/5" />)}
        </div>
      </div>
    </main>
  )
}