import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEMO_EMAIL, DEMO_PASSWORD, IS_DEMO_ENABLED } from '@/lib/supabase/config'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const rawRedirect = url.searchParams.get('redirect')
  const redirectTo = rawRedirect?.startsWith('/') && !rawRedirect.startsWith('//')
    ? rawRedirect
    : '/dashboard'

  const email = DEMO_EMAIL
  const password = DEMO_PASSWORD

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.error('[Demo Sign In GET Error]', error.message)
      return NextResponse.redirect(new URL('/sign-in?error=demo_auth_failed', request.url))
    }

    return NextResponse.redirect(new URL(redirectTo, request.url))
  } catch (err) {
    console.error('[Demo Sign In GET Error]', err)
    return NextResponse.redirect(new URL('/sign-in?error=demo_exception', request.url))
  }
}

export async function POST() {
  if (!IS_DEMO_ENABLED) {
    return NextResponse.json(
      { error: 'Demo sign-in is currently disabled.' },
      { status: 403 }
    )
  }

  const email = DEMO_EMAIL
  const password = DEMO_PASSWORD

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
