import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { createHmac } from 'crypto'

// Service role client — bypasses RLS to update subscriptions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET
  if (!secret) return true // skip in dev if not configured
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  return expected === signature
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-webhook-signature') ?? ''

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const { event: eventType, data } = event

  if (eventType === 'billing.paid' || eventType === 'subscription.renewed') {
    const billingId: string = data?.billing?.id ?? data?.id
    const periodEnd = data?.nextBillingDate
      ? new Date(data.nextBillingDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days fallback

    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('abacatepay_billing_id', billingId)
  }

  if (eventType === 'billing.cancelled' || eventType === 'subscription.cancelled') {
    const billingId: string = data?.billing?.id ?? data?.id

    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('abacatepay_billing_id', billingId)
  }

  return NextResponse.json({ received: true })
}
