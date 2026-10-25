import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
  validationErrorResponse,
} from '@/lib/security/api-response'
import { knowledgeNoteSchema } from '@/lib/validation/schemas'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { noteId } = await params
    const body = await req.json().catch(() => null)
    if (!body) return validationErrorResponse('Request body is required')

    // Handle archive action
    if (body.archive === true) {
      const { data, error } = await supabase
        .from('knowledge_notes')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', noteId)
        .select()
        .maybeSingle()
      if (error || !data) return notFoundResponse('Note')
      return successResponse(data)
    }

    if (body.restore === true) {
      const { data, error } = await supabase
        .from('knowledge_notes')
        .update({ archived_at: null })
        .eq('id', noteId)
        .select()
        .maybeSingle()
      if (error || !data) return notFoundResponse('Note')
      return successResponse(data)
    }

    const parsed = knowledgeNoteSchema.partial().safeParse(body)
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues.map(e => e.message).join(', '))
    }

    const { data, error } = await supabase
      .from('knowledge_notes')
      .update(parsed.data)
      .eq('id', noteId)
      .select()
      .maybeSingle()

    if (error || !data) return notFoundResponse('Note')
    return successResponse(data)
  } catch (error) {
    return serverErrorResponse(error, 'PATCH note')
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { noteId } = await params
    const { error } = await supabase
      .from('knowledge_notes')
      .delete()
      .eq('id', noteId)

    if (error) return serverErrorResponse(error, 'deleting note')

    return successResponse({ deleted: true, id: noteId })
  } catch (error) {
    return serverErrorResponse(error, 'DELETE note')
  }
}
