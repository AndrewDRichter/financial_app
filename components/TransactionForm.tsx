'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Category, TransactionType, Currency } from '@/types'
import CurrencyInput from './CurrencyInput'

export default function TransactionForm() {
  const router = useRouter()
  const [type, setType] = useState<TransactionType>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState(0)
  const [currency, setCurrency] = useState<Currency>('PYG')
  const [description, setDescription] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  useEffect(() => { setCategoryId('') }, [type])

  const filteredCategories = categories.filter((c) => c.type === type || c.type === 'both')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || amount <= 0) { setError('Informe um valor válido.'); return }
    if (!categoryId) { setError('Selecione uma categoria.'); return }

    setLoading(true)
    setError('')

    const { error: insertError } = await supabase.from('transactions').insert({
      type,
      category_id: categoryId,
      amount,
      currency,
      description: description.trim() || null,
    })

    setLoading(false)

    if (insertError) {
      setError(`Erro ao salvar: ${insertError.message}`)
      return
    }

    router.push('/transactions')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-gray-900 text-sm font-medium mb-2">Tipo de movimentação</label>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`px-8 py-2.5 text-sm font-medium transition-colors ${
              type === 'income' ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            ↑ Entrada
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`px-8 py-2.5 text-sm font-medium transition-colors border-l border-gray-200 ${
              type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            ↓ Saída
          </button>
        </div>
      </div>

      <div>
        <label className="block text-gray-900 text-sm font-medium mb-2">Categoria</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 cursor-pointer"
        >
          <option value="">Selecione uma categoria...</option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {filteredCategories.length === 0 && (
          <p className="text-gray-400 text-xs mt-1.5">
            Nenhuma categoria disponível.{' '}
            <a href="/categories" className="underline text-gray-700">Cadastre uma.</a>
          </p>
        )}
      </div>

      <div>
        <label className="block text-gray-900 text-sm font-medium mb-2">Valor</label>
        <CurrencyInput value={amount} currency={currency} onValueChange={setAmount} onCurrencyChange={setCurrency} />
      </div>

      <div>
        <label className="block text-gray-900 text-sm font-medium mb-2">
          Descrição <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Adicione detalhes sobre esta movimentação..."
          rows={3}
          className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar transação'}
        </button>
      </div>
    </form>
  )
}
