const ALLOWED_EXACT_PATHS = new Set([
  '/account',
  '/account/orders',
  '/cart',
  '/checkout',
  '/products',
])

const ALLOWED_DYNAMIC_PATTERNS = [
  /^\/account\/orders\/[-a-zA-Z0-9_]+$/,
  /^\/products\/[-a-zA-Z0-9_]+$/,
]

export function getSafeNextPath(value: unknown, fallback = '/account'): string {
  const candidate = Array.isArray(value) ? value[0] : value

  if (typeof candidate !== 'string') {
    return fallback
  }

  const trimmed = candidate.trim()

  // Reject non-root-relative, protocol-relative, backslash paths, or control characters
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    trimmed.includes('\\') ||
    /[\x00-\x1F\x7F]/.test(trimmed)
  ) {
    return fallback
  }

  // Reject directory traversal attempts
  if (trimmed.includes('/../') || trimmed.endsWith('/..') || trimmed.includes('/./')) {
    return fallback
  }

  const [pathOnly] = trimmed.split(/[?#]/)
  const normalizedPath =
    pathOnly.length > 1 && pathOnly.endsWith('/') ? pathOnly.slice(0, -1) : pathOnly

  const isAllowed =
    ALLOWED_EXACT_PATHS.has(normalizedPath) ||
    ALLOWED_DYNAMIC_PATTERNS.some((pattern) => pattern.test(normalizedPath))

  return isAllowed ? trimmed : fallback
}
