import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse, errorResponse, unauthorizedResponse,
  notFoundResponse, serverErrorResponse, validationErrorResponse
} from '@/lib/security/api-response'
import { captionGenerationSchema } from '@/lib/validation/schemas'
import { generateCaptions } from '@/services/ai/caption-generator'
import type { CaptionGenerationRequest } from '@/types'
import type { Json } from '@/types/database'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ practiceId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { practiceId } = await params

    // 1. Verify practice ownership via RLS
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('*')
      .eq('id', practiceId)
      .maybeSingle()

    if (practiceError || !practice) return notFoundResponse('Practice')

    // 2. Parse and validate request body
    const body = await req.json().catch(() => null)
    if (!body) return errorResponse('Request body is required')

    const parsed = captionGenerationSchema.safeParse({ ...body, practice_id: practiceId })
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues.map(e => e.message).join(', '))
    }

    const generationRequest: CaptionGenerationRequest = parsed.data

    // 3. Check usage limits (server-side enforcement)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!orgMember) return unauthorizedResponse()

    const { count: usageCount } = await supabase
      .from('usage_records')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgMember.organization_id)
      .eq('operation', 'caption_generation')
      .gte('created_at', startOfMonth.toISOString())

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('organization_id', orgMember.organization_id)
      .maybeSingle()

    const plan = subscription?.plan || 'free'
    const limits: Record<string, number> = { free: 10, pro: 200, team: 1000 }
    const limit = limits[plan] || 10

    if ((usageCount || 0) >= limit) {
      return errorResponse(
        `You have reached your monthly caption generation limit (${limit}). Please upgrade your plan.`,
        429,
        'USAGE_LIMIT_EXCEEDED'
      )
    }

    // 4. Fetch voice samples and relevant notes
    const { data: voiceSamples } = await supabase
      .from('voice_samples')
      .select('*')
      .eq('practice_id', practiceId)
      .order('created_at', { ascending: false })
      .limit(10)

    const { data: notes } = await supabase
      .from('knowledge_notes')
      .select('*')
      .eq('practice_id', practiceId)
      .is('archived_at', null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)

    // 5. Generate captions
    const result = await generateCaptions(
      generationRequest,
      practice,
      voiceSamples || [],
      notes || []
    )

    // 6. Save all generated captions as drafts
    const captionInserts = result.captions.map((cap) => ({
      practice_id: practiceId,
      created_by: user.id,
      body: cap.body,
      opening_hook: cap.opening_hook || null,
      call_to_action: cap.call_to_action || null,
      hashtags: cap.hashtags || null,
      platform: cap.platform,
      status: 'draft' as const,
      generation_metadata: {
        model: result.model,
        token_usage: result.usage,
        topic: generationRequest.topic,
        caption_count: generationRequest.caption_count,
      } as unknown as Json,
      safety_flags: cap.safety_flags || null,
      review_required: cap.review_required,
    }))

    const { data: savedCaptions, error: saveError } = await supabase
      .from('captions')
      .insert(captionInserts)
      .select()

    if (saveError) {
      console.error('[Caption Save Error]', saveError)
      return serverErrorResponse(saveError, 'saving captions')
    }

    // 7. Record usage
    await supabase.from('usage_records').insert({
      organization_id: orgMember.organization_id,
      operation: 'caption_generation',
      quantity: result.captions.length,
      model: result.model,
      token_usage: result.usage as unknown as Json,
    })

    // 8. Link source notes
    if (savedCaptions && notes) {
      const sourceLinks = savedCaptions.flatMap((cap, i) => {
        const sourceIds = result.captions[i]?.source_note_ids || []
        return sourceIds.map((noteId) => ({
          caption_id: cap.id,
          knowledge_note_id: noteId,
        }))
      }).filter((link) =>
        notes.some((n) => n.id === link.knowledge_note_id)
      )

      if (sourceLinks.length > 0) {
        await supabase.from('caption_source_notes').insert(sourceLinks)
      }
    }

    return successResponse({ captions: savedCaptions }, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message.includes('API key')) {
      return errorResponse('OpenAI API key is not configured. Please set a valid OPENAI_API_KEY.', 503, 'AI_NOT_CONFIGURED')
    }
    if (message.includes('rate limit') || message.includes('429')) {
      return errorResponse('AI service is temporarily rate-limited. Please try again in a moment.', 429, 'AI_RATE_LIMIT')
    }

    return serverErrorResponse(error, 'caption generation')
  }
}
