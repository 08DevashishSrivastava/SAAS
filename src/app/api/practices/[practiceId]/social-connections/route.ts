import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse, unauthorizedResponse, notFoundResponse,
  serverErrorResponse, validationErrorResponse
} from '@/lib/security/api-response'
import { socialConnectionSchema } from '@/lib/validation/schemas'
import { encrypt, CURRENT_KEY_VERSION } from '@/lib/security/encryption'
import { fetchPostizAccounts } from '@/services/postiz/postiz-client'
import type { Json } from '@/types/database'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ practiceId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { practiceId } = await params

    const { data: connections, error } = await supabase
      .from('social_connections')
      .select(`
        id, practice_id, provider, connection_status, created_at, updated_at,
        social_accounts(id, external_account_id, platform, display_name, safe_metadata, is_default)
      `)
      .eq('practice_id', practiceId)

    if (error) return serverErrorResponse(error, 'fetching connections')

    // NEVER return encrypted_credential to the client
    return successResponse(connections || [])
  } catch (error) {
    return serverErrorResponse(error, 'GET social connections')
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

    // Verify practice access via RLS
    const { data: practice } = await supabase
      .from('practices')
      .select('id')
      .eq('id', practiceId)
      .maybeSingle()
    if (!practice) return notFoundResponse('Practice')

    const body = await req.json().catch(() => null)
    if (!body) return validationErrorResponse('Request body is required')

    const parsed = socialConnectionSchema.safeParse(body)
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues.map(e => e.message).join(', '))
    }

    // Test the API key by fetching accounts
    let accounts: Awaited<ReturnType<typeof fetchPostizAccounts>>
    try {
      accounts = await fetchPostizAccounts(parsed.data.api_key)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed'
      return validationErrorResponse(`Could not connect to Postiz: ${message}`)
    }

    // Encrypt the credential before storing
    const encryptedCredential = encrypt(parsed.data.api_key)

    // Upsert the connection (one per practice per provider)
    const { data: connection, error: connError } = await supabase
      .from('social_connections')
      .upsert({
        practice_id: practiceId,
        provider: 'postiz',
        encrypted_credential: encryptedCredential,
        credential_key_version: CURRENT_KEY_VERSION,
        connection_status: 'active',
      }, {
        onConflict: 'practice_id,provider',
      })
      .select()
      .single()

    if (connError || !connection) return serverErrorResponse(connError, 'saving connection')

    // Sync accounts
    for (const acc of accounts) {
      await supabase.from('social_accounts').upsert({
        social_connection_id: connection.id,
        external_account_id: acc.id,
        platform: acc.platform,
        display_name: acc.name,
        safe_metadata: { picture: acc.picture } as unknown as Json,
      }, {
        onConflict: 'social_connection_id,external_account_id',
      })
    }

    // Return connection without credential
    const { data: result } = await supabase
      .from('social_connections')
      .select(`
        id, practice_id, provider, connection_status, created_at,
        social_accounts(id, external_account_id, platform, display_name, safe_metadata, is_default)
      `)
      .eq('id', connection.id)
      .single()

    return successResponse(result, 201)
  } catch (error) {
    return serverErrorResponse(error, 'POST social connection')
  }
}
