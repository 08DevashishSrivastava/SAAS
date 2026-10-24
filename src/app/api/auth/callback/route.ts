import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const otpType = url.searchParams.get('type')
  const requestedNext = url.searchParams.get('next')
  const next = requestedNext && [
    '/dashboard',
    '/onboarding',
    '/reset-password',
    '/sign-in',
  ].includes(requestedNext) ? requestedNext : '/dashboard'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (code || (tokenHash && ['signup', 'email', 'recovery'].includes(otpType ?? ''))) {
    try {
      const supabase = await createClient()
      let authError
      if (code) {
        const result = await supabase.auth.exchangeCodeForSession(code)
        authError = result.error
      } else if (tokenHash && (otpType === 'signup' || otpType === 'email' || otpType === 'recovery')) {
        const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType })
        authError = result.error
      }

      if (!authError) {
        return NextResponse.redirect(new URL(next, appUrl))
      }
      console.error('[Auth Callback Error]', authError.message)
    } catch (error) {
      console.error('[Auth Callback Error]', error)
    }
  }

  const signInUrl = new URL('/sign-in', appUrl)
  signInUrl.searchParams.set('error', 'auth_callback_failed')
  return NextResponse.redirect(signInUrl)
}
