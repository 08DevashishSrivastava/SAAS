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

export async function GET() {
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
    if (!parsed.success) return validationErrorResponse(parsed.error.message)

    // Get user's org
    const { data: member } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!member) return notFoundResponse('Organization')

    const { data, error } = await supabase
      .from('practices')
      .insert({
        name: parsed.data.name,
        practice_type: parsed.data.practice_type ?? null,
        specialties: parsed.data.specialties ?? null,
        city: parsed.data.city ?? null,
        region: parsed.data.region ?? null,
        country: parsed.data.country ?? null,
        website: parsed.data.website || null,
        contact_email: parsed.data.contact_email || null,
        contact_phone: parsed.data.contact_phone ?? null,
        target_audience: parsed.data.target_audience ?? null,
        preferred_language: parsed.data.preferred_language || 'en',
        timezone: parsed.data.timezone || 'Asia/Kolkata',
        organization_id: member.organization_id,
      })
      .select()
      .single()

    if (error) return serverErrorResponse(error, 'POST practice')
    return successResponse(data, 201)
  } catch (error) {
    return serverErrorResponse(error, 'POST practice')
  }
}
