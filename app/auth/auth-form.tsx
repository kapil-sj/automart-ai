'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

type AuthMode = 'login' | 'signup'

type AuthFormProps = {
  mode: AuthMode
  notice?: string
  nextPath?: string
}

function getAuthErrorMessage(message: string) {
  if (message.toLowerCase().includes('invalid login credentials')) {
    return 'The email or password is incorrect. Try again or create an account.'
  }

  if (message.toLowerCase().includes('user already registered')) {
    return 'An account with this email already exists. Try signing in instead.'
  }

  return message
}

export default function AuthForm({ mode, notice, nextPath = '/account' }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isSignup = mode === 'signup'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const normalizedEmail = email.trim()
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError('Enter a valid email address.')
      return
    }

    if (password.length < 8) {
      setError('Your password must be at least 8 characters.')
      return
    }

    setIsLoading(true)
    const supabase = createBrowserSupabaseClient()

    const result = isSignup
      ? await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
          },
        })
      : await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })

    if (result.error) {
      setError(getAuthErrorMessage(result.error.message))
      setIsLoading(false)
      return
    }

    if (isSignup && !result.data.session) {
      const nextQuery = nextPath === '/account' ? '' : `&next=${encodeURIComponent(nextPath)}`
      router.replace(`/login?signup=success${nextQuery}`)
      return
    }

    router.replace(nextPath)
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#03040a] via-[#07070d] to-[#0b0b10] px-6 py-8 text-zinc-100 antialiased">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[1fr_0.9fr]">
          <section className="relative hidden min-h-[620px] overflow-hidden border-r border-white/10 p-12 lg:flex lg:flex-col lg:justify-between">
            <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-rose-500/15 blur-3xl" />
            <Link href="/" className="relative flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 via-indigo-500 to-cyan-400 shadow-lg">
                <span className="h-3.5 w-3.5 rounded-full bg-white" />
              </span>
              <span>
                <span className="block text-lg font-semibold">AutoMart AI</span>
                <span className="-mt-0.5 block text-xs text-zinc-400">Autonomous Commerce</span>
              </span>
            </Link>

            <div className="relative max-w-md">
              <p className="text-sm font-semibold tracking-[0.24em] text-rose-400">THE COMMERCE ENGINE</p>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white">
                {isSignup ? 'Start your smarter way to shop.' : 'Welcome back to commerce that runs itself.'}
              </h1>
              <p className="mt-5 text-base leading-7 text-zinc-300">
                One account for product discovery, intelligent sourcing, and every delivery milestone.
              </p>
            </div>

            <p className="relative text-xs uppercase tracking-[0.2em] text-zinc-500">Discover. Order. We handle the rest.</p>
          </section>

          <section className="flex min-h-[620px] flex-col justify-center p-7 sm:p-12">
            <div className="mb-10 lg:hidden">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 via-indigo-500 to-cyan-400 shadow-lg">
                  <span className="h-3 w-3 rounded-full bg-white" />
                </span>
                <span className="text-lg font-semibold">AutoMart AI</span>
              </Link>
            </div>

            <div className="mx-auto w-full max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                {isSignup ? 'Create account' : 'Secure sign in'}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white">{isSignup ? 'Enter the engine.' : 'Good to see you.'}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {isSignup ? 'Create your account to keep your AutoMart AI activity in one place.' : 'Sign in to continue to your AutoMart AI account.'}
              </p>

              {notice && (
                <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-200" role="status">
                  {notice}
                </div>
              )}

              <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-200">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor="password" className="block text-sm font-medium text-zinc-200">Password</label>
                    {isSignup && <span className="text-xs text-zinc-500">8+ characters</span>}
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    minLength={8}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/20"
                    placeholder="Enter your password"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-200" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isLoading ? (isSignup ? 'Creating account...' : 'Signing in...') : isSignup ? 'Create account' : 'Sign in'}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-zinc-400">
                {isSignup ? 'Already have an account?' : 'New to AutoMart AI?'}{' '}
                <Link href={isSignup ? `/login?next=${encodeURIComponent(nextPath)}` : `/signup?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-zinc-100 underline decoration-indigo-400/70 underline-offset-4 transition hover:text-white">
                  {isSignup ? 'Sign in' : 'Create an account'}
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
