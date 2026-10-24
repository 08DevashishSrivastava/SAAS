import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  if (
    process.env.NODE_ENV !== 'development'
    || process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN !== 'true'
  ) {
    return NextResponse.json({ error: 'Demo sign-in is available only in local development.' }, { status: 404 })
  }

  const email = process.env.SUPABASE_DEMO_EMAIL
  const password = process.env.SUPABASE_DEMO_PASSWORD
  if (!email || !password) {
    console.error('[Demo Sign In Error] Demo credentials are not configured.')
    return NextResponse.json({ error: 'Local demo credentials are not configured.' }, { status: 503 })
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('[Demo Sign In Error]', error.message)
      return NextResponse.json({ error: 'Could not sign in to the local demo account.' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Demo Sign In Error]', error)
    return NextResponse.json({ error: 'Demo sign-in is temporarily unavailable.' }, { status: 500 })
  }
}
