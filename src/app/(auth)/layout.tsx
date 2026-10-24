import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — Caption AI',
  description: 'Sign in to your Caption AI account',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'var(--color-bg)' }}>
      <style>{`
        .auth-container {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        .auth-logo {
          display: flex;
          justify-content: center;
        }
        .auth-card {
          width: 100%;
          padding: 2rem;
          box-shadow: var(--shadow-lg);
        }
      `}</style>
      {children}
    </div>
  )
}
