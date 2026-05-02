'use client'

import { useState, useEffect } from 'react'
import type { Currency } from '@/types'
import { formatCurrency, convertCurrency, parseIntegerInput, formatIntegerInput } from '@/lib/currency'

interface CurrencyInputProps {
  value: number
  currency: Currency
  onValueChange: (value: number) => void
  onCurrencyChange: (currency: Currency) => void
}

export default function CurrencyInput({ value, currency, onValueChange, onCurrencyChange }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    setDisplayValue(value > 0 ? formatIntegerInput(value) : '')
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const parsed = parseIntegerInput(e.target.value)
    setDisplayValue(parsed > 0 ? formatIntegerInput(parsed) : '')
    onValueChange(parsed)
  }

  const otherCurrency: Currency = currency === 'PYG' ? 'USD' : 'PYG'
  const convertedValue = convertCurrency(value, currency, otherCurrency)

  return (
    <div>
      <div className="flex rounded-lg border border-gray-200 overflow-hidden focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900">
        <button
          type="button"
          onClick={() => onCurrencyChange('PYG')}
          className={`px-3 py-2.5 text-sm font-medium border-r border-gray-200 transition-colors ${
            currency === 'PYG' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
          }`}
        >
          ₲ PYG
        </button>
        <button
          type="button"
          onClick={() => onCurrencyChange('USD')}
          className={`px-3 py-2.5 text-sm font-medium border-r border-gray-200 transition-colors ${
            currency === 'USD' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
          }`}
        >
          $ USD
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder="0"
          className="flex-1 px-3 py-2.5 text-gray-900 text-sm bg-white outline-none min-w-0"
        />
      </div>
      {value > 0 && (
        <p className="text-gray-400 text-xs mt-1.5">
          ≈ {formatCurrency(convertedValue, otherCurrency)}
          <span className="ml-1 opacity-60">(1 USD = 6.400 ₲)</span>
        </p>
      )}
    </div>
  )
}
