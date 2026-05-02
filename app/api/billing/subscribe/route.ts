import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { createBilling } from '@/lib/abacatepay'

type CookieEntry = { name: string; value: string; options: Record<string, unknown> }

// Admin client bypasses RLS — only used server-side
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const cookieStore = cookies()

  // User client — only used to identify the logged-in user
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
      externalId: user.id,
      returnUrl: `${origin}/billing`,
      completionUrl: `${origin}/billing/success`,
    })

    if (!result?.data?.url) {
      return NextResponse.json({ error: result?.error ?? 'Erro ao criar cobrança' }, { status: 500 })
    }

    // Use admin client to bypass RLS on INSERT
    const { error: dbError } = await supabaseAdmin
      .from('subscriptions')
      .upsert(
        {
          user_id: user.id,
          status: 'pending',
          abacatepay_billing_id: result.data.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (dbError) {
      console.error('[subscribe] DB error:', dbError)
      return NextResponse.json({ error: 'Erro ao salvar assinatura' }, { status: 500 })
    }

    return NextResponse.json({ url: result.data.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
