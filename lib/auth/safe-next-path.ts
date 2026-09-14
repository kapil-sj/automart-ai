const ALLOWED_NEXT_PATHS = new Set(['/account', '/cart', '/checkout', '/products'])

export function getSafeNextPath(value: unknown, fallback = '/account'): string {
  const candidate = Array.isArray(value) ? value[0] : value

  if (typeof candidate !== 'string') {
    return fallback
  }

  return ALLOWED_NEXT_PATHS.has(candidate) ? candidate : fallback
}
