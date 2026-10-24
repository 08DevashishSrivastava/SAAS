// @ts-nocheck
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/security/api-response'
import { practiceProfileSchema } from '@/lib/validation/schemas'

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { data, error } = await supabase
      .from('practices')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) return serverErrorResponse(error, 'GET practices')
    return successResponse(data || [])
  } catch (error) {
    return serverErrorResponse(error, 'GET practices')
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const body = await req.json().catch(() => null)
    const parsed = practiceProfileSchema.safeParse(body || {})
    if (!parsed.success) return successResponse({ error: parsed.error.message }, 422)

    // Get user's org
    const { data: member } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()
    if (!member) return successResponse({ error: 'No organization found' }, 404)

    const { data, error } = await supabase
      .from('practices')
      .insert({ ...parsed.data, organization_id: member.organization_id })
      .select()
      .single()

    if (error) return serverErrorResponse(error, 'POST practice')
    return successResponse(data, 201)
  } catch (error) {
    return serverErrorResponse(error, 'POST practice')
  }
}

