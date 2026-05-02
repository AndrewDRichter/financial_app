import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type CookieEntry = { name: string; value: string; options: Record<string, unknown> }

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAbacatePayBilling(billingId: string) {
  const res = await fetch(`https://api.abacatepay.com/v1/billing/getOne?id=${billingId}`, {
    headers: { Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}` },
  })
  if (!res.ok) return null
  return res.json()
}

export async function POST() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs: CookieEntry[]) =>
          cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get pending subscription for this user
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('abacatepay_billing_id, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sub) {
    return NextResponse.json({ active: false, message: 'Nenhuma assinatura encontrada.' })
  }

  if (sub.status === 'active') {
    return NextResponse.json({ active: true })
  }

  if (!sub.abacatepay_billing_id) {
    return NextResponse.json({ active: false, message: 'ID da cobrança não encontrado.' })
  }

  // Check status directly on AbacatePay
  const billing = await getAbacatePayBilling(sub.abacatepay_billing_id)
  const isPaid = billing?.data?.status === 'PAID' || billing?.data?.status === 'ACTIVE'

  if (isPaid) {
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    return NextResponse.json({ active: true })
  }

  return NextResponse.json({ active: false, message: 'Pagamento ainda não confirmado.' })
}
