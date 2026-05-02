import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { createBilling } from '@/lib/abacatepay'

type CookieEntry = { name: string; value: string; options: Record<string, unknown> }

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

  const origin = request.nextUrl.origin

  try {
    const result = await createBilling({
      customerName: user.user_metadata?.full_name ?? user.email ?? 'Usuário',
      customerEmail: user.email!,
      externalId: user.id,
      returnUrl: `${origin}/billing`,
      completionUrl: `${origin}/billing/success`,
    })

    if (result.error || !result.data?.url) {
      return NextResponse.json({ error: result.error ?? 'Erro ao criar cobrança' }, { status: 500 })
    }

    await supabase.from('subscriptions').upsert(
      {
        user_id: user.id,
        status: 'pending',
        abacatepay_billing_id: result.data.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    return NextResponse.json({ url: result.data.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
