import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/security/api-response'
import type { Database } from '@/types/database'

type ScheduledPostStatus = Database['public']['Enums']['scheduled_post_status']

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ practiceId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { practiceId } = await params
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = Math.min(parseInt(url.searchParams.get('per_page') || '20'), 100)
    const from = (page - 1) * perPage
    const status = url.searchParams.get('status')

    let query = supabase
      .from('scheduled_posts')
      .select(`
        *,
        captions!inner(id, body, platform, practice_id),
        social_accounts(id, display_name, platform)
      `, { count: 'exact' })
      .eq('captions.practice_id', practiceId)
      .order('scheduled_at', { ascending: true })
      .range(from, from + perPage - 1)

    if (status) query = query.eq('status', status as ScheduledPostStatus)

    const { data, error, count } = await query
    if (error) return serverErrorResponse(error, 'GET scheduled posts')

    return successResponse({
      data: data || [],
      count: count || 0,
      page,
      per_page: perPage,
    })
  } catch (error) {
    return serverErrorResponse(error, 'GET scheduled posts')
  }
}
