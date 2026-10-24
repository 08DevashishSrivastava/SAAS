'use client'

import { useState, useEffect } from 'react'

interface Account {
  id: string
  external_account_id: string
  platform: string
  display_name: string | null
  is_default: boolean
}

interface Connection {
  id: string
  provider: string
  connection_status: string
  social_accounts: Account[]
}

export default function SocialAccountsPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [practiceId, setPracticeId] = useState('')
  const [showConnect, setShowConnect] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')
  const [connectSuccess, setConnectSuccess] = useState(false)

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/practices')
      if (res.ok) {
        const json = await res.json()
        const pid = json.data?.[0]?.id
        if (pid) {
          setPracticeId(pid)
          await fetchConnections(pid)
        }
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchConnections(pid: string) {
    setLoading(true)
    const res = await fetch(`/api/practices/${pid}/social-connections`)
    if (res.ok) {
      const json = await res.json()
      setConnections(json.data || [])
    }
    setLoading(false)
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    setConnectError('')
    setConnecting(true)

    const res = await fetch(`/api/practices/${practiceId}/social-connections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey }),
    })

    const json = await res.json()
    if (!res.ok) {
      setConnectError(json.error || 'Connection failed. Check your API key and try again.')
      setConnecting(false)
      return
    }

    setConnecting(false)
    setConnectSuccess(true)
    setApiKey('')
    setShowConnect(false)
    setConnectSuccess(false)
    await fetchConnections(practiceId)
  }

  async function handleRefresh(connectionId: string) {
    await fetch(`/api/social-connections/${connectionId}/refresh-accounts`, { method: 'POST' })
    await fetchConnections(practiceId)
  }

  async function handleDelete(connectionId: string) {
    if (!confirm('Disconnect this social account? Scheduled posts may be affected.')) return
    await fetch(`/api/social-connections/${connectionId}`, { method: 'DELETE' })
    await fetchConnections(practiceId)
  }

  const totalAccounts = connections.reduce((sum, c) => sum + (c.social_accounts?.length || 0), 0)

  return (
    <div style={{ padding: '2rem', maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.625rem', marginBottom: '0.25rem' }}>Social Accounts</h1>
          <p style={{ color: 'var(--color-secondary-text)', fontSize: '0.9375rem' }}>
            Connect your Postiz account to schedule posts directly from Caption AI.
          </p>
        </div>
        <button onClick={() => { setShowConnect(true); setConnectError('') }} className="btn btn-primary">
          + Connect Postiz
        </button>
      </div>

      {/* How it works info */}
      {connections.length === 0 && !loading && (
        <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>ℹ</span>
          <div>
            <strong>How to connect:</strong> You need a Postiz account with at least one social platform connected.
            Get your Postiz API key from your Postiz dashboard → Settings → API Keys, then paste it below.
          </div>
        </div>
      )}

      {/* Connected accounts */}
      {loading ? (
        <div className="card skeleton" style={{ height: 120 }} />
      ) : connections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-secondary-text)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔗</div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-charcoal)', marginBottom: '0.5rem' }}>No accounts connected</h2>
          <p style={{ fontSize: '0.9375rem', maxWidth: 380, margin: '0 auto 1.5rem' }}>
            Connect Postiz to schedule your captions to Instagram and Facebook without leaving Caption AI.
          </p>
          <button onClick={() => setShowConnect(true)} className="btn btn-primary">Connect Postiz →</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary-text)' }}>
            {totalAccounts} social account{totalAccounts !== 1 ? 's' : ''} connected via Postiz
          </p>
          {connections.map(conn => (
            <div key={conn.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Postiz</span>
                    <span className={`badge ${conn.connection_status === 'active' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.6875rem' }}>
                      {conn.connection_status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-secondary-text)', margin: 0 }}>
                    {conn.social_accounts?.length || 0} social account{(conn.social_accounts?.length || 0) !== 1 ? 's' : ''} synced
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleRefresh(conn.id)} className="btn btn-ghost btn-sm">🔄 Refresh</button>
                  <button onClick={() => handleDelete(conn.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-red)' }}>Disconnect</button>
                </div>
              </div>

              {conn.social_accounts && conn.social_accounts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {conn.social_accounts.map(acc => (
                    <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                      <span style={{ fontSize: '1.125rem' }}>
                        {acc.platform === 'instagram' ? '📸' : acc.platform === 'facebook' ? '👥' : '🌐'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{acc.display_name || acc.external_account_id}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary-text)', textTransform: 'capitalize' }}>{acc.platform}</div>
                      </div>
                      {acc.is_default && <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>Default</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Connect modal */}
      {showConnect && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 480, padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Connect Postiz</h2>
              <button onClick={() => setShowConnect(false)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div className="alert alert-info" style={{ marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <span>ℹ</span>
              <div>
                Get your API key from your{' '}
                <a href="https://postiz.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Postiz dashboard</a>{' '}
                → Settings → API Keys. Your key is encrypted before storage and never returned to the browser.
              </div>
            </div>

            {connectError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <span>⚠</span> {connectError}
              </div>
            )}

            <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="label">Postiz API Key</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Paste your Postiz API key…"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowConnect(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={connecting || !apiKey.trim()}>
                  {connecting ? 'Connecting…' : 'Connect & Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
