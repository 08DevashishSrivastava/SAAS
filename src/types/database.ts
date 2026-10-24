// Auto-generated Supabase database types for Caption AI
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          owner_user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
      }
      practices: {
        Row: {
          id: string
          organization_id: string
          name: string
          practice_type: string | null
          specialties: string[] | null
          city: string | null
          region: string | null
          country: string | null
          website: string | null
          contact_email: string | null
          contact_phone: string | null
          target_audience: string | null
          preferred_language: string
          preferred_tone: string | null
          preferred_topics: string[] | null
          timezone: string
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          practice_type?: string | null
          specialties?: string[] | null
          city?: string | null
          region?: string | null
          country?: string | null
          website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          target_audience?: string | null
          preferred_language?: string
          preferred_tone?: string | null
          preferred_topics?: string[] | null
          timezone?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          practice_type?: string | null
          specialties?: string[] | null
          city?: string | null
          region?: string | null
          country?: string | null
          website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          target_audience?: string | null
          preferred_language?: string
          preferred_tone?: string | null
          preferred_topics?: string[] | null
          timezone?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      voice_samples: {
        Row: {
          id: string
          practice_id: string
          title: string | null
          content: string
          source_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          practice_id: string
          title?: string | null
          content: string
          source_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          practice_id?: string
          title?: string | null
          content?: string
          source_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      knowledge_notes: {
        Row: {
          id: string
          practice_id: string
          title: string | null
          content: string
          category: string | null
          tags: string[] | null
          related_topics: string[] | null
          event_date: string | null
          expires_at: string | null
          archived_at: string | null
          pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          practice_id: string
          title?: string | null
          content: string
          category?: string | null
          tags?: string[] | null
          related_topics?: string[] | null
          event_date?: string | null
          expires_at?: string | null
          archived_at?: string | null
          pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          practice_id?: string
          title?: string | null
          content?: string
          category?: string | null
          tags?: string[] | null
          related_topics?: string[] | null
          event_date?: string | null
          expires_at?: string | null
          archived_at?: string | null
          pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      captions: {
        Row: {
          id: string
          practice_id: string
          created_by: string
          body: string
          opening_hook: string | null
          call_to_action: string | null
          hashtags: string[] | null
          platform: 'instagram' | 'facebook' | 'general'
          status: 'draft' | 'scheduling' | 'scheduled' | 'published' | 'failed' | 'cancelled'
          generation_metadata: Json | null
          safety_flags: string[] | null
          review_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          practice_id: string
          created_by: string
          body: string
          opening_hook?: string | null
          call_to_action?: string | null
          hashtags?: string[] | null
          platform?: 'instagram' | 'facebook' | 'general'
          status?: 'draft' | 'scheduling' | 'scheduled' | 'published' | 'failed' | 'cancelled'
          generation_metadata?: Json | null
          safety_flags?: string[] | null
          review_required?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          practice_id?: string
          created_by?: string
          body?: string
          opening_hook?: string | null
          call_to_action?: string | null
          hashtags?: string[] | null
          platform?: 'instagram' | 'facebook' | 'general'
          status?: 'draft' | 'scheduling' | 'scheduled' | 'published' | 'failed' | 'cancelled'
          generation_metadata?: Json | null
          safety_flags?: string[] | null
          review_required?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      caption_source_notes: {
        Row: {
          caption_id: string
          knowledge_note_id: string
        }
        Insert: {
          caption_id: string
          knowledge_note_id: string
        }
        Update: {
          caption_id?: string
          knowledge_note_id?: string
        }
      }
      media_assets: {
        Row: {
          id: string
          practice_id: string
          uploaded_by: string
          storage_path: string
          original_filename: string
          mime_type: string
          size_bytes: number
          width: number | null
          height: number | null
          created_at: string
        }
        Insert: {
          id?: string
          practice_id: string
          uploaded_by: string
          storage_path: string
          original_filename: string
          mime_type: string
          size_bytes: number
          width?: number | null
          height?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          practice_id?: string
          uploaded_by?: string
          storage_path?: string
          original_filename?: string
          mime_type?: string
          size_bytes?: number
          width?: number | null
          height?: number | null
          created_at?: string
        }
      }
      caption_media: {
        Row: {
          caption_id: string
          media_asset_id: string
          position: number
        }
        Insert: {
          caption_id: string
          media_asset_id: string
          position?: number
        }
        Update: {
          caption_id?: string
          media_asset_id?: string
          position?: number
        }
      }
      social_connections: {
        Row: {
          id: string
          practice_id: string
          provider: string
          encrypted_credential: string
          credential_key_version: number
          connection_status: 'active' | 'inactive' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          practice_id: string
          provider: string
          encrypted_credential: string
          credential_key_version?: number
          connection_status?: 'active' | 'inactive' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          practice_id?: string
          provider?: string
          encrypted_credential?: string
          credential_key_version?: number
          connection_status?: 'active' | 'inactive' | 'error'
          created_at?: string
          updated_at?: string
        }
      }
      social_accounts: {
        Row: {
          id: string
          social_connection_id: string
          external_account_id: string
          platform: string
          display_name: string | null
          safe_metadata: Json | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          social_connection_id: string
          external_account_id: string
          platform: string
          display_name?: string | null
          safe_metadata?: Json | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          social_connection_id?: string
          external_account_id?: string
          platform?: string
          display_name?: string | null
          safe_metadata?: Json | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      scheduled_posts: {
        Row: {
          id: string
          caption_id: string
          social_account_id: string
          external_post_id: string | null
          scheduled_at: string
          timezone: string
          status: 'pending' | 'submitted' | 'scheduled' | 'published' | 'failed' | 'cancelled'
          last_error_code: string | null
          last_error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          caption_id: string
          social_account_id: string
          external_post_id?: string | null
          scheduled_at: string
          timezone: string
          status?: 'pending' | 'submitted' | 'scheduled' | 'published' | 'failed' | 'cancelled'
          last_error_code?: string | null
          last_error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          caption_id?: string
          social_account_id?: string
          external_post_id?: string | null
          scheduled_at?: string
          timezone?: string
          status?: 'pending' | 'submitted' | 'scheduled' | 'published' | 'failed' | 'cancelled'
          last_error_code?: string | null
          last_error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scheduling_attempts: {
        Row: {
          id: string
          scheduled_post_id: string
          request_reference: string
          attempt_number: number
          status: 'pending' | 'success' | 'failed'
          safe_error_metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          scheduled_post_id: string
          request_reference: string
          attempt_number?: number
          status?: 'pending' | 'success' | 'failed'
          safe_error_metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          scheduled_post_id?: string
          request_reference?: string
          attempt_number?: number
          status?: 'pending' | 'success' | 'failed'
          safe_error_metadata?: Json | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          organization_id: string
          provider: string | null
          external_customer_id: string | null
          external_subscription_id: string | null
          plan: 'free' | 'pro' | 'team'
          status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'unpaid'
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          provider?: string | null
          external_customer_id?: string | null
          external_subscription_id?: string | null
          plan?: 'free' | 'pro' | 'team'
          status?: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'unpaid'
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          provider?: string | null
          external_customer_id?: string | null
          external_subscription_id?: string | null
          plan?: 'free' | 'pro' | 'team'
          status?: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'unpaid'
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usage_records: {
        Row: {
          id: string
          organization_id: string
          operation: string
          quantity: number
          model: string | null
          token_usage: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          operation: string
          quantity?: number
          model?: string | null
          token_usage?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          operation?: string
          quantity?: number
          model?: string | null
          token_usage?: Json | null
          created_at?: string
        }
      }
      audit_events: {
        Row: {
          id: string
          organization_id: string | null
          actor_user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          safe_metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          actor_user_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          safe_metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          actor_user_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          safe_metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      is_org_member: {
        Args: { org_id: string; uid: string }
        Returns: boolean
      }
      get_user_org_ids: {
        Args: { uid: string }
        Returns: string[]
      }
    }
    Enums: {
      caption_platform: 'instagram' | 'facebook' | 'general'
      caption_status: 'draft' | 'scheduling' | 'scheduled' | 'published' | 'failed' | 'cancelled'
      member_role: 'owner' | 'admin' | 'editor' | 'viewer'
      subscription_plan: 'free' | 'pro' | 'team'
      subscription_status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'unpaid'
      connection_status: 'active' | 'inactive' | 'error'
      scheduled_post_status: 'pending' | 'submitted' | 'scheduled' | 'published' | 'failed' | 'cancelled'
    }
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
