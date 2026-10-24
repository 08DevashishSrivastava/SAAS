// @ts-nocheck
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'

export const instant = false

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Check if onboarding is complete
  const { data: practice } = await supabase
    .from('practices')
    .select('id, onboarding_completed')
    .limit(1)
    .single()

  if (!practice?.onboarding_completed) {
    redirect('/onboarding')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

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
