// @ts-nocheck
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/security/api-response'
import { practiceProfileSchema } from '@/lib/validation/schemas'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ practiceId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { practiceId } = await params
    const { data, error } = await supabase.from('practices').select('*').eq('id', practiceId).single()
    if (error || !data) return notFoundResponse('Practice')
    return successResponse(data)
  } catch (error) {
    return serverErrorResponse(error, 'GET practice')
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ practiceId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { practiceId } = await params
    const body = await req.json().catch(() => null)

    const parsed = practiceProfileSchema.partial().safeParse(body || {})
    if (!parsed.success) return successResponse({ error: parsed.error.message }, 422)

    const { data, error } = await supabase
      .from('practices')
      .update(parsed.data)
      .eq('id', practiceId)
      .select()
      .single()

    if (error || !data) return notFoundResponse('Practice')
    return successResponse(data)
  } catch (error) {
    return serverErrorResponse(error, 'PATCH practice')
  }
}
