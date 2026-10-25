import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/security/api-response'
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES, MEDIA_BUCKET } from '@/config'
import crypto from 'crypto'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ practiceId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { practiceId } = await params

    // Verify practice access
    const { data: practice } = await supabase
      .from('practices')
      .select('id, organization_id')
      .eq('id', practiceId)
      .maybeSingle()
    if (!practice) return errorResponse('Practice not found', 404)

    // Parse multipart form data
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return errorResponse('No file provided', 400)

    // Validate MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return errorResponse(`File type "${file.type}" is not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`, 422)
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return errorResponse(`File size exceeds the maximum allowed size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`, 422)
    }

    // Read file buffer and validate it's actually an image
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)

    // Basic magic byte validation
    const isValidImage = validateImageMagicBytes(bytes, file.type)
    if (!isValidImage) {
      return errorResponse('File content does not match the declared type', 422)
    }

    // Generate a safe storage path
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const randomName = crypto.randomUUID()
    const storagePath = `${practice.organization_id}/${practiceId}/${user.id}/${randomName}.${ext}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[Storage Upload Error]', uploadError)
      return errorResponse('Failed to upload file. Please try again.', 500)
    }

    // Save media asset record
    const { data: mediaAsset, error: dbError } = await supabase
      .from('media_assets')
      .insert({
        practice_id: practiceId,
        uploaded_by: user.id,
        storage_path: storagePath,
        original_filename: file.name.substring(0, 255),
        mime_type: file.type,
        size_bytes: file.size,
      })
      .select()
      .single()

    if (dbError) {
      // Clean up the uploaded file if DB insert fails
      await supabase.storage.from(MEDIA_BUCKET).remove([storagePath])
      return serverErrorResponse(dbError, 'saving media asset')
    }

    // Return signed URL for preview (expires in 1 hour)
    const { data: signedUrl } = await supabase.storage
      .from(MEDIA_BUCKET)
      .createSignedUrl(storagePath, 3600)

    return successResponse({
      ...mediaAsset,
      preview_url: signedUrl?.signedUrl,
    }, 201)
  } catch (error) {
    return serverErrorResponse(error, 'media upload')
  }
}

function validateImageMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  if (bytes.length < 4) return false

  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]],
  }

  const sigs = signatures[mimeType]
  if (!sigs) return true

  return sigs.some((sig) =>
    sig.every((byte, i) => bytes[i] === byte)
  )
}
