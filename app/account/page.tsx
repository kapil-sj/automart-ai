import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import AccountActions from './account-actions'

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await ensureUserProfile(user)

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#03040a] via-[#07070d] to-[#0b0b10] px-6 py-8 text-zinc-100 antialiased">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <section className="w-full rounded-3xl border border-white/10 bg-white/[0.035] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 via-indigo-500 to-cyan-400 shadow-lg">
                  <span className="h-3 w-3 rounded-full bg-white" />
                </span>
                <span className="text-lg font-semibold">AutoMart AI</span>
              </div>
              <p className="mt-12 text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">Your account</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white">Welcome back.</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
                Your account foundation is ready. Product discovery and intelligent commerce tools will appear here as AutoMart AI grows.
              </p>
            </div>
            <AccountActions />
          </div>

          {/* Quick Navigation Cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link
              href="/products"
              className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-indigo-500/10 p-6 transition hover:border-rose-400/60"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-400">
                Discover Products
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">
                Browse Catalog →
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Explore available products and discover something you want to buy.
              </p>
            </Link>

            <Link
              href="/account/orders"
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-white/20"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                Purchases & Activity
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">
                Order History →
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Track your pending and confirmed orders, view details, and review purchased items.
              </p>
            </Link>
          </div>

          <div className="mt-6 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Signed in as</p>
              <p className="mt-2 break-all text-sm text-zinc-200">
                {profile?.display_name ? `${profile.display_name} (${user.email})` : user.email}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Account status</p>
              <p className="mt-2 text-sm text-emerald-300">
                {profile?.role ? `${profile.role.toUpperCase()} active` : 'Authentication active'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
