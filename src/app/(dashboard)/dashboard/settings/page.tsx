import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import SettingsClient from './SettingsClient'

export const metadata: Metadata = { title: 'Settings — Caption AI' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const [{ data: profile }, { data: practice }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('practices').select('*').limit(1).maybeSingle(),
  ])

  return <SettingsClient user={user} profile={profile} practice={practice} />
}
