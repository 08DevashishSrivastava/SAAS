import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { getDashboardContext } from '@/lib/supabase/dashboard-context'
import DashboardShell from '@/components/layout/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await connection()
  const { user, practice, profile } = await getDashboardContext()

  if (!user) {
    redirect('/sign-in')
  }

  if (!practice?.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <DashboardShell
      user={user}
      profile={profile}
      practiceId={practice.id}
    >
      {children}
    </DashboardShell>
  )
}
