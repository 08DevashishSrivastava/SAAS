'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/sign-in`,
    })
    if (resetError) { setError(resetError.message); setLoading(false); return }
    setSent(true); setLoading(false)
  }

  if (sent) {
    return (
      <div className="auth-container">
        <div className="card auth-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
          <h1 style={{ fontSize: '1.375rem', marginBottom: '0.75rem' }}>Check your email</h1>
          <p style={{ color: 'var(--color-secondary-text)', lineHeight: 1.65 }}>
            We sent a password reset link to <strong>{email}</strong>.
          </p>
          <Link href="/sign-in" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>Back to Sign In</Link>
        </div>
      </div>
    )
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
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>Reset your password</h1>
        <p style={{ color: 'var(--color-secondary-text)', fontSize: '0.9375rem', marginBottom: '1.75rem' }}>
          Enter your email and we&apos;ll send a reset link.
        </p>
        {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}><span>⚠</span> {error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div className="form-group">
            <label className="label" htmlFor="email">Email address</label>
            <input id="email" type="email" className="input" placeholder="jane@smileclinic.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--color-secondary-text)' }}>
          <Link href="/sign-in" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>← Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
