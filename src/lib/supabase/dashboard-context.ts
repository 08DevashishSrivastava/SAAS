import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const getDashboardContext = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { supabase, user: null, practice: null, profile: null }
  }

  const [practiceResult, profileResult] = await Promise.all([
    supabase
      .from('practices')
      .select('id, name, practice_type, specialties, preferred_tone, preferred_topics, timezone, onboarding_completed')
      .limit(1)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle(),
  ])

  if (practiceResult.error) {
    console.warn('[Dashboard Context Warning] Practice lookup error:', practiceResult.error.message)
  }
  if (profileResult.error) {
    console.warn('[Dashboard Context Warning] Profile lookup error:', profileResult.error.message)
  }

  return {
    supabase,
    user,
    practice: practiceResult.data ?? null,
    profile: profileResult.data ?? null,
  }
})
