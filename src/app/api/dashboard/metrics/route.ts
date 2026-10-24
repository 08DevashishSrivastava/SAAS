import { connection, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/security/api-response'

export async function GET(req: NextRequest) {
  await connection()

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const url = new URL(req.url)
    const practiceId = url.searchParams.get('practice_id')
    if (!practiceId) return successResponse({ error: 'practice_id is required' }, 400)

    // Get practice metrics
    const [
      { count: totalCaptions },
      { count: draftCount },
      { count: scheduledCount },
      { count: publishedCount },
      { data: recentNotes },
      { data: recentCaptions },
      { data: upcomingPosts },
      { data: socialConnection },
    ] = await Promise.all([
      supabase.from('captions').select('*', { count: 'exact', head: true }).eq('practice_id', practiceId),
      supabase.from('captions').select('*', { count: 'exact', head: true }).eq('practice_id', practiceId).eq('status', 'draft'),
      supabase.from('captions').select('*', { count: 'exact', head: true }).eq('practice_id', practiceId).eq('status', 'scheduled'),
      supabase.from('captions').select('*', { count: 'exact', head: true }).eq('practice_id', practiceId).eq('status', 'published'),
      supabase.from('knowledge_notes').select('*').eq('practice_id', practiceId).is('archived_at', null).order('created_at', { ascending: false }).limit(5),
      supabase.from('captions').select('*').eq('practice_id', practiceId).eq('status', 'draft').order('created_at', { ascending: false }).limit(5),
      supabase.from('scheduled_posts').select(`
        *, captions(body, platform), social_accounts(display_name, platform)
      `).in('status', ['scheduled', 'pending']).gte('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }).limit(5),
      supabase.from('social_connections').select('connection_status').eq('practice_id', practiceId).limit(1).single(),
    ])

    return successResponse({
      total_captions: totalCaptions || 0,
      draft_count: draftCount || 0,
      scheduled_count: scheduledCount || 0,
      published_count: publishedCount || 0,
      recent_notes: recentNotes || [],
      recent_captions: recentCaptions || [],
      upcoming_posts: upcomingPosts || [],
      social_connection_status: getConnectionStatus(socialConnection),
    })
  } catch (error) {
    return serverErrorResponse(error, 'dashboard metrics')
  }
}

function getConnectionStatus(value: unknown): 'active' | 'inactive' | 'error' | null {
  if (!value || typeof value !== 'object' || !('connection_status' in value)) {
    return null
  }

  const status = value.connection_status
  return status === 'active' || status === 'inactive' || status === 'error'
    ? status
    : null
}
