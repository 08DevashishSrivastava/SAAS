import type { Database } from './database'

// ─── Re-export table row types ────────────────────────────────────────────────
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row']
export type Practice = Database['public']['Tables']['practices']['Row']
export type VoiceSample = Database['public']['Tables']['voice_samples']['Row']
export type KnowledgeNote = Database['public']['Tables']['knowledge_notes']['Row']
export type Caption = Database['public']['Tables']['captions']['Row']
export type MediaAsset = Database['public']['Tables']['media_assets']['Row']
export type SocialConnection = Database['public']['Tables']['social_connections']['Row']
export type SocialAccount = Database['public']['Tables']['social_accounts']['Row']
export type ScheduledPost = Database['public']['Tables']['scheduled_posts']['Row']
export type SchedulingAttempt = Database['public']['Tables']['scheduling_attempts']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type UsageRecord = Database['public']['Tables']['usage_records']['Row']
export type AuditEvent = Database['public']['Tables']['audit_events']['Row']

// ─── Enums ────────────────────────────────────────────────────────────────────
export type CaptionPlatform = 'instagram' | 'facebook' | 'general'
export type CaptionStatus = 'draft' | 'scheduling' | 'scheduled' | 'published' | 'failed' | 'cancelled'
export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer'
export type SubscriptionPlan = 'free' | 'pro' | 'team'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'unpaid'
export type ConnectionStatus = 'active' | 'inactive' | 'error'
export type ScheduledPostStatus = 'pending' | 'submitted' | 'scheduled' | 'published' | 'failed' | 'cancelled'

// ─── Caption generation types ─────────────────────────────────────────────────
export interface GeneratedCaption {
  body: string
  opening_hook: string
  call_to_action: string
  hashtags: string[]
  platform: CaptionPlatform
  source_note_ids: string[]
  safety_flags: string[]
  review_required: boolean
}

export interface GenerationResult {
  captions: GeneratedCaption[]
  model: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface CaptionGenerationRequest {
  practice_id: string
  topic?: string
  additional_instructions?: string
  selected_note_ids?: string[]
  caption_count: 1 | 3 | 5 | 10
  platform: CaptionPlatform
  tone_override?: string
  caption_length?: 'short' | 'medium' | 'long'
  language?: string
  emoji_preference?: 'none' | 'minimal' | 'moderate' | 'heavy'
  hashtag_preference?: 'none' | 'minimal' | 'moderate' | 'many'
  cta_preference?: string
}

// ─── API response types ───────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

// ─── Onboarding types ─────────────────────────────────────────────────────────
export interface OnboardingStep {
  step: number
  completed: boolean
  data: Record<string, unknown>
}

export interface OnboardingState {
  current_step: number
  steps: OnboardingStep[]
  practice_id?: string
}

// ─── Dashboard metrics ────────────────────────────────────────────────────────
export interface DashboardMetrics {
  total_captions: number
  draft_count: number
  scheduled_count: number
  published_count: number
  recent_notes: KnowledgeNote[]
  recent_captions: Caption[]
  upcoming_posts: (ScheduledPost & { caption: Caption; social_account: SocialAccount })[]
  social_connection_status: ConnectionStatus | null
}

// ─── Postiz types ─────────────────────────────────────────────────────────────
export interface PostizAccount {
  id: string
  name: string
  platform: string
  picture?: string
  disabled?: boolean
}

export interface PostizScheduleRequest {
  content: string
  date: string // ISO 8601
  settings?: Record<string, unknown>
  media?: Array<{ path: string }>
  tags?: string[]
}

export interface PostizScheduleResponse {
  id: string
  releaseURL?: string
  status?: string
}

// ─── Subscription plan config ─────────────────────────────────────────────────
export interface PlanLimits {
  caption_generations_per_month: number
  knowledge_notes_max: number
  voice_samples_max: number
  image_uploads_per_month: number
  practices_max: number
  members_max: number
  social_scheduling: boolean
  content_calendar: boolean
  advanced_analytics: boolean
}

export interface PlanConfig {
  id: SubscriptionPlan
  name: string
  price_monthly: number
  price_yearly: number
  limits: PlanLimits
  features: string[]
}
