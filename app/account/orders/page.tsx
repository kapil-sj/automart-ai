import Link from 'next/link'
import { redirect } from 'next/navigation'
import ShopHeader from '@/components/shop-header'
import OrderStatusBadge from '@/components/orders/order-status-badge'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserOrders } from '@/lib/orders/queries'
import { formatPresentationPrice } from '@/lib/catalog/presentation-price'

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  } catch {
    return isoString
  }
}

export default async function OrderHistoryPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/account/orders')
  }

  const orders = await getUserOrders(user.id)

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#03040a] via-[#07070d] to-[#0b0b10] px-6 py-8 text-zinc-100 antialiased sm:py-12">
      <div className="mx-auto max-w-5xl">
        <ShopHeader />

        <div className="py-8 sm:py-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Link href="/account" className="transition hover:text-white">
                  Account
                </Link>
                <span>/</span>
                <span className="text-zinc-200">Orders</span>
              </div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Order History</h1>
              <p className="mt-2 text-sm text-zinc-400">
                View and review all your past and pending AutoMart AI orders.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/30 hover:bg-white/10"
            >
              Browse Catalog
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center sm:py-24">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993z"
                  />
                </svg>
              </div>
              <h2 className="mt-5 text-xl font-bold text-white">No orders placed yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
                You haven&apos;t placed any orders with AutoMart AI yet. Once you complete a checkout, your order will appear here with live status updates.
              </p>
              <div className="mt-8">
                <Link
                  href="/products"
                  className="inline-flex rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-base font-bold text-white sm:text-lg">
                          {order.externalOrderRef}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-zinc-400 sm:text-sm">
                        Placed on {formatDate(order.placedAt || order.createdAt)} · {order.totalItems}{' '}
                        {order.totalItems === 1 ? 'item' : 'items'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-6 border-t border-white/5 pt-4 sm:border-0 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-xs uppercase tracking-wider text-zinc-400">Total</p>
                        <p className="text-lg font-bold text-white sm:text-xl">
                          {formatPresentationPrice(order.totalInr)}
                        </p>
                      </div>

                      <Link
                        href={`/account/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-200 transition group-hover:border-white/30 group-hover:bg-white/10 group-hover:text-white"
                      >
                        View Details
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
