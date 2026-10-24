import { z } from 'zod'

// ─── Auth Schemas ─────────────────────────────────────────────────────────────
export const signUpSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})
export type SignUpInput = z.infer<typeof signUpSchema>

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
export type SignInInput = z.infer<typeof signInSchema>

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>

// ─── Practice Schemas ─────────────────────────────────────────────────────────
export const practiceProfileSchema = z.object({
  name: z.string().min(2, 'Practice name is required').max(200),
  practice_type: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  city: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  contact_email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  contact_phone: z.string().max(30).optional(),
  target_audience: z.string().max(500).optional(),
  preferred_language: z.string().default('en'),
  timezone: z.string().default('Asia/Kolkata'),
})
export type PracticeProfileInput = z.infer<typeof practiceProfileSchema>

export const contentTopicsSchema = z.object({
  preferred_topics: z.array(z.string()).min(1, 'Select at least one topic'),
  custom_topics: z.array(z.string()).optional(),
})
export type ContentTopicsInput = z.infer<typeof contentTopicsSchema>

export const writingToneSchema = z.object({
  preferred_tone: z.string().min(1, 'Please select a tone'),
  tone_description: z.string().max(500).optional(),
})
export type WritingToneInput = z.infer<typeof writingToneSchema>

// ─── Voice Sample Schemas ─────────────────────────────────────────────────────
export const voiceSampleSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(20, 'Sample must be at least 20 characters').max(5000),
  source_type: z.string().optional(),
})
export type VoiceSampleInput = z.infer<typeof voiceSampleSchema>

// ─── Knowledge Note Schemas ───────────────────────────────────────────────────
export const knowledgeNoteSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(3, 'Note content is required').max(5000),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  related_topics: z.array(z.string()).optional(),
  event_date: z.string().optional(),
  expires_at: z.string().optional(),
  pinned: z.boolean().optional(),
})
export type KnowledgeNoteInput = z.infer<typeof knowledgeNoteSchema>

// ─── Caption Generation Schemas ───────────────────────────────────────────────
export const captionGenerationSchema = z.object({
  practice_id: z.string().uuid(),
  topic: z.string().max(500).optional(),
  additional_instructions: z.string().max(1000).optional(),
  selected_note_ids: z.array(z.string().uuid()).optional(),
  caption_count: z.union([z.literal(1), z.literal(3), z.literal(5), z.literal(10)]),
  platform: z.enum(['instagram', 'facebook', 'general']),
  tone_override: z.string().optional(),
  caption_length: z.enum(['short', 'medium', 'long']).optional(),
  language: z.string().optional(),
  emoji_preference: z.enum(['none', 'minimal', 'moderate', 'heavy']).optional(),
  hashtag_preference: z.enum(['none', 'minimal', 'moderate', 'many']).optional(),
  cta_preference: z.string().max(200).optional(),
})
export type CaptionGenerationInput = z.infer<typeof captionGenerationSchema>

export const captionUpdateSchema = z.object({
  body: z.string().min(1).max(10000).optional(),
  opening_hook: z.string().max(500).optional().nullable(),
  call_to_action: z.string().max(500).optional().nullable(),
  hashtags: z.array(z.string()).optional().nullable(),
  platform: z.enum(['instagram', 'facebook', 'general']).optional(),
  status: z.enum(['draft', 'scheduling', 'scheduled', 'published', 'failed', 'cancelled']).optional(),
  review_required: z.boolean().optional(),
})
export type CaptionUpdateInput = z.infer<typeof captionUpdateSchema>

// ─── Scheduling Schemas ───────────────────────────────────────────────────────
export const schedulePostSchema = z.object({
  caption_id: z.string().uuid(),
  social_account_id: z.string().uuid(),
  scheduled_at: z.string().datetime({ message: 'Please provide a valid ISO 8601 datetime' }),
  timezone: z.string(),
  media_asset_id: z.string().uuid().optional(),
})
export type SchedulePostInput = z.infer<typeof schedulePostSchema>

// ─── Social Connection Schemas ────────────────────────────────────────────────
export const socialConnectionSchema = z.object({
  api_key: z.string().min(10, 'Please enter a valid API key'),
})
export type SocialConnectionInput = z.infer<typeof socialConnectionSchema>

// ─── Generated caption output schema (from OpenAI) ───────────────────────────
export const generatedCaptionSchema = z.object({
  body: z.string().min(1),
  opening_hook: z.string(),
  call_to_action: z.string(),
  hashtags: z.array(z.string()),
  platform: z.enum(['instagram', 'facebook', 'general']),
  source_note_ids: z.array(z.string()),
  safety_flags: z.array(z.string()),
  review_required: z.boolean(),
})

export const generationResultSchema = z.object({
  captions: z.array(generatedCaptionSchema),
})
