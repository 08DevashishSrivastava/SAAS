'use client'

import { useState, useEffect, useCallback } from 'react'
import { NOTE_CATEGORIES } from '@/config'
import type { KnowledgeNote } from '@/types'

export default function KnowledgeBankPage() {
  const [notes, setNotes] = useState<KnowledgeNote[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [practiceId, setPracticeId] = useState('')
  const [editNote, setEditNote] = useState<KnowledgeNote | null>(null)

  const [form, setForm] = useState({
    title: '', content: '', category: '', tags: '', pinned: false,
  })

  const fetchNotes = useCallback(async (pid: string) => {
    setLoading(true)
    const params = new URLSearchParams({ per_page: '50' })
    if (search) params.set('search', search)
    if (category) params.set('category', category)

    const res = await fetch(`/api/practices/${pid}/notes?${params}`)
    if (res.ok) {
      const json = await res.json()
      setNotes(json.data?.data || [])
    }
    setLoading(false)
  }, [search, category])

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/practices')
      if (res.ok) {
        const json = await res.json()
        const pid = json.data?.[0]?.id
        if (pid) {
          setPracticeId(pid)
          await fetchNotes(pid)
        }
      }
    }
    init()
  }, [fetchNotes])

  function openAdd() {
    setEditNote(null)
    setForm({ title: '', content: '', category: '', tags: '', pinned: false })
    setShowAdd(true)
  }

  function openEdit(note: KnowledgeNote) {
    setEditNote(note)
    setForm({
      title: note.title || '',
      content: note.content,
      category: note.category || '',
      tags: (note.tags || []).join(', '),
      pinned: note.pinned,
    })
    setShowAdd(true)
  }

  async function handleSave() {
    if (!form.content.trim()) return
    setSaving(true)

    const payload = {
      title: form.title || undefined,
      content: form.content,
      category: form.category || undefined,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      pinned: form.pinned,
    }

    if (editNote) {
      await fetch(`/api/notes/${editNote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch(`/api/practices/${practiceId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    setSaving(false)
    setShowAdd(false)
    await fetchNotes(practiceId)
  }

  async function handleArchive(note: KnowledgeNote) {
    await fetch(`/api/notes/${note.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archive: true }),
    })
    await fetchNotes(practiceId)
  }

  async function handleDelete(note: KnowledgeNote) {
    if (!confirm('Delete this note? This cannot be undone.')) return
    await fetch(`/api/notes/${note.id}`, { method: 'DELETE' })
    await fetchNotes(practiceId)
  }

  async function handlePin(note: KnowledgeNote) {
    await fetch(`/api/notes/${note.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: !note.pinned }),
    })
    await fetchNotes(practiceId)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.625rem', marginBottom: '0.25rem' }}>Knowledge Bank</h1>
          <p style={{ color: 'var(--color-secondary-text)', fontSize: '0.9375rem' }}>
            Drop quick thoughts here. The AI uses these notes to write authentic captions about your practice.
          </p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">+ Add note</button>
      </div>

      {/* Disclaimer */}
      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        <span>🔒</span>
        <span>Do not include patient names or identifying health information in your notes.</span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input"
          style={{ maxWidth: 280 }}
          placeholder="Search notes…"
          value={search}
          onChange={e => { setSearch(e.target.value); if (practiceId) fetchNotes(practiceId) }}
        />
        <select
          className="input"
          style={{ maxWidth: 180 }}
          value={category}
          onChange={e => { setCategory(e.target.value); if (practiceId) fetchNotes(practiceId) }}
        >
          <option value="">All categories</option>
          {NOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Notes grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="card skeleton" style={{ height: 140 }} />)}
        </div>
      ) : notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-secondary-text)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📝</div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-charcoal)', marginBottom: '0.5rem' }}>Your knowledge bank is empty</h2>
          <p style={{ fontSize: '0.9375rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
            Add quick thoughts about your practice — promotions, announcements, new staff, equipment updates. The AI uses these in your captions.
          </p>
          <button onClick={openAdd} className="btn btn-primary">Add your first note</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {notes.map((note) => (
            <div key={note.id} className="card card-hover" style={{ padding: '1.25rem', position: 'relative' }}>
              {note.pinned && (
                <span style={{ position: 'absolute', top: 12, right: 12, fontSize: '0.875rem' }}>📌</span>
              )}
              {note.title && (
                <h3 style={{ fontSize: '0.9375rem', marginBottom: '0.375rem', paddingRight: note.pinned ? 24 : 0 }}>
                  {note.title}
                </h3>
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary-text)', lineHeight: 1.6, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {note.content}
              </p>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {note.category && <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>{note.category}</span>}
                {(note.tags || []).slice(0, 2).map(t => (
                  <span key={t} className="badge badge-gray" style={{ fontSize: '0.6875rem' }}>{t}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.375rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                <button onClick={() => openEdit(note)} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Edit</button>
                <button onClick={() => handlePin(note)} className="btn btn-ghost btn-sm" title={note.pinned ? 'Unpin' : 'Pin'}>
                  {note.pinned ? '📌' : '📍'}
                </button>
                <button onClick={() => handleArchive(note)} className="btn btn-ghost btn-sm" title="Archive">🗂</button>
                <button onClick={() => handleDelete(note)} className="btn btn-ghost btn-sm" title="Delete" style={{ color: 'var(--color-red)' }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', margin: 0 }}>{editNote ? 'Edit note' : 'Add note'}</h2>
              <button onClick={() => setShowAdd(false)} className="btn btn-ghost btn-sm" style={{ fontSize: '1.25rem', lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="label">Title <span style={{ color: 'var(--color-secondary-text)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. June Whitening Promotion"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="label">Note *</label>
                <textarea
                  className="input"
                  style={{ minHeight: 120, resize: 'vertical' }}
                  placeholder="Drop your thought here — no formatting needed. e.g. 'We just hired a new hygienist with 8 years of experience in pediatric care.'"
                  value={form.content}
                  onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Category</label>
                  <select
                    className="input"
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  >
                    <option value="">None</option>
                    {NOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Tags <span style={{ color: 'var(--color-secondary-text)', fontWeight: 400 }}>(comma-separated)</span></label>
                  <input
                    type="text"
                    className="input"
                    placeholder="whitening, june, promo"
                    value={form.tags}
                    onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={e => setForm(p => ({ ...p, pinned: e.target.checked }))}
                />
                📌 Pin this note (appears first in caption generation)
              </label>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button onClick={() => setShowAdd(false)} className="btn btn-ghost">Cancel</button>
                <button onClick={handleSave} className="btn btn-primary" disabled={saving || !form.content.trim()}>
                  {saving ? 'Saving…' : 'Save note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
