'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface DashboardShellProps {
  children: React.ReactNode
  user: User
  profile: { full_name: string | null; avatar_url: string | null } | null
  practiceId: string
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/captions', label: 'Generate Captions', icon: '✨' },
  { href: '/dashboard/knowledge-bank', label: 'Knowledge Bank', icon: '📝' },
  { href: '/dashboard/drafts', label: 'Drafts', icon: '📄' },
  { href: '/dashboard/calendar', label: 'Content Calendar', icon: '📅' },
  { href: '/dashboard/social-accounts', label: 'Social Accounts', icon: '🔗' },
]

const bottomNavItems = [
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  { href: '/dashboard/billing', label: 'Billing', icon: '💳' },
]

export default function DashboardShell({ children, user, profile }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40, display: 'none' }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-width)',
        background: 'var(--color-white)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 30,
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 17, flexShrink: 0 }}>C</div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-charcoal)' }}>Caption AI</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.75rem' }}>
          <div style={{ marginBottom: '0.25rem' }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--color-border)', margin: '0.75rem 0' }} />

          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.625rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--color-primary)',
              color: 'white', fontWeight: 700, fontSize: '0.8125rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-secondary-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="sidebar-link"
            style={{ width: '100%', marginTop: '0.25rem', color: 'var(--color-secondary-text)' }}
          >
            <span style={{ fontSize: '1rem' }}>🚪</span>
            <span>{signingOut ? 'Signing out…' : 'Sign out'}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: 'var(--sidebar-width)',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children}
      </main>
    </div>
  )
}
