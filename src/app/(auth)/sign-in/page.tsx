'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function SignInForm() {
  const searchParams = useSearchParams()
  const requestedRedirect = searchParams.get('redirect')
  const redirectTo = requestedRedirect?.startsWith('/') && !requestedRedirect.startsWith('//')
    ? requestedRedirect
    : '/dashboard'
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [error, setError] = useState(
    searchParams.get('error') === 'auth_callback_failed'
      ? 'This confirmation link could not be verified. It may have expired, already been used, or opened in a different browser. Request a fresh link and open the newest email in the browser where you signed up.'
      : '',
  )
  const [form, setForm] = useState({ email: '', password: '' })

  function handleDemoSignIn() {
    setError('')
    setDemoLoading(true)
    window.location.href = `/api/auth/demo-login?redirect=${encodeURIComponent(redirectTo)}`
  }

  async function handleResendConfirmation() {
    const email = form.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter your email address above to request a fresh confirmation link.')
      return
    }

    setError('')
    setResendMessage('')
    setResendLoading(true)
    try {
      const supabase = createClient()
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
        },
      })
      if (resendError) {
        setError(resendError.message.toLowerCase().includes('rate limit')
          ? 'Supabase is temporarily limiting confirmation emails. Wait a while or configure custom SMTP in Supabase Auth, then try again.'
          : resendError.message)
        return
      }
      setResendMessage('If this account still needs confirmation, a fresh link has been sent. Check your inbox and use the newest email.')
    } catch (resendError) {
      console.error('[Resend Confirmation Error]', resendError)
      setError('Unable to request a new confirmation link. Please try again later.')
    } finally {
      setResendLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const rawEmail = form.email.trim().toLowerCase()
    if (rawEmail === 'demo' || rawEmail.startsWith('demo@') || rawEmail.includes('caption-ai-demo')) {
      await handleDemoSignIn()
      return
    }

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: rawEmail,
        password: form.password,
      })

      if (signInError) {
        const invalidCredentials = signInError.code === 'invalid_credentials'
          || signInError.message.toLowerCase().includes('invalid login credentials')
        setError(invalidCredentials
          ? 'We couldn’t sign you in with that email and password. Check your details, create an account, or reset your password.'
          : signInError.message)
        return
      }

      window.location.href = redirectTo
    } catch (signInError) {
      console.error('[Sign In Error]', signInError)
      setError('Unable to reach the sign-in service. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-logo">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 20 }}>C</div>
          <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-charcoal)' }}>Caption AI</span>
        </Link>
      </div>

      <div className="card auth-card">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>Welcome back</h1>
        <p style={{ color: 'var(--color-secondary-text)', fontSize: '0.9375rem', marginBottom: '1.25rem' }}>
          Sign in to your Caption AI account
        </p>

        {/* ─── Instant Demo Access Box ──────────────────────────────────── */}
        <div style={{
          background: 'var(--color-mint)',
          border: '1.5px solid var(--color-primary-light)',
          padding: '1.125rem',
          borderRadius: '14px',
          marginBottom: '1.5rem',
          textAlign: 'left',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              ⚡ Instant Demo Access
            </span>
            <span className="badge badge-mint" style={{ fontSize: '0.6875rem', fontWeight: 600 }}>No Password Required</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-secondary-text)', margin: '0 0 0.875rem', lineHeight: 1.5 }}>
            Open the live dashboard with pre-loaded dental &amp; medical practice data.
          </p>
          <a
            href={`/api/auth/demo-login?redirect=${encodeURIComponent(redirectTo)}`}
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, textDecoration: 'none' }}
          >
            ⚡ Enter Live Demo Account (1-Click)
          </a>
          <button
            type="button"
            onClick={() => setForm({
              email: 'demo@captionai.com',
              password: 'demo',
            })}
            style={{
              background: 'none', border: 'none', color: 'var(--color-primary)',
              fontSize: '0.75rem', cursor: 'pointer', marginTop: '0.625rem',
              textDecoration: 'underline', width: '100%', textAlign: 'center',
            }}
          >
            Or click here to autofill (demo@captionai.com / demo)
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <span>⚠</span>
            <div>
              {error}{' '}
              {error.startsWith('We couldn’t sign you in') && (
                <>
                  <Link href="/forgot-password" style={{ fontWeight: 600 }}>Reset password</Link>
                  {' or '}
                  <Link href="/sign-up" style={{ fontWeight: 600 }}>create an account</Link>.
                </>
              )}
            </div>
          </div>
        )}
        {searchParams.get('error') === 'auth_callback_failed' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResendConfirmation}
              disabled={resendLoading}
              style={{ width: '100%' }}
            >
              {resendLoading ? 'Requesting link…' : 'Resend confirmation email'}
            </button>
            {resendMessage && (
              <p role="status" style={{ marginTop: '0.75rem', color: 'var(--color-secondary-text)', fontSize: '0.8125rem' }}>
                {resendMessage}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div className="form-group">
            <label className="label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="text"
              inputMode="email"
              className="input"
              placeholder="jane@smileclinic.com (or type 'demo')"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <label className="label" htmlFor="password" style={{ margin: 0 }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)' }}>Forgot password?</Link>
            </div>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="Your password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === 'true' && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={loading || demoLoading}
              onClick={handleDemoSignIn}
              style={{ width: '100%' }}
            >
              {demoLoading ? 'Opening demo…' : 'Sign in with demo account'}
            </button>
            <p style={{ margin: '0.5rem 0 0', textAlign: 'center', color: 'var(--color-secondary-text)', fontSize: '0.75rem' }}>
              Local development only · caption-ai-demo+rhtjqxicgwrnghxmwpmi@example.com
            </p>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--color-secondary-text)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Create one free</Link>
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="auth-container"><div className="card auth-card skeleton" style={{ height: 320 }} /></div>}>
      <SignInForm />
    </Suspense>
  )
}
