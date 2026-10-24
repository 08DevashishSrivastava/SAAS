'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Caption } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  draft: '#9CA3AF', scheduling: '#D97706', scheduled: '#D97706',
  published: '#16A34A', failed: '#DC2626', cancelled: '#6B7280',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', scheduling: 'Scheduling…', scheduled: 'Scheduled',
  published: 'Published', failed: 'Failed', cancelled: 'Cancelled',
}

export default function DraftsPage() {
  const [captions, setCaptions] = useState<Caption[]>([])
  const [loading, setLoading] = useState(true)
  const [practiceId, setPracticeId] = useState('')
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('')
  const [editCaption, setEditCaption] = useState<Caption | null>(null)
  const [editBody, setEditBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchCaptions = useCallback(async (pid: string) => {
    setLoading(true)
    const params = new URLSearchParams({ per_page: '50' })
    if (platform) params.set('platform', platform)
    const res = await fetch(`/api/practices/${pid}/captions?${params}`)
    if (res.ok) {
      const json = await res.json()
      setCaptions(json.data?.data || [])
    }
    setLoading(false)
  }, [platform])

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/practices')
      if (res.ok) {
        const json = await res.json()
        const pid = json.data?.[0]?.id
        if (pid) {
          setPracticeId(pid)
          await fetchCaptions(pid)
        }
      }
    }
    init()
  }, [fetchCaptions])

  const filtered = captions.filter(c =>
    !search || c.body.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSaveEdit() {
    if (!editCaption) return
    setSaving(true)
    await fetch(`/api/captions/${editCaption.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: editBody }),
    })
    setSaving(false)
    setEditCaption(null)
    await fetchCaptions(practiceId)
  }

  async function handleDelete(id: string) {
    setDeleteId(null)
    await fetch(`/api/captions/${id}`, { method: 'DELETE' })
    await fetchCaptions(practiceId)
  }

  async function copyCaption(cap: Caption) {
    const parts = [cap.body]
    if (cap.call_to_action) parts.push(cap.call_to_action)
    if (cap.hashtags?.length) parts.push(cap.hashtags.map(h => `#${h}`).join(' '))
    await navigator.clipboard.writeText(parts.join('\n\n'))
    setCopiedId(cap.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1000 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.625rem', marginBottom: '0.25rem' }}>Drafts</h1>
        <p style={{ color: 'var(--color-secondary-text)', fontSize: '0.9375rem' }}>
          All your generated and saved captions. Edit, schedule, or delete.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input"
          style={{ maxWidth: 280 }}
          placeholder="Search captions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="input"
          style={{ maxWidth: 180 }}
          value={platform}
          onChange={e => { setPlatform(e.target.value); if (practiceId) fetchCaptions(practiceId) }}
        >
          <option value="">All platforms</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="general">General</option>
        </select>
        <span style={{ fontSize: '0.875rem', color: 'var(--color-secondary-text)', alignSelf: 'center' }}>
          {filtered.length} caption{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} className="card skeleton" style={{ height: 160 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-secondary-text)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📄</div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-charcoal)', marginBottom: '0.5rem' }}>No drafts yet</h2>
          <p style={{ fontSize: '0.9375rem', maxWidth: 360, margin: '0 auto 1.5rem' }}>
            Generated captions appear here as drafts. Head to Generate Captions to create your first one.
          </p>
          <a href="/dashboard/captions" className="btn btn-primary">✨ Generate captions</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(cap => (
            <div key={cap.id} className="card card-hover" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="badge badge-lavender" style={{ fontSize: '0.6875rem' }}>{cap.platform}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-secondary-text)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLORS[cap.status], display: 'inline-block' }} />
                    {STATUS_LABELS[cap.status]}
                  </span>
                  {cap.review_required && (
                    <span className="badge badge-amber" style={{ fontSize: '0.6875rem' }}>Review suggested</span>
                  )}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary-text)' }}>
                  {new Date(cap.created_at).toLocaleDateString()}
                </span>
              </div>

              <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--color-charcoal)', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {cap.body}
              </p>

              {cap.hashtags && cap.hashtags.length > 0 && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
                  {cap.hashtags.slice(0, 5).map(h => `#${h}`).join(' ')}
                  {cap.hashtags.length > 5 && ` +${cap.hashtags.length - 5} more`}
                </p>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.875rem', borderTop: '1px solid var(--color-border)' }}>
                <button onClick={() => { setEditCaption(cap); setEditBody(cap.body) }} className="btn btn-secondary btn-sm">✏️ Edit</button>
                <button onClick={() => copyCaption(cap)} className="btn btn-ghost btn-sm">
                  {copiedId === cap.id ? '✓ Copied!' : '📋 Copy'}
                </button>
                {cap.status === 'draft' && (
                  <a href="/dashboard/calendar" className="btn btn-ghost btn-sm">📅 Schedule</a>
                )}
                <button onClick={() => setDeleteId(cap.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-red)', marginLeft: 'auto' }}>🗑 Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editCaption && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 640, padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Edit caption</h2>
              <button onClick={() => setEditCaption(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="label">Caption text</label>
              <textarea
                className="input"
                style={{ minHeight: 200, resize: 'vertical' }}
                value={editBody}
                onChange={e => setEditBody(e.target.value)}
              />
            </div>
            <div className="alert alert-warning" style={{ marginBottom: '1rem', fontSize: '0.8125rem' }}>
              <span>⚠</span> Review all captions before publishing. Verify that facts, dates, and claims are accurate.
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditCaption(null)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleSaveEdit} className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Delete caption?</h2>
            <p style={{ color: 'var(--color-secondary-text)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              This action cannot be undone. The caption will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteId(null)} className="btn btn-ghost">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="btn btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
