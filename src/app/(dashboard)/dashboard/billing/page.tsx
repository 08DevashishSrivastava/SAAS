// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Billing — Caption AI' }

export default async function BillingPage() {
  const supabase = await createClient()

  const { data: member } = await supabase
    .from('organization_members')
    .select('organization_id')
    .limit(1)
    .single()

  const { data: subscription } = member ? await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', member.organization_id)
    .single() : { data: null }

  const { data: usage } = member ? await supabase
    .from('usage_records')
    .select('operation, quantity')
    .eq('organization_id', member.organization_id)
    .gte('created_at', new Date(new Date().setDate(1)).toISOString()) : { data: null }

  const captionUsage = (usage || []).filter(u => u.operation === 'caption_generation').reduce((s, u) => s + (u.quantity || 0), 0)
  const plan = subscription?.plan || 'free'
  const planLimits: Record<string, number> = { free: 10, pro: 200, team: 1000 }
  const limit = planLimits[plan] || 10
  const usagePct = Math.min(100, Math.round((captionUsage / limit) * 100))

  const planColors: Record<string, string> = { free: 'var(--color-secondary-text)', pro: 'var(--color-primary)', team: 'var(--color-lavender)' }

  return (
    <div style={{ padding: '2rem', maxWidth: 760 }}>
      <h1 style={{ fontSize: '1.625rem', marginBottom: '2rem' }}>Billing & Plan</h1>

      {/* Current plan */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
              </h2>
              <span className="badge" style={{ background: `${planColors[plan]}18`, color: planColors[plan], fontSize: '0.75rem' }}>Current plan</span>
            </div>
            <p style={{ color: 'var(--color-secondary-text)', fontSize: '0.9rem', margin: 0 }}>
              {plan === 'free' ? 'Free forever · No credit card required' : `$${plan === 'pro' ? 29 : 79}/month`}
            </p>
          </div>
          {plan === 'free' && (
            <button className="btn btn-primary btn-sm" disabled style={{ cursor: 'not-allowed' }}>
              Upgrade to Pro (Coming soon)
            </button>
          )}
        </div>

        {/* Usage meter */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Caption generations this month</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-secondary-text)' }}>
              {captionUsage} / {limit}
            </span>
          </div>
          <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${usagePct}%`,
              background: usagePct >= 90 ? 'var(--color-red)' : usagePct >= 70 ? 'var(--color-amber)' : 'var(--color-primary)',
              transition: 'width 0.4s ease',
            }} />
          </div>
          {usagePct >= 80 && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-amber)', marginTop: '0.5rem' }}>
              ⚠ You&apos;re at {usagePct}% of your monthly limit. Resets on the 1st of next month.
            </p>
          )}
        </div>
      </div>

      {/* Plan comparison */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.0625rem', marginBottom: '1.25rem' }}>Available Plans</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { name: 'Free', price: '$0/mo', gens: '10 generations', notes: '20 notes', social: '—' },
            { name: 'Pro', price: '$29/mo', gens: '200 generations', notes: '500 notes', social: '✓ Scheduling' },
            { name: 'Team', price: '$79/mo', gens: '1,000 generations', notes: '2,000 notes', social: '✓ 5 practices' },
          ].map(p => (
            <div key={p.name} style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', border: p.name.toLowerCase() === plan ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', background: p.name.toLowerCase() === plan ? 'var(--color-mint)' : 'var(--color-white)' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary-text)', marginBottom: '0.75rem' }}>{p.price}</div>
              <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--color-charcoal)' }}>
                <div>{p.gens}</div>
                <div>{p.notes}</div>
                <div>{p.social}</div>
              </div>
              {p.name.toLowerCase() === plan && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)' }}>← Current plan</div>
              )}
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-secondary-text)', marginTop: '1rem' }}>
          Paid plans coming soon. Your free usage limits reset on the 1st of each month.
        </p>
      </div>

      {/* Subscription details */}
      {subscription && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.0625rem', marginBottom: '1rem' }}>Subscription Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
            <Row label="Plan" value={subscription.plan} />
            <Row label="Status" value={subscription.status} />
            <Row label="Started" value={new Date(subscription.created_at).toLocaleDateString()} />
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.625rem', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ color: 'var(--color-secondary-text)' }}>{label}</span>
      <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{value}</span>
    </div>
  )
}
