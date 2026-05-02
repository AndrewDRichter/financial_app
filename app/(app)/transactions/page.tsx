'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Transaction, TransactionType, Currency } from '@/types'
import TransactionCard from '@/components/TransactionCard'

type TypeFilter = TransactionType | 'all'
type CurrencyFilter = Currency | 'all'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<TypeFilter>('all')
  const [filterCurrency, setFilterCurrency] = useState<CurrencyFilter>('all')

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('transactions')
      .select('*, categories(*)')
      .order('created_at', { ascending: false })

    if (filterType !== 'all') query = query.eq('type', filterType)
    if (filterCurrency !== 'all') query = query.eq('currency', filterCurrency)

    const { data } = await query
    if (data) setTransactions(data as Transaction[])
    setLoading(false)
  }, [filterType, filterCurrency])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  async function handleDelete(id: string) {
    await supabase.from('transactions').delete().eq('id', id)
    fetchTransactions()
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transações</h1>
          <p className="text-gray-500 text-sm mt-1">
            {transactions.length} {transactions.length === 1 ? 'registro' : 'registros'}
          </p>
        </div>
        <Link
          href="/transactions/new"
          className="flex items-center gap-2 bg-gray-900 text-white text-sm py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          + Nova transação
        </Link>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(['all', 'income', 'expense'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-2 text-xs font-medium transition-colors border-r border-gray-200 last:border-r-0 ${
                filterType === t ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {t === 'all' ? 'Todos' : t === 'income' ? '↑ Entradas' : '↓ Saídas'}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(['all', 'PYG', 'USD'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilterCurrency(c)}
              className={`px-3 py-2 text-xs font-medium transition-colors border-r border-gray-200 last:border-r-0 ${
                filterCurrency === c ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {c === 'all' ? 'Moedas' : c === 'PYG' ? '₲ Guarani' : '$ Dólar'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">Nenhuma transação encontrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <TransactionCard key={t.id} transaction={t} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
