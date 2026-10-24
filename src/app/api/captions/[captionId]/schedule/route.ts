// @ts-nocheck
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse, unauthorizedResponse, notFoundResponse,
  serverErrorResponse, validationErrorResponse, errorResponse
} from '@/lib/security/api-response'
import { schedulePostSchema } from '@/lib/validation/schemas'
import { decrypt } from '@/lib/security/encryption'
import { schedulePostizPost } from '@/services/postiz/postiz-client'
import crypto from 'crypto'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ captionId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { captionId } = await params

    // 1. Parse and validate request
    const body = await req.json().catch(() => null)
    if (!body) return validationErrorResponse('Request body is required')

    const parsed = schedulePostSchema.safeParse({ ...body, caption_id: captionId })
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors.map(e => e.message).join(', '))
    }

    const { social_account_id, scheduled_at, timezone, media_asset_id } = parsed.data

    // 2. Fetch and verify caption ownership (RLS enforced)
    const { data: caption, error: captionError } = await supabase
      .from('captions')
      .select('*')
      .eq('id', captionId)
      .single()

    if (captionError || !caption) return notFoundResponse('Caption')
    if (!['draft', 'failed'].includes(caption.status)) {
      return errorResponse(`Caption status "${caption.status}" cannot be scheduled`, 409, 'INVALID_STATUS')
    }

    // 3. Verify social account and get the connection credential (RLS enforced)
    const { data: socialAccount, error: accountError } = await supabase
      .from('social_accounts')
      .select(`
        id, external_account_id, platform, social_connection_id,
        social_connections(encrypted_credential, connection_status, practice_id)
      `)
      .eq('id', social_account_id)
      .single()

    if (accountError || !socialAccount) return notFoundResponse('Social account')

    const conn = (socialAccount as unknown as {
      social_connections: { encrypted_credential: string; connection_status: string; practice_id: string }
    }).social_connections

    if (!conn || conn.connection_status !== 'active') {
      return errorResponse('Social account connection is not active', 422, 'CONNECTION_INACTIVE')
    }

    if (conn.practice_id !== caption.practice_id) {
      return unauthorizedResponse()
    }

    // 4. Validate scheduled time
    const scheduledDate = new Date(scheduled_at)
    if (scheduledDate <= new Date()) {
      return validationErrorResponse('Scheduled time must be in the future')
    }

    // 5. Get media URL if provided
    let mediaUrl: string | undefined
    if (media_asset_id) {
      const { data: media } = await supabase
        .from('media_assets')
        .select('storage_path, practice_id')
        .eq('id', media_asset_id)
        .single()

      if (!media || media.practice_id !== caption.practice_id) {
        return notFoundResponse('Media asset')
      }

      const { data: signedUrl } = await supabase.storage
        .from('practice-media')
        .createSignedUrl(media.storage_path, 3600)

      mediaUrl = signedUrl?.signedUrl
    }

    // 6. Create a local pending scheduled_post record
    const { data: scheduledPost, error: scheduleError } = await supabase
      .from('scheduled_posts')
      .insert({
        caption_id: captionId,
        social_account_id,
        scheduled_at,
        timezone,
        status: 'pending',
      })
      .select()
      .single()

    if (scheduleError || !scheduledPost) {
      return serverErrorResponse(scheduleError, 'creating scheduled post')
    }

    // 7. Mark caption as scheduling
    await supabase
      .from('captions')
      .update({ status: 'scheduling' })
      .eq('id', captionId)

    // 8. Decrypt credential and submit to Postiz
    const requestReference = crypto.randomUUID()
    const attemptNumber = 1

    // Create attempt record
    await supabase.from('scheduling_attempts').insert({
      scheduled_post_id: scheduledPost.id,
      request_reference: requestReference,
      attempt_number: attemptNumber,
      status: 'pending',
    })

    let apiKey: string
    try {
      apiKey = decrypt(conn.encrypted_credential)
    } catch {
      await revertSchedulingFailure(supabase, scheduledPost.id, captionId, 'DECRYPTION_ERROR', 'Failed to decrypt credentials')
      return serverErrorResponse(null, 'credential decryption')
    }

    try {
      const postizResponse = await schedulePostizPost(
        apiKey,
        socialAccount.external_account_id,
        {
          content: buildPostContent(caption),
          date: scheduled_at,
          ...(mediaUrl ? { media: [{ path: mediaUrl }] } : {}),
          tags: caption.hashtags || [],
        }
      )

      // 9. SUCCESS — update with external post ID
      await supabase.from('scheduled_posts').update({
        status: 'scheduled',
        external_post_id: postizResponse.id,
      }).eq('id', scheduledPost.id)

      await supabase.from('scheduling_attempts').update({
        status: 'success',
      }).eq('scheduled_post_id', scheduledPost.id)
        .eq('attempt_number', attemptNumber)

      await supabase.from('captions').update({ status: 'scheduled' }).eq('id', captionId)

      return successResponse({
        scheduled_post_id: scheduledPost.id,
        external_post_id: postizResponse.id,
        scheduled_at,
        status: 'scheduled',
      }, 201)
    } catch (postizError) {
      // 10. FAILURE — do NOT mark as scheduled
      const errorMessage = postizError instanceof Error ? postizError.message : 'Postiz API error'

      await revertSchedulingFailure(
        supabase,
        scheduledPost.id,
        captionId,
        'POSTIZ_ERROR',
        errorMessage
      )

      await supabase.from('scheduling_attempts').update({
        status: 'failed',
        safe_error_metadata: { code: 'POSTIZ_ERROR', message: 'Provider rejected the request' },
      }).eq('scheduled_post_id', scheduledPost.id)
        .eq('attempt_number', attemptNumber)

      return errorResponse(
        `Failed to schedule post: ${errorMessage}`,
        502,
        'SCHEDULING_FAILED'
      )
    }
  } catch (error) {
    return serverErrorResponse(error, 'schedule post')
  }
}

async function revertSchedulingFailure(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  scheduledPostId: string,
  captionId: string,
  errorCode: string,
  errorMessage: string
) {
  await supabase.from('scheduled_posts').update({
    status: 'failed',
    last_error_code: errorCode,
    last_error_message: errorMessage.substring(0, 500),
  }).eq('id', scheduledPostId)

  await supabase.from('captions').update({ status: 'failed' }).eq('id', captionId)
}

function buildPostContent(caption: { body: string; call_to_action?: string | null }): string {
  const parts = [caption.body]
  if (caption.call_to_action) parts.push(caption.call_to_action)
  return parts.join('\n\n')
}
