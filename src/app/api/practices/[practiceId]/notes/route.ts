// @ts-nocheck
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse, unauthorizedResponse, notFoundResponse,
  serverErrorResponse, validationErrorResponse
} from '@/lib/security/api-response'
import { knowledgeNoteSchema } from '@/lib/validation/schemas'

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
    const search = url.searchParams.get('search') || ''
    const category = url.searchParams.get('category') || ''
    const archived = url.searchParams.get('archived') === 'true'
    const from = (page - 1) * perPage

    let query = supabase
      .from('knowledge_notes')
      .select('*', { count: 'exact' })
      .eq('practice_id', practiceId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, from + perPage - 1)

    if (archived) {
      query = query.not('archived_at', 'is', null)
    } else {
      query = query.is('archived_at', null)
    }

    if (category) query = query.eq('category', category)
    if (search) query = query.ilike('content', `%${search}%`)

    const { data, error, count } = await query
    if (error) return serverErrorResponse(error, 'fetching notes')

    return successResponse({
      data: data || [],
      count: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    })
  } catch (error) {
    return serverErrorResponse(error, 'GET notes')
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ practiceId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { practiceId } = await params

    // Verify access via RLS
    const { data: practice } = await supabase
      .from('practices')
      .select('id')
      .eq('id', practiceId)
      .single()
    if (!practice) return notFoundResponse('Practice')

    const body = await req.json().catch(() => null)
    if (!body) return validationErrorResponse('Request body is required')

    const parsed = knowledgeNoteSchema.safeParse(body)
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors.map(e => e.message).join(', '))
    }

    const { data: note, error } = await supabase
      .from('knowledge_notes')
      .insert({ ...parsed.data, practice_id: practiceId })
      .select()
      .single()

    if (error) return serverErrorResponse(error, 'creating note')

    return successResponse(note, 201)
  } catch (error) {
    return serverErrorResponse(error, 'POST note')
  }
}
