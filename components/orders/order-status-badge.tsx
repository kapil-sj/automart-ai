export type OrderStatusBadgeProps = {
  status: string
  className?: string
}

export default function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const normalized = status.toLowerCase().trim()

  let style = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  let label = status

  switch (normalized) {
    case 'pending':
      style = 'bg-amber-400/10 text-amber-300 border-amber-400/20'
      label = 'Pending'
      break
    case 'confirmed':
      style = 'bg-blue-400/10 text-blue-300 border-blue-400/20'
      label = 'Confirmed'
      break
    case 'processing':
    case 'sourced':
    case 'procured':
      style = 'bg-indigo-400/10 text-indigo-300 border-indigo-400/20'
      label = 'Processing'
      break
    case 'shipped':
      style = 'bg-sky-400/10 text-sky-300 border-sky-400/20'
      label = 'Shipped'
      break
    case 'delivered':
      style = 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20'
      label = 'Delivered'
      break
    case 'cancelled':
      style = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
      label = 'Cancelled'
      break
    case 'refunded':
      style = 'bg-rose-400/10 text-rose-300 border-rose-400/20'
      label = 'Refunded'
      break
    default:
      label = status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${style} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  )
}
