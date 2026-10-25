import Link from 'next/link'
import { connection } from 'next/server'
import type { Metadata } from 'next'
import { getDashboardContext } from '@/lib/supabase/dashboard-context'
import StreakStats from '@/components/dashboard/streak-stats'
import ActivityHeatmap from '@/components/dashboard/activity-heatmap'
import TodaysTopic from '@/components/dashboard/todays-topic'
import {
  getActivityStats,
  getDateKeyInTimeZone,
  type DailyActivity,
} from '@/lib/dashboard/streaks'
import { getCuratedTopic } from '@/services/ai/topic-generator'

export const metadata: Metadata = { title: 'Dashboard Overview — Caption AI' }

export default async function DashboardPage() {
  await connection()
  const { supabase, user, practice } = await getDashboardContext()

  const practiceId = practice?.id

  const [
    { count: totalCaptions },
    { count: draftCount },
    { count: scheduledCount },
    { count: notesCount },
    { data: recentCaptions },
    { data: recentNotes },
    { data: socialConn },
    { data: activityRows, error: activityError },
  ] = await Promise.all([
    supabase.from('captions').select('*', { count: 'exact', head: true }).eq('practice_id', practiceId || ''),
    supabase.from('captions').select('*', { count: 'exact', head: true }).eq('practice_id', practiceId || '').eq('status', 'draft'),
    supabase.from('captions').select('*', { count: 'exact', head: true }).eq('practice_id', practiceId || '').eq('status', 'scheduled'),
    supabase.from('knowledge_notes').select('*', { count: 'exact', head: true }).eq('practice_id', practiceId || '').is('archived_at', null),
    supabase.from('captions').select('*').eq('practice_id', practiceId || '').order('created_at', { ascending: false }).limit(4),
    supabase.from('knowledge_notes').select('*').eq('practice_id', practiceId || '').is('archived_at', null).order('created_at', { ascending: false }).limit(3),
    supabase.from('social_connections').select('connection_status').eq('practice_id', practiceId || '').limit(1).maybeSingle(),
    practiceId
      ? supabase.rpc('caption_activity_by_day', {
          p_practice_id: practiceId,
          p_timezone: practice?.timezone || 'UTC',
        })
      : Promise.resolve({ data: [] as { activity_date: string; caption_count: number }[], error: null }),
  ])

  if (activityError) console.error('[Dashboard Activity Error]', activityError.message)
  const activity: DailyActivity[] = (activityRows ?? []).map((row) => ({
    date: row.activity_date,
    count: Number(row.caption_count),
  }))
  const timeZone = practice?.timezone || 'UTC'
  const stats = getActivityStats(activity, getDateKeyInTimeZone(new Date(), timeZone))
  const todayTopic = getCuratedTopic({
    practiceType: practice?.practice_type || null,
    specialties: practice?.specialties || null,
  })

  const metrics = [
    { label: 'Total Captions', value: totalCaptions || 0, icon: '✨', color: 'var(--color-lavender)' },
    { label: 'Drafts', value: draftCount || 0, icon: '📄', color: 'var(--color-amber)' },
    { label: 'Scheduled Posts', value: scheduledCount || 0, icon: '📅', color: 'var(--color-primary)' },
    { label: 'Knowledge Notes', value: notesCount || 0, icon: '📝', color: 'var(--color-forest)' },
  ]

  const statusColors: Record<string, string> = {
    draft: '#9CA3AF', scheduling: '#D97706', scheduled: '#D97706',
    published: '#16A34A', failed: '#DC2626', cancelled: '#6B7280',
  }

  return (
    <div className="dashboard-page-container" style={{ padding: '2rem', maxWidth: 1200, width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.625rem', marginBottom: '0.25rem' }}>
          Good {getGreeting()}, {user?.email?.split('@')[0]} 👋
        </h1>
        <p style={{ color: 'var(--color-secondary-text)', fontSize: '0.9375rem' }}>
          {practice?.name || 'Your Practice'} · Here&apos;s your content overview
        </p>
      </div>

      {/* Social connection alert */}
      {!socialConn && (
        <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🔗</span>
          <div>
            <strong>Connect your social accounts</strong> to schedule posts directly from Caption AI.{' '}
            <Link href="/dashboard/social-accounts" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Set up now →</Link>
          </div>
        </div>
      )}

      <section className="dashboard-activity">
        <div className="dashboard-activity-title">
          <div>
            <span className="dashboard-activity-eyebrow">CONSISTENCY COUNTS</span>
            <h2>Your caption streak</h2>
          </div>
          {activityError && <p role="status">Activity is unavailable right now.</p>}
        </div>
        <StreakStats stats={stats} />
        <ActivityHeatmap activity={activity} timeZone={timeZone} />
        {practiceId && <TodaysTopic practiceId={practiceId} initialTopic={todayTopic} />}
      </section>

      {/* Metrics */}
      <div className="dashboard-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {metrics.map((m) => (
          <div key={m.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${m.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
              {m.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-charcoal)', lineHeight: 1 }}>{m.value}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary-text)', marginTop: '0.25rem' }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.0625rem', marginBottom: '1rem' }}>Quick actions</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/dashboard/captions" className="btn btn-primary">✨ Generate captions</Link>
          <Link href="/dashboard/knowledge-bank" className="btn btn-secondary">📝 Add a thought</Link>
          <Link href="/dashboard/drafts" className="btn btn-ghost">📄 View drafts</Link>
          {!socialConn && <Link href="/dashboard/social-accounts" className="btn btn-ghost">🔗 Connect social</Link>}
        </div>
      </div>

      {/* Recent captions + notes */}
      <div className="dashboard-split-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent captions */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>Recent Captions</h2>
            <Link href="/dashboard/drafts" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)' }}>View all →</Link>
          </div>
          {recentCaptions && recentCaptions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentCaptions.map((cap) => (
                <div key={cap.id} style={{ padding: '0.875rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <span className="badge badge-lavender" style={{ fontSize: '0.6875rem' }}>{cap.platform}</span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[cap.status] || '#9CA3AF', display: 'inline-block', marginTop: 4 }} />
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {cap.body}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-secondary-text)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>No captions yet.</p>
              <Link href="/dashboard/captions" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)' }}>Generate your first caption →</Link>
            </div>
          )}
        </div>

        {/* Recent notes */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>Recent Notes</h2>
            <Link href="/dashboard/knowledge-bank" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)' }}>View all →</Link>
          </div>
          {recentNotes && recentNotes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentNotes.map((note) => (
                <div key={note.id} style={{ padding: '0.875rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  {note.title && <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{note.title}</div>}
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-secondary-text)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {note.content}
                  </p>
                  {note.category && <span className="badge badge-primary" style={{ fontSize: '0.6875rem', marginTop: '0.375rem' }}>{note.category}</span>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-secondary-text)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>No notes yet.</p>
              <Link href="/dashboard/knowledge-bank" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)' }}>Add your first thought →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
