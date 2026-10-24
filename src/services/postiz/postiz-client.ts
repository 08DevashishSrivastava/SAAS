/**
 * Postiz API integration service.
 *
 * IMPORTANT: All calls to Postiz are made server-side only.
 * The Postiz API key is decrypted from the database and never returned to the browser.
 *
 * Reference: https://docs.postiz.com/api-reference
 * Check the official Postiz API docs for the specific version you are using.
 */

import type { PostizAccount, PostizScheduleRequest, PostizScheduleResponse } from '@/types'

class PostizApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'PostizApiError'
  }
}

function getBaseUrl(): string {
  const base = process.env.POSTIZ_API_BASE_URL
  if (!base || base.includes('placeholder')) {
    throw new PostizApiError(
      'POSTIZ_API_BASE_URL is not configured. Please set it in your environment variables.',
      503,
      'NOT_CONFIGURED'
    )
  }
  return base.replace(/\/$/, '') // strip trailing slash
}

async function postizFetch<T>(
  apiKey: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const base = getBaseUrl()
  const url = `${base}${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...options.headers,
    },
    // Sensible timeout
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    let errorMessage = `Postiz API error: ${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body?.message) errorMessage = `Postiz: ${body.message}`
    } catch {
      // ignore parse errors
    }
    throw new PostizApiError(errorMessage, res.status)
  }

  return res.json() as Promise<T>
}

/**
 * Test the connection and return the list of connected social accounts.
 * Endpoint: GET /api/platforms (adjust to actual Postiz API endpoint)
 */
export async function fetchPostizAccounts(apiKey: string): Promise<PostizAccount[]> {
  // NOTE: Verify the actual endpoint path in your Postiz version's documentation.
  // Common paths: /api/integrations, /api/channels, /api/platforms
  const data = await postizFetch<{ integrations?: PostizAccount[]; channels?: PostizAccount[] }>(
    apiKey,
    '/api/integrations'
  )

  // Normalize response to our account type
  const raw = data.integrations || data.channels || []
  return raw.map((acc) => ({
    id: acc.id,
    name: acc.name || acc.id,
    platform: acc.platform || 'unknown',
    picture: acc.picture,
    disabled: acc.disabled ?? false,
  }))
}

/**
 * Schedule a post via Postiz API.
 * Endpoint: POST /api/posts (adjust to actual Postiz API endpoint)
 */
export async function schedulePostizPost(
  apiKey: string,
  integrationId: string,
  request: PostizScheduleRequest
): Promise<PostizScheduleResponse> {
  // Build the payload according to actual Postiz API docs.
  // NOTE: Verify field names, nesting, and required properties for your Postiz version.
  const payload = {
    type: 'draft',
    date: request.date,
    content: [
      {
        content: request.content,
        id: integrationId,
        ...(request.media && request.media.length > 0 ? { image: request.media } : {}),
      },
    ],
    tags: request.tags || [],
    settings: request.settings || {},
  }

  const response = await postizFetch<{ id: string; status?: string; releaseURL?: string }>(
    apiKey,
    '/api/posts',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )

  return {
    id: response.id,
    releaseURL: response.releaseURL,
    status: response.status,
  }
}

/**
 * Get status of a scheduled post.
 * Endpoint: GET /api/posts/:id
 */
export async function getPostizPostStatus(
  apiKey: string,
  externalPostId: string
): Promise<{ id: string; status: string }> {
  return postizFetch(apiKey, `/api/posts/${externalPostId}`)
}

/**
 * Cancel/delete a scheduled post.
 * Endpoint: DELETE /api/posts/:id
 */
export async function cancelPostizPost(
  apiKey: string,
  externalPostId: string
): Promise<void> {
  await postizFetch(apiKey, `/api/posts/${externalPostId}`, { method: 'DELETE' })
}
