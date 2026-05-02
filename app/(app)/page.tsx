'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Transaction } from '@/types'
import { formatCurrency, USD_TO_PYG_RATE } from '@/lib/currency'
import StatsCard from '@/components/StatsCard'
import TransactionCard from '@/components/TransactionCard'

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('transactions')
      .select('*, categories(*)')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setTransactions(data as Transaction[])
        setLoading(false)
      })
  }, [])

  function toBasePYG(t: Transaction) {
    return t.currency === 'USD' ? t.amount * USD_TO_PYG_RATE : t.amount
  }

  const totalIncomePYG = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + toBasePYG(t), 0)
  const totalExpensePYG = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + toBasePYG(t), 0)
  const balancePYG = totalIncomePYG - totalExpensePYG
  const recent = transactions.slice(0, 5)

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-100 rounded w-40" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-lg" />)}
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral das suas finanças</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Saldo Total"
          value={formatCurrency(Math.abs(balancePYG), 'PYG')}
          subtitle={`≈ ${formatCurrency(Math.abs(Math.round(balancePYG / USD_TO_PYG_RATE)), 'USD')}`}
          variant={balancePYG >= 0 ? 'income' : 'expense'}
        />
        <StatsCard title="Total Entradas" value={formatCurrency(totalIncomePYG, 'PYG')} variant="income" />
        <StatsCard title="Total Saídas" value={formatCurrency(totalExpensePYG, 'PYG')} variant="expense" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-900 font-medium text-sm">Transações recentes</h2>
        <Link href="/transactions" className="text-gray-400 text-xs hover:text-gray-700 transition-colors">
          Ver todas →
        </Link>
      </div>

      <div className="space-y-2">
        {recent.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">💸</p>
            <p className="text-sm">Nenhuma transação ainda.</p>
            <Link href="/transactions/new" className="inline-block mt-4 text-sm text-gray-700 underline">
              Registrar primeira transação
            </Link>
          </div>
        ) : (
          recent.map((t) => <TransactionCard key={t.id} transaction={t} />)
        )}
      </div>
    </div>
  )
}
