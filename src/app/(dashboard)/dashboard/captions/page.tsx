'use client'

import { useState } from 'react'
import type { Metadata } from 'next'
import { CAPTION_PLATFORMS, CAPTION_COUNTS, CAPTION_LENGTHS, EMOJI_PREFERENCES, HASHTAG_PREFERENCES } from '@/config'
import type { Caption } from '@/types'

type CaptionCount = 1 | 3 | 5 | 10

interface FormState {
  topic: string
  additional_instructions: string
  caption_count: CaptionCount
  platform: 'instagram' | 'facebook' | 'general'
  caption_length: 'short' | 'medium' | 'long'
  emoji_preference: 'none' | 'minimal' | 'moderate' | 'heavy'
  hashtag_preference: 'none' | 'minimal' | 'moderate' | 'many'
  cta_preference: string
}

export default function CaptionsPage() {
  const [form, setForm] = useState<FormState>({
    topic: '',
    additional_instructions: '',
    caption_count: 3,
    platform: 'instagram',
    caption_length: 'medium',
    emoji_preference: 'minimal',
    hashtag_preference: 'minimal',
    cta_preference: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [captions, setCaptions] = useState<Caption[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function getPracticeId(): Promise<string | null> {
    const res = await fetch('/api/practices')
    if (!res.ok) return null
    const json = await res.json()
    return json.data?.[0]?.id || null
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setCaptions([])

    const practiceId = await getPracticeId()
    if (!practiceId) {
      setError('No practice found. Please complete onboarding first.')
      setLoading(false)
      return
    }

    const res = await fetch(`/api/practices/${practiceId}/captions/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const json = await res.json()
    if (!res.ok) {
      setError(json.error || 'Failed to generate captions. Please try again.')
      setLoading(false)
      return
    }

    setCaptions(json.data?.captions || [])
    setLoading(false)
  }

  async function copyCaption(cap: Caption) {
    const text = [cap.body, cap.call_to_action, (cap.hashtags || []).map((h: string) => `#${h}`).join(' ')].filter(Boolean).join('\n\n')
    await navigator.clipboard.writeText(text)
    setCopiedId(cap.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1100 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.625rem', marginBottom: '0.25rem' }}>Generate Captions</h1>
        <p style={{ color: 'var(--color-secondary-text)', fontSize: '0.9375rem' }}>
          Describe what you want to post about. The AI will use your practice profile and knowledge bank.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Form panel */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div className="form-group">
              <label className="label">Topic <span style={{ color: 'var(--color-secondary-text)', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Our new digital scanner, June whitening promo..."
                value={form.topic}
                onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="label">Additional instructions <span style={{ color: 'var(--color-secondary-text)', fontWeight: 400 }}>(optional)</span></label>
              <textarea
                className="input"
                style={{ minHeight: 80, resize: 'vertical' }}
                placeholder="Any specific angle, message, or style you want..."
                value={form.additional_instructions}
                onChange={e => setForm(p => ({ ...p, additional_instructions: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="label">Platform</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {CAPTION_PLATFORMS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, platform: p.value as FormState['platform'] }))}
                    className={`btn btn-sm ${form.platform === p.value ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label">Number of captions</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {CAPTION_COUNTS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, caption_count: n }))}
                    className={`btn btn-sm ${form.caption_count === n ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label">Caption length</label>
              <select
                className="input"
                value={form.caption_length}
                onChange={e => setForm(p => ({ ...p, caption_length: e.target.value as FormState['caption_length'] }))}
              >
                {CAPTION_LENGTHS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Emojis</label>
              <select
                className="input"
                value={form.emoji_preference}
                onChange={e => setForm(p => ({ ...p, emoji_preference: e.target.value as FormState['emoji_preference'] }))}
              >
                {EMOJI_PREFERENCES.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Hashtags</label>
              <select
                className="input"
                value={form.hashtag_preference}
                onChange={e => setForm(p => ({ ...p, hashtag_preference: e.target.value as FormState['hashtag_preference'] }))}
              >
                {HASHTAG_PREFERENCES.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
              </select>
            </div>

            {error && (
              <div className="alert alert-error">
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Generating {form.caption_count} caption{form.caption_count > 1 ? 's' : ''}…
                </span>
              ) : `✨ Generate ${form.caption_count} caption${form.caption_count > 1 ? 's' : ''}`}
            </button>
          </form>
        </div>

        {/* Results panel */}
        <div>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Array.from({ length: form.caption_count }).map((_, i) => (
                <div key={i} className="card" style={{ padding: '1.5rem' }}>
                  <div className="skeleton" style={{ height: 16, width: '30%', marginBottom: '1rem' }} />
                  <div className="skeleton" style={{ height: 12, width: '100%', marginBottom: '0.5rem' }} />
                  <div className="skeleton" style={{ height: 12, width: '90%', marginBottom: '0.5rem' }} />
                  <div className="skeleton" style={{ height: 12, width: '80%' }} />
                </div>
              ))}
            </div>
          )}

          {!loading && captions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-secondary-text)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✨</div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--color-charcoal)', marginBottom: '0.5rem' }}>
                Ready to generate
              </h2>
              <p style={{ fontSize: '0.9375rem', maxWidth: 400, margin: '0 auto' }}>
                Fill in the topic (or leave it blank to use your knowledge bank) and hit Generate.
                The AI will use your practice profile and voice samples.
              </p>
            </div>
          )}

          {captions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1rem' }}>
                  {captions.length} caption{captions.length > 1 ? 's' : ''} generated
                </h2>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-secondary-text)' }}>All saved as drafts</span>
              </div>
              {captions.map((cap, i) => (
                <div key={cap.id} className="card ai-glow" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge badge-lavender" style={{ fontSize: '0.6875rem' }}>
                        {cap.platform}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary-text)' }}>
                        Caption {i + 1}
                      </span>
                    </div>
                    {cap.review_required && (
                      <span className="badge badge-amber" style={{ fontSize: '0.6875rem' }}>
                        ⚠ Review before publishing
                      </span>
                    )}
                  </div>

                  {cap.opening_hook && (
                    <p style={{ fontWeight: 600, marginBottom: '0.625rem', fontSize: '0.9375rem', color: 'var(--color-charcoal)' }}>
                      {cap.opening_hook}
                    </p>
                  )}

                  <p className="prose-caption" style={{ marginBottom: cap.call_to_action || (cap.hashtags && cap.hashtags.length > 0) ? '0.875rem' : 0 }}>
                    {cap.body}
                  </p>

                  {cap.call_to_action && (
                    <p style={{ fontStyle: 'italic', color: 'var(--color-secondary-text)', marginBottom: cap.hashtags && cap.hashtags.length > 0 ? '0.625rem' : 0, fontSize: '0.9rem' }}>
                      {cap.call_to_action}
                    </p>
                  )}

                  {cap.hashtags && cap.hashtags.length > 0 && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-primary)', marginBottom: 0 }}>
                      {cap.hashtags.map((h: string) => `#${h}`).join(' ')}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                    <button
                      onClick={() => copyCaption(cap)}
                      className="btn btn-ghost btn-sm"
                    >
                      {copiedId === cap.id ? '✓ Copied!' : '📋 Copy'}
                    </button>
                    <a href={`/dashboard/drafts`} className="btn btn-secondary btn-sm">
                      📄 View in Drafts
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
