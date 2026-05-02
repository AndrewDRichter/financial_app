'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Subscription {
  status: string
  current_period_end: string | null
}

export default function BillingPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')
  const [syncMsg, setSyncMsg] = useState('')

  async function loadSubscription() {
    const { data } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .maybeSingle()
    setSubscription(data)
    setLoading(false)
  }

  useEffect(() => { loadSubscription() }, [])

  async function handleSubscribe() {
    setSubscribing(true)
    setError('')
    const res = await fetch('/api/billing/subscribe', { method: 'POST' })
    const json = await res.json()
    if (json.error) { setError(json.error); setSubscribing(false); return }
    window.location.href = json.url
  }

  async function handleSync() {
    setSyncing(true)
    setSyncMsg('')
    setError('')

    const res = await fetch('/api/billing/sync', { method: 'POST' })
    const json = await res.json()

    if (json.active) {
      await loadSubscription()
      router.push('/')
    } else {
      setSyncMsg(json.message ?? 'Pagamento ainda não confirmado.')
    }
    setSyncing(false)
  }

  const isActive =
    subscription?.status === 'active' &&
    subscription.current_period_end != null &&
    new Date(subscription.current_period_end) > new Date()

  const isPending = subscription?.status === 'pending'

  if (loading) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-40" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Assinatura</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie seu plano</p>
      </div>

      {isActive ? (
        <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-gray-900 font-semibold">Plano Pro — Ativo</p>
              <p className="text-gray-500 text-sm">
                Próxima cobrança:{' '}
                {new Date(subscription!.current_period_end!).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-700 underline hover:text-gray-900"
          >
            Voltar para o app →
          </button>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-6 bg-gray-900 text-white">
            <p className="text-sm text-gray-400 mb-1">FinanceApp</p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold">R$ 9,90</span>
              <span className="text-gray-400 mb-1">/mês</span>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {[
              'Registro ilimitado de transações',
              'Categorias personalizadas',
              'Dashboard com saldo total',
              'Conversão Guarani ↔ Dólar',
              'Acesso em qualquer dispositivo',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-emerald-500">✓</span>
                {feature}
              </div>
            ))}
          </div>

          <div className="px-6 pb-6 space-y-3">
            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleSubscribe}
              disabled={subscribing || syncing}
              className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {subscribing ? 'Redirecionando...' : 'Assinar agora — R$ 9,90/mês'}
            </button>

            {isPending && (
              <div className="text-center space-y-1">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="text-sm text-gray-600 underline hover:text-gray-900 disabled:opacity-50"
                >
                  {syncing ? 'Verificando...' : 'Já paguei — verificar pagamento'}
                </button>
                {syncMsg && <p className="text-gray-500 text-xs">{syncMsg}</p>}
              </div>
            )}

            <p className="text-gray-400 text-xs text-center">
              Pagamento via cartão · Cancele quando quiser
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
