// @ts-nocheck
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, unauthorizedResponse, serverErrorResponse, errorResponse } from '@/lib/security/api-response'
import { cancelPostizPost } from '@/services/postiz/postiz-client'
import { decrypt } from '@/lib/security/encryption'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ scheduledPostId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { scheduledPostId } = await params

    // Fetch scheduled post with connection
    const { data: scheduledPost, error } = await supabase
      .from('scheduled_posts')
      .select(`
        *, captions(practice_id),
        social_accounts(social_connections(encrypted_credential, practice_id))
      `)
      .eq('id', scheduledPostId)
      .single()

    if (error || !scheduledPost) return errorResponse('Scheduled post not found', 404)

    if (!['scheduled', 'pending', 'submitted'].includes(scheduledPost.status)) {
      return errorResponse(`Cannot cancel a post with status "${scheduledPost.status}"`, 409)
    }

    // Cancel with Postiz if we have an external ID
    if (scheduledPost.external_post_id) {
      const conn = (scheduledPost as unknown as { social_accounts: { social_connections: { encrypted_credential: string } } }).social_accounts?.social_connections
      if (conn?.encrypted_credential) {
        try {
          const apiKey = decrypt(conn.encrypted_credential)
          await cancelPostizPost(apiKey, scheduledPost.external_post_id)
        } catch (cancelErr) {
          console.warn('[Postiz cancel warning]', cancelErr)
          // Continue — still mark as cancelled locally
        }
      }
    }

    // Mark cancelled in database
    await supabase.from('scheduled_posts').update({ status: 'cancelled' }).eq('id', scheduledPostId)
    await supabase.from('captions').update({ status: 'draft' }).eq('id', scheduledPost.caption_id)

    return successResponse({ cancelled: true, id: scheduledPostId })
  } catch (error) {
    return serverErrorResponse(error, 'cancel scheduled post')
  }
}
