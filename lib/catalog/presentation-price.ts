export const PRESENTATION_CURRENCY = 'INR'

const DEFAULT_PRESENTATION_PRICE = 2299

const presentationPriceOverrides: Record<string, number> = {}

export function getPresentationPrice(_productId: string): number {
  return presentationPriceOverrides[_productId] ?? DEFAULT_PRESENTATION_PRICE
}

export function formatPresentationPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: PRESENTATION_CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount)
}