import assert from 'node:assert/strict'
import test from 'node:test'
import {
  captionGenerationSchema,
  captionUpdateSchema,
  generatedCaptionSchema,
  knowledgeNoteSchema,
  practiceProfileSchema,
  schedulePostSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from '../../src/lib/validation/schemas.ts'

test('signUpSchema validates password complexity and email format', () => {
  // Valid
  const valid = signUpSchema.safeParse({
    full_name: 'Dr. John Doe',
    email: 'john@example.com',
    password: 'Password123!',
  })
  assert.equal(valid.success, true)

  // Invalid password - no numbers
  const noNumber = signUpSchema.safeParse({
    full_name: 'Dr. John Doe',
    email: 'john@example.com',
    password: 'PasswordNoNumber',
  })
  assert.equal(noNumber.success, false)

  // Invalid email
  const badEmail = signUpSchema.safeParse({
    full_name: 'Dr. John Doe',
    email: 'not-an-email',
    password: 'Password123!',
  })
  assert.equal(badEmail.success, false)
})

test('signInSchema validates basic credentials requirement', () => {
  assert.equal(signInSchema.safeParse({ email: 'user@test.com', password: 'secret' }).success, true)
  assert.equal(signInSchema.safeParse({ email: 'bad-email', password: 'secret' }).success, false)
  assert.equal(signInSchema.safeParse({ email: 'user@test.com', password: '' }).success, false)
})

test('updatePasswordSchema ensures confirmation password matches', () => {
  const match = updatePasswordSchema.safeParse({
    password: 'NewPassword123',
    confirm_password: 'NewPassword123',
  })
  assert.equal(match.success, true)

  const mismatch = updatePasswordSchema.safeParse({
    password: 'NewPassword123',
    confirm_password: 'DifferentPassword123',
  })
  assert.equal(mismatch.success, false)
})

test('practiceProfileSchema validates name and provides reasonable defaults', () => {
  const res = practiceProfileSchema.safeParse({
    name: 'Apex Dental Care',
  })
  assert.equal(res.success, true)
  if (res.success) {
    assert.equal(res.data.preferred_language, 'en')
    assert.equal(res.data.timezone, 'Asia/Kolkata')
  }

  const emptyName = practiceProfileSchema.safeParse({
    name: '',
  })
  assert.equal(emptyName.success, false)
})

test('knowledgeNoteSchema requires content length between 3 and 5000 characters', () => {
  assert.equal(
    knowledgeNoteSchema.safeParse({
      title: 'Holiday Hours',
      content: 'We are closed on Christmas and New Year Day.',
    }).success,
    true,
  )

  // Too short
  assert.equal(
    knowledgeNoteSchema.safeParse({
      title: 'Short',
      content: 'No',
    }).success,
    false,
  )
})

test('captionGenerationSchema enforces valid platforms and counts', () => {
  const valid = captionGenerationSchema.safeParse({
    practice_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    topic: 'Wisdom teeth recovery tips',
    caption_count: 3,
    platform: 'instagram',
  })
  assert.equal(valid.success, true)

  // Invalid count (must be 1, 3, 5, or 10)
  const invalidCount = captionGenerationSchema.safeParse({
    practice_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    caption_count: 7,
    platform: 'instagram',
  })
  assert.equal(invalidCount.success, false)

  // Invalid platform
  const invalidPlatform = captionGenerationSchema.safeParse({
    practice_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    caption_count: 1,
    platform: 'tiktok',
  })
  assert.equal(invalidPlatform.success, false)
})

test('captionUpdateSchema accepts valid status and platform enum updates', () => {
  const valid = captionUpdateSchema.safeParse({
    body: 'Updated caption copy',
    status: 'draft',
    platform: 'facebook',
  })
  assert.equal(valid.success, true)

  const invalidStatus = captionUpdateSchema.safeParse({
    status: 'nonexistent-status',
  })
  assert.equal(invalidStatus.success, false)
})

test('schedulePostSchema requires valid UUIDs and ISO 8601 datetime', () => {
  const valid = schedulePostSchema.safeParse({
    caption_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    social_account_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    scheduled_at: '2026-11-01T10:00:00.000Z',
    timezone: 'Asia/Kolkata',
  })
  assert.equal(valid.success, true)

  const badDate = schedulePostSchema.safeParse({
    caption_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    social_account_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    scheduled_at: 'tomorrow morning',
    timezone: 'Asia/Kolkata',
  })
  assert.equal(badDate.success, false)
})

test('generatedCaptionSchema validates structured AI generation output', () => {
  const valid = generatedCaptionSchema.safeParse({
    body: 'Here is your clinical tip of the day...',
    opening_hook: 'Did you know?',
    call_to_action: 'Book your appointment online today.',
    hashtags: ['#dentalcare', '#oralhealth'],
    platform: 'instagram',
    source_note_ids: ['note-1'],
    safety_flags: [],
    review_required: false,
  })
  assert.equal(valid.success, true)
})
