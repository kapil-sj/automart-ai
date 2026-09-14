import type { CheckoutFieldErrors, ShippingDetails } from './types'

export const DEFAULT_CHECKOUT_COUNTRY = 'India'

const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,79}$/
const INDIA_PIN_PATTERN = /^[1-9][0-9]{5}$/

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function parseShippingDetails(value: unknown): { shipping: ShippingDetails; fieldErrors: CheckoutFieldErrors } {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const countryValue = readString(record.country) || DEFAULT_CHECKOUT_COUNTRY

  const shipping: ShippingDetails = {
    fullName: readString(record.fullName),
    phone: readString(record.phone).replace(/[()\s]/g, ''),
    addressLine1: readString(record.addressLine1),
    addressLine2: readString(record.addressLine2),
    city: readString(record.city),
    state: readString(record.state),
    postalCode: readString(record.postalCode).replace(/\s+/g, ''),
    country: countryValue.toLowerCase() === DEFAULT_CHECKOUT_COUNTRY.toLowerCase() ? DEFAULT_CHECKOUT_COUNTRY : countryValue,
  }

  return { shipping, fieldErrors: validateShippingDetails(shipping) }
}

export function validateShippingDetails(shipping: ShippingDetails): CheckoutFieldErrors {
  const fieldErrors: CheckoutFieldErrors = {}

  if (!NAME_PATTERN.test(shipping.fullName)) {
    fieldErrors.fullName = 'Enter your full name using letters only.'
  }

  if (!isValidIndiaPhone(shipping.phone)) {
    fieldErrors.phone = 'Enter a valid 10-digit Indian mobile number.'
  }

  if (shipping.addressLine1.length < 5 || shipping.addressLine1.length > 120) {
    fieldErrors.addressLine1 = 'Enter a street address of at least 5 characters.'
  }

  if (shipping.addressLine2.length > 120) {
    fieldErrors.addressLine2 = 'Address line 2 must be 120 characters or fewer.'
  }

  if (shipping.city.length < 2 || shipping.city.length > 80) {
    fieldErrors.city = 'Enter a valid city.'
  }

  if (shipping.state.length < 2 || shipping.state.length > 80) {
    fieldErrors.state = 'Enter a valid state.'
  }

  if (!INDIA_PIN_PATTERN.test(shipping.postalCode)) {
    fieldErrors.postalCode = 'Enter a valid 6-digit Indian PIN code.'
  }

  if (shipping.country !== DEFAULT_CHECKOUT_COUNTRY) {
    fieldErrors.country = 'Checkout currently supports delivery within India only.'
  }

  return fieldErrors
}

export function isValidIndiaPhone(phone: string): boolean {
  const compact = phone.replace(/[\s-]/g, '')

  if (/^[6-9]\d{9}$/.test(compact)) {
    return true
  }

  if (/^\+91[6-9]\d{9}$/.test(compact)) {
    return true
  }

  return /^91[6-9]\d{9}$/.test(compact)
}
