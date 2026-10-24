// @ts-nocheck
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/security/api-response'
import { captionUpdateSchema } from '@/lib/validation/schemas'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ captionId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { captionId } = await params

    const { data, error } = await supabase
      .from('captions')
      .select(`*, caption_media(position, media_assets(*))`)
      .eq('id', captionId)
      .single()

    if (error || !data) return successResponse(null, 404)
    return successResponse(data)
  } catch (error) {
    return serverErrorResponse(error, 'GET caption')
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ captionId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { captionId } = await params
    const body = await req.json().catch(() => null)

    const parsed = captionUpdateSchema.partial().safeParse(body || {})
    if (!parsed.success) {
      return successResponse({ error: parsed.error.message }, 422)
    }

    const { data, error } = await supabase
      .from('captions')
      .update(parsed.data)
      .eq('id', captionId)
      .select()
      .single()

    if (error || !data) return successResponse(null, 404)
    return successResponse(data)
  } catch (error) {
    return serverErrorResponse(error, 'PATCH caption')
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ captionId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { captionId } = await params
    const { error } = await supabase.from('captions').delete().eq('id', captionId)
    if (error) return serverErrorResponse(error, 'deleting caption')

    return successResponse({ deleted: true })
  } catch (error) {
    return serverErrorResponse(error, 'DELETE caption')
  }
}
