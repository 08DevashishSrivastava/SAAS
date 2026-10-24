import { NextResponse } from 'next/server'

export interface ApiError {
  error: string
  code?: string
  request_id?: string
}

export function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Standard success response
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

/**
 * Standard error response — never leaks stack traces or internal details
 */
export function errorResponse(
  message: string,
  status = 400,
  code?: string
): NextResponse {
  const body: ApiError = { error: message }
  if (code) body.code = code
  return NextResponse.json(body, { status })
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return errorResponse(message, 401, 'UNAUTHORIZED')
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message = 'Forbidden') {
  return errorResponse(message, 403, 'FORBIDDEN')
}

/**
 * Not found response
 */
export function notFoundResponse(resource = 'Resource') {
  return errorResponse(`${resource} not found`, 404, 'NOT_FOUND')
}

/**
 * Internal server error — logs internally but returns safe message
 */
export function serverErrorResponse(error: unknown, context?: string) {
  console.error(`[API Error]${context ? ` ${context}:` : ''}`, error)
  return errorResponse('An internal error occurred. Please try again.', 500, 'INTERNAL_ERROR')
}

/**
 * Rate limit exceeded response
 */
export function rateLimitResponse() {
  return errorResponse('Rate limit exceeded. Please slow down.', 429, 'RATE_LIMIT')
}

/**
 * Validation error response
 */
export function validationErrorResponse(message: string) {
  return errorResponse(message, 422, 'VALIDATION_ERROR')
}
