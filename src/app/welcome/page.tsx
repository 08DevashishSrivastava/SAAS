'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function MobileWelcomePage() {
  const [error] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeSession, setActiveSession] = useState<{ email?: string } | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  const demoEmail = 'caption-ai-demo+rhtjqxicgwrnghxmwpmi@example.com'
  const demoPassword = 'CaptionDemo!2026-z9L8zwORKnvxl3jRm0g61ReUvcw-15Xb'

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setActiveSession({ email: user.email })
        }
      } catch (err) {
        console.warn('Session check warning:', err)
      } finally {
        setCheckingSession(false)
      }
    }
    checkAuth()
  }, [])

  function copyCredentials() {
    navigator.clipboard?.writeText(`Email: ${demoEmail}\nPassword: ${demoPassword}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #091C14 0%, #0F2D20 50%, #163B2B 100%)',
      color: '#FFFFFF',
      fontFamily: 'inherit',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '1.25rem 1rem 1.75rem',
      boxSizing: 'border-box',
    }}>
      {/* ─── Top Mobile App Bar ────────────────────────────────────────────── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            fontSize: 22,
            fontWeight: 800,
            color: '#FFFFFF',
          }}>
            C
          </div>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Caption AI
            </div>
            <div style={{ fontSize: '0.75rem', color: '#A7F3D0', fontWeight: 500 }}>
              Clinical Marketing Suite
            </div>
          </div>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 20,
          padding: '0.3125rem 0.625rem',
          fontSize: '0.6875rem',
          color: '#6EE7B7',
          fontWeight: 600,
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 8px #10B981',
          }} />
          Mobile App
        </div>
      </header>

      {/* ─── Main Hero Card & Features ────────────────────────────────────── */}
      <main style={{ margin: '1.25rem 0' }}>
        {/* Active Session Notice if logged in */}
        {!checkingSession && activeSession && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1.5px solid #10B981',
            borderRadius: 16,
            padding: '1rem',
            marginBottom: '1.25rem',
          }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#A7F3D0', marginBottom: '0.25rem' }}>
              ✓ You are already signed in
            </div>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: '#D1FAE5' }}>
              {activeSession.email}
            </p>
            <Link
              href="/dashboard"
              style={{
                display: 'block',
                background: '#10B981',
                color: '#062016',
                textAlign: 'center',
                padding: '0.75rem',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: '0.9375rem',
                textDecoration: 'none',
              }}
            >
              Go to Dashboard →
            </Link>
          </div>
        )}

        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            lineHeight: 1.25,
            margin: '0 0 0.5rem',
            letterSpacing: '-0.025em',
          }}>
            Social Captions in <span style={{ color: '#34D399' }}>Your Voice</span>
          </h1>
          <p style={{
            fontSize: '0.9375rem',
            color: '#D1D5DB',
            lineHeight: 1.5,
            margin: '0 auto',
            maxWidth: 340,
          }}>
            Built specifically for dental &amp; medical clinics. Turn daily patient moments into engaging social posts.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '0.625rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 14,
            padding: '0.875rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
          }}>
            <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>⚡</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF' }}>Instant AI Captions</div>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Customized for Instagram, Facebook, and LinkedIn</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 14,
            padding: '0.875rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
          }}>
            <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF' }}>Clinical &amp; HIPAA Safe</div>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>No hallucinated medical claims or patient privacy leaks</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 14,
            padding: '0.875rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
          }}>
            <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>📅</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF' }}>30-Day Content Planner</div>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Schedule treatments, hygiene advice &amp; seasonal offers</div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            color: '#FCA5A5',
            padding: '0.75rem 1rem',
            borderRadius: 12,
            fontSize: '0.8125rem',
            marginBottom: '1rem',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* ─── Primary Action Buttons ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Main 1-Tap Demo Button */}
          <a
            href="/api/auth/demo-login?redirect=/dashboard"
            style={{
              width: '100%',
              padding: '1.0625rem 1rem',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#042217',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '1.0625rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.1875rem',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s ease',
              minHeight: 56,
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚡</span>
              <span>1-Tap Demo Access (Instant)</span>
            </div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, opacity: 0.85 }}>
              No Password Needed · Opens Practice Dashboard Directly
            </span>
          </a>

          {/* Standard Sign In & Sign Up buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <Link
              href="/sign-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.875rem 0.5rem',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.875rem',
                textDecoration: 'none',
                minHeight: 48,
              }}
            >
              Sign In
            </Link>

            <Link
              href="/sign-up"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.875rem 0.5rem',
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34D399',
                fontWeight: 600,
                fontSize: '0.875rem',
                textDecoration: 'none',
                minHeight: 48,
              }}
            >
              Create Practice
            </Link>
          </div>
        </div>

        {/* ─── Demo Credentials Helper Card ─────────────────────────────────── */}
        <div style={{
          marginTop: '1.25rem',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: '0.875rem 1rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>
              Demo Clinic Credentials
            </span>
            <button
              type="button"
              onClick={copyCredentials}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#34D399',
                fontSize: '0.6875rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {copied ? '✓ Copied!' : 'Copy Info'}
            </button>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#D1D5DB', lineHeight: 1.5 }}>
            <div><strong>Email:</strong> demo@captionai.com (or type &quot;demo&quot;)</div>
            <div style={{ marginTop: '0.25rem' }}><strong>Password:</strong> demo</div>
          </div>
        </div>

        {/* ─── Direct APK Download Button ──────────────────────────────────── */}
        <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
          <a
            href="/CaptionAI.apk"
            download="CaptionAI.apk"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              color: '#6EE7B7',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'underline',
              padding: '0.5rem',
            }}
          >
            📥 Direct Download CaptionAI.apk to this Phone
          </a>
        </div>
      </main>

      {/* ─── Bottom Footer Switcher ───────────────────────────────────────── */}
      <footer style={{
        textAlign: 'center',
        paddingTop: '0.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <Link
          href="/"
          style={{
            color: '#9CA3AF',
            fontSize: '0.75rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          View Full Desktop Website →
        </Link>
      </footer>
    </div>
  )
}
