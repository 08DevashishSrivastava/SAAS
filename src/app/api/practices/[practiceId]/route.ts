import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/security/api-response'
import { practiceProfileSchema } from '@/lib/validation/schemas'
import type { Database } from '@/types/database'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ practiceId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { practiceId } = await params
    const { data, error } = await supabase
      .from('practices')
      .select('*')
      .eq('id', practiceId)
      .maybeSingle()

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
    if (!parsed.success) return validationErrorResponse(parsed.error.message)

    const updatePayload: Database['public']['Tables']['practices']['Update'] = {
      name: parsed.data.name,
      practice_type: parsed.data.practice_type,
      specialties: parsed.data.specialties,
      city: parsed.data.city,
      region: parsed.data.region,
      country: parsed.data.country,
      website: parsed.data.website !== undefined ? parsed.data.website || null : undefined,
      contact_email: parsed.data.contact_email !== undefined ? parsed.data.contact_email || null : undefined,
      contact_phone: parsed.data.contact_phone,
      target_audience: parsed.data.target_audience,
      preferred_language: parsed.data.preferred_language,
      timezone: parsed.data.timezone,
    }

    const { data, error } = await supabase
      .from('practices')
      .update(updatePayload)
      .eq('id', practiceId)
      .select()
      .maybeSingle()

    if (error || !data) return notFoundResponse('Practice')
    return successResponse(data)
  } catch (error) {
    return serverErrorResponse(error, 'PATCH practice')
  }
}
