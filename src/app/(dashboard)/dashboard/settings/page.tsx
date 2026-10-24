// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import SettingsClient from './SettingsClient'

export const metadata: Metadata = { title: 'Settings — Caption AI' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: practice }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('practices').select('*').limit(1).single(),
  ])

  return <SettingsClient user={user!} profile={profile} practice={practice} />
}
