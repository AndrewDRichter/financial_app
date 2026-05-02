'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BillingSuccessPage() {
  const router = useRouter()
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    // Poll for active subscription (webhook may take a few seconds)
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('status', 'active')
        .maybeSingle()

      const isActive =
        data?.status === 'active' &&
        data?.current_period_end != null &&
        new Date(data.current_period_end) > new Date()

      if (isActive) {
        clearInterval(interval)
        router.push('/')
        return
      }

      setAttempts((a) => a + 1)
    }, 2500)

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 w-full max-w-sm text-center shadow-sm">
        <p className="text-4xl mb-4">🎉</p>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Pagamento recebido!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Confirmando seu acesso...
        </p>
        <div className="flex justify-center">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
        {attempts > 8 && (
          <p className="text-gray-400 text-xs mt-6">
            Está demorando mais que o esperado.{' '}
            <button
              onClick={() => router.push('/billing')}
              className="underline text-gray-600"
            >
              Verificar status
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
