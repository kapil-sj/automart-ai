'use client'

import Link from 'next/link'
import { useState } from 'react'
import CartNavLink from '@/components/cart/cart-nav-link'

export default function HomeHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-white/10 bg-[#03040a]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg transition group-hover:scale-105">
            <span className="h-3 w-3 rounded-full bg-white" />
          </div>
          <div>
            <div className="text-lg font-semibold text-white tracking-tight">AutoMart AI</div>
            <div className="text-[11px] text-zinc-400 -mt-0.5">Autonomous Commerce</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm text-zinc-300">
          <Link href="/products" className="hover:text-white transition">
            Products
          </Link>
          <a href="#how" className="hover:text-white transition">
            How It Works
          </a>
          <a href="#engine" className="hover:text-white transition">
            AI Engine
          </a>
          <CartNavLink />
          <Link href="/login" className="hover:text-white transition font-medium">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/20 hover:scale-105 transition-transform"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile Nav Controls */}
        <div className="flex items-center gap-3 md:hidden">
          <CartNavLink className="text-sm text-zinc-300" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 transition hover:bg-white/10"
          >
            {mobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#07070d] px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-4 text-base">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-200 hover:text-white py-1 transition"
            >
              Browse Products
            </Link>
            <a
              href="#how"
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-200 hover:text-white py-1 transition"
            >
              How It Works
            </a>
            <a
              href="#engine"
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-200 hover:text-white py-1 transition"
            >
              AI Engine
            </a>
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-200 hover:text-white py-1 transition"
            >
              View Cart
            </Link>
            <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-white hover:bg-white/5 transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition"
              >
                Create Account
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
