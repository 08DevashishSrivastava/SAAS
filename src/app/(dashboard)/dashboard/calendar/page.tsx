'use client'

import { useState, useEffect } from 'react'
import type { ScheduledPost, Caption, SocialAccount } from '@/types'

type ScheduledPostWithRelations = ScheduledPost & {
  captions?: Caption
  social_accounts?: SocialAccount
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#D97706', submitted: '#D97706', scheduled: '#2563EB',
  published: '#16A34A', failed: '#DC2626', cancelled: '#6B7280',
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarPage() {
  const [posts, setPosts] = useState<ScheduledPostWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [practiceId, setPracticeId] = useState('')
  const [selectedPost, setSelectedPost] = useState<ScheduledPostWithRelations | null>(null)
  const today = new Date()
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() })

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/practices')
      if (res.ok) {
        const json = await res.json()
        const pid = json.data?.[0]?.id
        if (pid) {
          setPracticeId(pid)
          await fetchPosts(pid)
        }
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchPosts(pid: string) {
    setLoading(true)
    const res = await fetch(`/api/practices/${pid}/scheduled-posts?per_page=100`)
    if (res.ok) {
      const json = await res.json()
      setPosts(json.data?.data || [])
    }
    setLoading(false)
  }

  async function handleCancel(postId: string) {
    if (!confirm('Cancel this scheduled post?')) return
    await fetch(`/api/scheduled-posts/${postId}/cancel`, { method: 'POST' })
    setSelectedPost(null)
    await fetchPosts(practiceId)
  }

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  const { year, month } = viewDate
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  function getPostsForDay(day: number) {
    return posts.filter(p => {
      const d = new Date(p.scheduled_at)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  function prevMonth() {
    setViewDate(v => {
      if (v.month === 0) return { year: v.year - 1, month: 11 }
      return { year: v.year, month: v.month - 1 }
    })
  }

  function nextMonth() {
    setViewDate(v => {
      if (v.month === 11) return { year: v.year + 1, month: 0 }
      return { year: v.year, month: v.month + 1 }
    })
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1100 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.625rem', marginBottom: '0.25rem' }}>Content Calendar</h1>
        <p style={{ color: 'var(--color-secondary-text)', fontSize: '0.9375rem' }}>
          View and manage all your scheduled social media posts.
        </p>
      </div>

      {/* Calendar header */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button onClick={prevMonth} className="btn btn-ghost btn-sm">← Prev</button>
          <h2 style={{ fontSize: '1.125rem', margin: 0 }}>{monthNames[month]} {year}</h2>
          <button onClick={nextMonth} className="btn btn-ghost btn-sm">Next →</button>
        </div>

        {/* Day names */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--color-border)', marginBottom: '1px' }}>
          {dayNames.map(d => (
            <div key={d} style={{ background: 'var(--color-bg)', padding: '0.625rem 0.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-secondary-text)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--color-border)' }}>
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} style={{ background: 'var(--color-bg)', minHeight: 80 }} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayPosts = getPostsForDay(day)
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

            return (
              <div key={day} style={{
                background: 'var(--color-white)',
                minHeight: 80,
                padding: '0.5rem',
                position: 'relative',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, borderRadius: '50%',
                  fontSize: '0.8125rem', fontWeight: isToday ? 700 : 400,
                  background: isToday ? 'var(--color-primary)' : 'transparent',
                  color: isToday ? 'white' : 'var(--color-charcoal)',
                  marginBottom: '0.25rem',
                }}>
                  {day}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {dayPosts.slice(0, 2).map(post => (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      style={{
                        fontSize: '0.6875rem',
                        padding: '2px 4px',
                        borderRadius: 4,
                        background: `${STATUS_COLORS[post.status] || '#9CA3AF'}18`,
                        color: STATUS_COLORS[post.status] || '#9CA3AF',
                        border: `1px solid ${STATUS_COLORS[post.status] || '#9CA3AF'}40`,
                        cursor: 'pointer',
                        textAlign: 'left',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                      }}
                    >
                      {post.captions?.platform || 'post'}
                    </button>
                  ))}
                  {dayPosts.length > 2 && (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-secondary-text)' }}>
                      +{dayPosts.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-secondary-text)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        ))}
      </div>

      {/* Post detail modal */}
      {selectedPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 520, padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Post details</h2>
              <button onClick={() => setSelectedPost(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge badge-lavender">{selectedPost.captions?.platform || 'post'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: STATUS_COLORS[selectedPost.status] }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLORS[selectedPost.status], display: 'inline-block' }} />
                {selectedPost.status}
              </span>
            </div>

            <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--color-charcoal)', marginBottom: '1rem', background: 'var(--color-bg)', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              {selectedPost.captions?.body}
            </p>

            <div style={{ fontSize: '0.875rem', color: 'var(--color-secondary-text)', marginBottom: '1.25rem' }}>
              <div>📅 Scheduled: <strong style={{ color: 'var(--color-charcoal)' }}>{new Date(selectedPost.scheduled_at).toLocaleString()}</strong></div>
              {selectedPost.social_accounts?.display_name && (
                <div style={{ marginTop: '0.25rem' }}>📱 Account: <strong style={{ color: 'var(--color-charcoal)' }}>{selectedPost.social_accounts.display_name}</strong></div>
              )}
              {selectedPost.external_post_id && (
                <div style={{ marginTop: '0.25rem' }}>🔗 External ID: <code style={{ fontSize: '0.8rem' }}>{selectedPost.external_post_id}</code></div>
              )}
            </div>

            {['scheduled', 'pending', 'submitted'].includes(selectedPost.status) && (
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelectedPost(null)} className="btn btn-ghost">Close</button>
                <button onClick={() => handleCancel(selectedPost.id)} className="btn btn-danger btn-sm">Cancel post</button>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-secondary-text)' }}>
          Loading calendar…
        </div>
      )}
    </div>
  )
}
