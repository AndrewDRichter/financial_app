import type { Currency } from '@/types'

export const USD_TO_PYG_RATE = 6400

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'PYG') {
    return `₲ ${amount.toLocaleString('es-PY', { maximumFractionDigits: 0 })}`
  }
  return `$ ${amount.toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount
  if (from === 'PYG') return Math.round(amount / USD_TO_PYG_RATE)
  return Math.round(amount * USD_TO_PYG_RATE)
}

export function parseIntegerInput(value: string): number {
  const digits = value.replace(/\D/g, '')
  return digits ? parseInt(digits, 10) : 0
}

export function formatIntegerInput(value: number): string {
  if (value === 0) return ''
  return value.toLocaleString('es-PY', { maximumFractionDigits: 0 })
}
