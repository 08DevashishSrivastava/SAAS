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
        Relationships: []
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "practices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "voice_samples_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "knowledge_notes_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "captions_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "caption_source_notes_caption_id_fkey"
            columns: ["caption_id"]
            isOneToOne: false
            referencedRelation: "captions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caption_source_notes_knowledge_note_id_fkey"
            columns: ["knowledge_note_id"]
            isOneToOne: false
            referencedRelation: "knowledge_notes"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "media_assets_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "caption_media_caption_id_fkey"
            columns: ["caption_id"]
            isOneToOne: false
            referencedRelation: "captions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caption_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "social_connections_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "social_accounts_social_connection_id_fkey"
            columns: ["social_connection_id"]
            isOneToOne: false
            referencedRelation: "social_connections"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_caption_id_fkey"
            columns: ["caption_id"]
            isOneToOne: false
            referencedRelation: "captions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_posts_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "scheduling_attempts_scheduled_post_id_fkey"
            columns: ["scheduled_post_id"]
            isOneToOne: false
            referencedRelation: "scheduled_posts"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "usage_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "audit_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      caption_activity_by_day: {
        Args: { p_practice_id: string; p_timezone?: string }
        Returns: { activity_date: string; caption_count: number }[]
      }
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
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
