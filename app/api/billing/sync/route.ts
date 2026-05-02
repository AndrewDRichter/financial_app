import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

type CookieEntry = { name: string; value: string; options: Record<string, unknown> }

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fetchAbacateBilling(billingId: string) {
  const res = await fetch(`https://api.abacatepay.com/v1/billing/getOne?id=${billingId}`, {
    headers: { Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}` },
  })
  if (!res.ok) return null
  return res.json()
}

function isPaid(billing: Record<string, unknown> | null): boolean {
  if (!billing?.data) return false
  const status = (billing.data as Record<string, unknown>).status as string
  return ['PAID', 'ACTIVE', 'COMPLETED'].includes(status?.toUpperCase() ?? '')
}

export async function POST(request: NextRequest) {
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

  const body = await request.json().catch(() => ({})) as { billingId?: string }

  // Get existing subscription (if any)
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('abacatepay_billing_id, status')
    .eq('user_id', user.id)
    .maybeSingle()

  // Already active
  if (sub?.status === 'active') {
    return NextResponse.json({ active: true })
  }

  // Determine which billing ID to check
  const billingId = body.billingId?.trim() || sub?.abacatepay_billing_id

  if (!billingId) {
    return NextResponse.json({
      active: false,
      needsBillingId: true,
      message: 'Informe o ID da cobrança para verificar.',
    })
  }

  const billing = await fetchAbacateBilling(billingId)

  if (!isPaid(billing)) {
    return NextResponse.json({
      active: false,
      message: 'Pagamento não confirmado. Verifique se o ID está correto.',
    })
  }

  // Activate — upsert handles both "no record" and "pending record"
  await supabaseAdmin
    .from('subscriptions')
    .upsert(
      {
        user_id: user.id,
        status: 'active',
        abacatepay_billing_id: billingId,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  return NextResponse.json({ active: true })
}
