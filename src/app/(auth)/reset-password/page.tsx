'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [updated, setUpdated] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Your password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }
      setUpdated(true)
      router.replace('/dashboard')
      router.refresh()
    } catch (updateError) {
      console.error('[Password Update Error]', updateError)
      setError('Unable to update your password. Please open the reset link again and retry.')
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
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>Set a new password</h1>
        <p style={{ color: 'var(--color-secondary-text)', fontSize: '0.9375rem', marginBottom: '1.75rem' }}>
          Choose a new password for your account.
        </p>

        {error && <div className="alert alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>{error}</div>}
        {updated ? (
          <p role="status">Your password was updated. Redirecting to your dashboard…</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div className="form-group">
              <label className="label" htmlFor="password">New password</label>
              <input id="password" type="password" className="input" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="confirm-password">Confirm new password</label>
              <input id="confirm-password" type="password" className="input" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--color-secondary-text)' }}>
          <Link href="/sign-in" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
