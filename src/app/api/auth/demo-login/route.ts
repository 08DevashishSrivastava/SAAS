import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  if (process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN !== 'true') {
    return NextResponse.json(
      { error: 'Demo sign-in is currently disabled. Set NEXT_PUBLIC_ENABLE_DEMO_LOGIN=true to enable.' },
      { status: 403 }
    )
  }

  const email = process.env.SUPABASE_DEMO_EMAIL
  const password = process.env.SUPABASE_DEMO_PASSWORD
  if (!email || !password) {
    console.error('[Demo Sign In Error] Demo credentials are not configured in environment.')
    return NextResponse.json(
      { error: 'Demo credentials (SUPABASE_DEMO_EMAIL, SUPABASE_DEMO_PASSWORD) are not configured.' },
      { status: 503 }
    )
  }

  try {
    const supabase = await createClient()
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.error('[Demo Sign In Error]', error.message)
      return NextResponse.json(
        { error: 'Could not sign in to the configured demo account. Please verify credentials or run the seed script.' },
        { status: 401 }
      )
    }

    // Verify practice exists for demo user
    const { data: practice } = await supabase
      .from('practices')
      .select('id, name, onboarding_completed')
      .limit(1)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      user_id: authData.user.id,
      practice_id: practice?.id || null,
      onboarding_completed: practice?.onboarding_completed ?? false,
      session: authData.session,
    })
  } catch (error) {
    console.error('[Demo Sign In Error]', error)
    return NextResponse.json(
      { error: 'Demo sign-in is temporarily unavailable. Please try again.' },
      { status: 500 }
    )
  }
}
