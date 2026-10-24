import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const getDashboardContext = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError

  if (!user) {
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

  if (practiceResult.error) throw practiceResult.error
  if (profileResult.error) throw profileResult.error

  return {
    supabase,
    user,
    practice: practiceResult.data,
    profile: profileResult.data,
  }
})
