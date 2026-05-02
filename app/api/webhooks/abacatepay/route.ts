import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { createHmac } from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET
  if (!secret || secret === 'your-webhook-secret') return true
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  return expected === signature
}

function extractBillingId(data: Record<string, unknown>): string | null {
  const nested = (key: string) => {
    const obj = data[key]
    if (obj && typeof obj === 'object') {
      return (obj as Record<string, unknown>).id as string | undefined
    }
    return undefined
  }
  return nested('billing') ?? nested('checkout') ?? nested('subscription') ?? (data.id as string) ?? null
}

const PAID_EVENTS = [
  'checkout.completed',
  'subscription.completed',
  'subscription.renewed',
  'billing.paid',
  'billing.completed',
]

const CANCELLED_EVENTS = [
  'subscription.cancelled',
  'billing.cancelled',
]

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-webhook-signature') ?? ''

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { event: string; data: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event: eventType, data } = event
  console.log('[AbacatePay webhook]', eventType, JSON.stringify(data))

  const billingId = extractBillingId(data)

  if (!billingId) {
    console.error('[AbacatePay webhook] No billing ID in payload')
    return NextResponse.json({ received: true })
  }

  if (PAID_EVENTS.includes(eventType)) {
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('abacatepay_billing_id', billingId)

    if (error) console.error('[AbacatePay webhook] DB error:', error)
  }

  if (CANCELLED_EVENTS.includes(eventType)) {
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('abacatepay_billing_id', billingId)
  }

  return NextResponse.json({ received: true })
}
