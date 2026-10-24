'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Practice } from '@/types'
import { PRACTICE_TYPES, WRITING_TONES, SUPPORTED_LANGUAGES, TIMEZONES } from '@/config'

interface Props {
  user: User
  profile: { id: string; full_name: string | null; avatar_url: string | null } | null
  practice: Practice | null
}

export default function SettingsClient({ user, profile, practice }: Props) {
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'practice' | 'password'>('profile')

  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
  })

  const [practiceForm, setPracticeForm] = useState({
    name: practice?.name || '',
    practice_type: practice?.practice_type || '',
    city: practice?.city || '',
    region: practice?.region || '',
    country: practice?.country || '',
    website: practice?.website || '',
    target_audience: practice?.target_audience || '',
    preferred_language: practice?.preferred_language || 'en',
    timezone: practice?.timezone || 'Asia/Kolkata',
    preferred_tone: practice?.preferred_tone || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    password: '', confirm: '',
  })

  async function saveProfile() {
    setSaving(true); setSuccess(''); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('profiles').upsert({ id: user.id, full_name: profileForm.full_name } as any)
    if (err) setError(err.message); else setSuccess('Profile saved successfully.')
    setSaving(false)
  }

  async function savePractice() {
    if (!practice?.id) return
    setSaving(true); setSuccess(''); setError('')
    const res = await fetch(`/api/practices/${practice.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(practiceForm),
    })
    if (!res.ok) { const j = await res.json(); setError(j.error || 'Failed to save') }
    else setSuccess('Practice settings saved.')
    setSaving(false)
  }

  async function savePassword() {
    if (passwordForm.password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (passwordForm.password !== passwordForm.confirm) { setError('Passwords do not match'); return }
    setSaving(true); setSuccess(''); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password: passwordForm.password })
    if (err) setError(err.message); else { setSuccess('Password updated successfully.'); setPasswordForm({ password: '', confirm: '' }) }
    setSaving(false)
  }

  const tabs = [
    { id: 'profile' as const, label: '👤 Profile' },
    { id: 'practice' as const, label: '🏥 Practice' },
    { id: 'password' as const, label: '🔐 Password' },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: 760 }}>
      <h1 style={{ fontSize: '1.625rem', marginBottom: '2rem' }}>Settings</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', background: 'var(--color-bg)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', width: 'fit-content' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setSuccess(''); setError('') }}
            className={`btn btn-sm ${activeTab === t.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontWeight: activeTab === t.id ? 600 : 400 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {success && <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}><span>✓</span> {success}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}><span>⚠</span> {error}</div>}

      <div className="card" style={{ padding: '2rem' }}>
        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div>
            <h2 style={{ fontSize: '1.0625rem', marginBottom: '1.5rem' }}>Your Profile</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <div className="form-group">
                <label className="label">Full name</label>
                <input type="text" className="input" value={profileForm.full_name} onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Email address</label>
                <input type="email" className="input" value={user.email || ''} disabled style={{ opacity: 0.6 }} />
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-secondary-text)' }}>Email cannot be changed.</p>
              </div>
              <button onClick={saveProfile} className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
                {saving ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          </div>
        )}

        {/* Practice tab */}
        {activeTab === 'practice' && (
          <div>
            <h2 style={{ fontSize: '1.0625rem', marginBottom: '1.5rem' }}>Practice Settings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <div className="form-group">
                <label className="label">Practice name</label>
                <input type="text" className="input" value={practiceForm.name} onChange={e => setPracticeForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Practice type</label>
                <select className="input" value={practiceForm.practice_type} onChange={e => setPracticeForm(p => ({ ...p, practice_type: e.target.value }))}>
                  <option value="">Select type…</option>
                  {PRACTICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">City</label>
                  <input type="text" className="input" value={practiceForm.city} onChange={e => setPracticeForm(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">Region / State</label>
                  <input type="text" className="input" value={practiceForm.region} onChange={e => setPracticeForm(p => ({ ...p, region: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Country</label>
                  <input type="text" className="input" value={practiceForm.country} onChange={e => setPracticeForm(p => ({ ...p, country: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">Website</label>
                  <input type="url" className="input" placeholder="https://…" value={practiceForm.website} onChange={e => setPracticeForm(p => ({ ...p, website: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Target audience</label>
                <input type="text" className="input" value={practiceForm.target_audience} onChange={e => setPracticeForm(p => ({ ...p, target_audience: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Writing tone</label>
                <select className="input" value={practiceForm.preferred_tone} onChange={e => setPracticeForm(p => ({ ...p, preferred_tone: e.target.value }))}>
                  <option value="">Select tone…</option>
                  {WRITING_TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Language</label>
                  <select className="input" value={practiceForm.preferred_language} onChange={e => setPracticeForm(p => ({ ...p, preferred_language: e.target.value }))}>
                    {SUPPORTED_LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Timezone</label>
                  <select className="input" value={practiceForm.timezone} onChange={e => setPracticeForm(p => ({ ...p, timezone: e.target.value }))}>
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={savePractice} className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
                {saving ? 'Saving…' : 'Save practice settings'}
              </button>
            </div>
          </div>
        )}

        {/* Password tab */}
        {activeTab === 'password' && (
          <div>
            <h2 style={{ fontSize: '1.0625rem', marginBottom: '1.5rem' }}>Change Password</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <div className="form-group">
                <label className="label">New password</label>
                <input type="password" className="input" placeholder="Min. 8 chars, 1 uppercase, 1 number" value={passwordForm.password} onChange={e => setPasswordForm(p => ({ ...p, password: e.target.value }))} autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label className="label">Confirm new password</label>
                <input type="password" className="input" placeholder="Repeat password" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} autoComplete="new-password" />
              </div>
              <button onClick={savePassword} className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
                {saving ? 'Saving…' : 'Update password'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
