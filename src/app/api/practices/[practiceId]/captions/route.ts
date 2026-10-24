// @ts-nocheck
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/security/api-response'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ practiceId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { practiceId } = await params
    const url = new URL(_req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = Math.min(parseInt(url.searchParams.get('per_page') || '20'), 100)
    const from = (page - 1) * perPage
    const platform = url.searchParams.get('platform')
    const status = url.searchParams.get('status')

    let query = supabase
      .from('captions')
      .select('*', { count: 'exact' })
      .eq('practice_id', practiceId)
      .order('created_at', { ascending: false })
      .range(from, from + perPage - 1)

    if (platform) query = query.eq('platform', platform)
    if (status) query = query.eq('status', status)

    const { data, error, count } = await query
    if (error) return serverErrorResponse(error, 'GET captions')

    return successResponse({
      data: data || [],
      count: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    })
  } catch (error) {
    return serverErrorResponse(error, 'GET captions')
  }
}
