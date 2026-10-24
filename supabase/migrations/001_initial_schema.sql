-- =============================================================================
-- Caption AI — Initial Database Migration
-- Migration: 001_initial_schema.sql
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search

-- =============================================================================
-- PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_user_id);

-- =============================================================================
-- ORGANIZATION MEMBERS
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE member_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS organization_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            member_role NOT NULL DEFAULT 'viewer',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);

-- =============================================================================
-- PRACTICES
-- =============================================================================
CREATE TABLE IF NOT EXISTS practices (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  practice_type        TEXT,
  specialties          TEXT[],
  city                 TEXT,
  region               TEXT,
  country              TEXT,
  website              TEXT,
  contact_email        TEXT,
  contact_phone        TEXT,
  target_audience      TEXT,
  preferred_language   TEXT NOT NULL DEFAULT 'en',
  preferred_tone       TEXT,
  preferred_topics     TEXT[],
  timezone             TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practices_org ON practices(organization_id);

-- =============================================================================
-- VOICE SAMPLES
-- =============================================================================
CREATE TABLE IF NOT EXISTS voice_samples (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  title       TEXT,
  content     TEXT NOT NULL,
  source_type TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_samples_practice ON voice_samples(practice_id);

-- =============================================================================
-- KNOWLEDGE NOTES
-- =============================================================================
CREATE TABLE IF NOT EXISTS knowledge_notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id     UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  title           TEXT,
  content         TEXT NOT NULL,
  category        TEXT,
  tags            TEXT[],
  related_topics  TEXT[],
  event_date      DATE,
  expires_at      TIMESTAMPTZ,
  archived_at     TIMESTAMPTZ,
  pinned          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_notes_practice ON knowledge_notes(practice_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_notes_archived ON knowledge_notes(practice_id, archived_at) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_knowledge_notes_pinned ON knowledge_notes(practice_id, pinned) WHERE pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_knowledge_notes_expires ON knowledge_notes(expires_at) WHERE expires_at IS NOT NULL;
-- Full text search index
CREATE INDEX IF NOT EXISTS idx_knowledge_notes_fts ON knowledge_notes USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || content));

-- =============================================================================
-- CAPTIONS
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE caption_platform AS ENUM ('instagram', 'facebook', 'general');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE caption_status AS ENUM ('draft', 'scheduling', 'scheduled', 'published', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS captions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id         UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  created_by          UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  body                TEXT NOT NULL,
  opening_hook        TEXT,
  call_to_action      TEXT,
  hashtags            TEXT[],
  platform            caption_platform NOT NULL DEFAULT 'general',
  status              caption_status NOT NULL DEFAULT 'draft',
  generation_metadata JSONB,
  safety_flags        TEXT[],
  review_required     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_captions_practice ON captions(practice_id);
CREATE INDEX IF NOT EXISTS idx_captions_status ON captions(practice_id, status);
CREATE INDEX IF NOT EXISTS idx_captions_created_by ON captions(created_by);

-- =============================================================================
-- CAPTION SOURCE NOTES
-- =============================================================================
CREATE TABLE IF NOT EXISTS caption_source_notes (
  caption_id        UUID NOT NULL REFERENCES captions(id) ON DELETE CASCADE,
  knowledge_note_id UUID NOT NULL REFERENCES knowledge_notes(id) ON DELETE CASCADE,
  PRIMARY KEY (caption_id, knowledge_note_id)
);

-- =============================================================================
-- MEDIA ASSETS
-- =============================================================================
CREATE TABLE IF NOT EXISTS media_assets (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id       UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  uploaded_by       UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  storage_path      TEXT NOT NULL UNIQUE,
  original_filename TEXT NOT NULL,
  mime_type         TEXT NOT NULL,
  size_bytes        BIGINT NOT NULL,
  width             INTEGER,
  height            INTEGER,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_practice ON media_assets(practice_id);

-- =============================================================================
-- CAPTION MEDIA
-- =============================================================================
CREATE TABLE IF NOT EXISTS caption_media (
  caption_id    UUID NOT NULL REFERENCES captions(id) ON DELETE CASCADE,
  media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  position      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (caption_id, media_asset_id)
);

-- =============================================================================
-- SOCIAL CONNECTIONS
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE connection_status AS ENUM ('active', 'inactive', 'error');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS social_connections (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id           UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  provider              TEXT NOT NULL DEFAULT 'postiz',
  encrypted_credential  TEXT NOT NULL,
  credential_key_version INTEGER NOT NULL DEFAULT 1,
  connection_status     connection_status NOT NULL DEFAULT 'active',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(practice_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_social_connections_practice ON social_connections(practice_id);

-- =============================================================================
-- SOCIAL ACCOUNTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS social_accounts (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  social_connection_id UUID NOT NULL REFERENCES social_connections(id) ON DELETE CASCADE,
  external_account_id  TEXT NOT NULL,
  platform             TEXT NOT NULL,
  display_name         TEXT,
  safe_metadata        JSONB,
  is_default           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(social_connection_id, external_account_id)
);

CREATE INDEX IF NOT EXISTS idx_social_accounts_connection ON social_accounts(social_connection_id);

-- =============================================================================
-- SCHEDULED POSTS
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE scheduled_post_status AS ENUM ('pending', 'submitted', 'scheduled', 'published', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caption_id        UUID NOT NULL REFERENCES captions(id) ON DELETE CASCADE,
  social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE RESTRICT,
  external_post_id  TEXT,
  scheduled_at      TIMESTAMPTZ NOT NULL,
  timezone          TEXT NOT NULL,
  status            scheduled_post_status NOT NULL DEFAULT 'pending',
  last_error_code   TEXT,
  last_error_message TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_posts_caption ON scheduled_posts(caption_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_account ON scheduled_posts(social_account_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_at ON scheduled_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);

-- =============================================================================
-- SCHEDULING ATTEMPTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS scheduling_attempts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_post_id   UUID NOT NULL REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  request_reference   TEXT NOT NULL,
  attempt_number      INTEGER NOT NULL DEFAULT 1,
  status              TEXT NOT NULL DEFAULT 'pending',
  safe_error_metadata JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduling_attempts_post ON scheduling_attempts(scheduled_post_id);

-- =============================================================================
-- SUBSCRIPTIONS
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'team');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'cancelled', 'unpaid');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  provider                TEXT,
  external_customer_id    TEXT,
  external_subscription_id TEXT,
  plan                    subscription_plan NOT NULL DEFAULT 'free',
  status                  subscription_status NOT NULL DEFAULT 'active',
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_external ON subscriptions(external_subscription_id) WHERE external_subscription_id IS NOT NULL;

-- =============================================================================
-- USAGE RECORDS
-- =============================================================================
CREATE TABLE IF NOT EXISTS usage_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  operation       TEXT NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 1,
  model           TEXT,
  token_usage     JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_records_org ON usage_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_operation ON usage_records(organization_id, operation, created_at);

-- =============================================================================
-- AUDIT EVENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  actor_user_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  resource_type   TEXT,
  resource_id     UUID,
  safe_metadata   JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_org ON audit_events(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events(actor_user_id, created_at DESC);

-- =============================================================================
-- DATABASE FUNCTIONS
-- =============================================================================

-- Check if a user is a member of an organization
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID, uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id AND user_id = uid
  );
$$;

-- Get all organization IDs for a user
CREATE OR REPLACE FUNCTION get_user_org_ids(uid UUID)
RETURNS UUID[]
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT ARRAY_AGG(organization_id) FROM organization_members WHERE user_id = uid;
$$;

-- Get practice IDs accessible to a user
CREATE OR REPLACE FUNCTION get_user_practice_ids(uid UUID)
RETURNS UUID[]
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT ARRAY_AGG(p.id)
  FROM practices p
  WHERE p.organization_id = ANY(get_user_org_ids(uid));
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['profiles', 'organizations', 'practices', 'voice_samples', 'knowledge_notes', 'captions', 'social_connections', 'social_accounts', 'scheduled_posts', 'subscriptions']
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_update_%I_updated_at ON %I;
      CREATE TRIGGER trg_update_%I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', tbl, tbl, tbl, tbl);
  END LOOP;
END $$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE caption_source_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE caption_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- ── PROFILES ──────────────────────────────────────────────────────────────────
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ── ORGANIZATIONS ─────────────────────────────────────────────────────────────
CREATE POLICY "organizations_select_members" ON organizations FOR SELECT USING (is_org_member(id, auth.uid()));
CREATE POLICY "organizations_insert_owner" ON organizations FOR INSERT WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "organizations_update_owner" ON organizations FOR UPDATE USING (auth.uid() = owner_user_id);

-- ── ORGANIZATION MEMBERS ──────────────────────────────────────────────────────
CREATE POLICY "org_members_select" ON organization_members FOR SELECT USING (is_org_member(organization_id, auth.uid()));
CREATE POLICY "org_members_insert_owner" ON organization_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_user_id = auth.uid())
);
CREATE POLICY "org_members_delete_owner" ON organization_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_user_id = auth.uid())
);

-- ── PRACTICES ─────────────────────────────────────────────────────────────────
CREATE POLICY "practices_select_members" ON practices FOR SELECT USING (is_org_member(organization_id, auth.uid()));
CREATE POLICY "practices_insert_members" ON practices FOR INSERT WITH CHECK (is_org_member(organization_id, auth.uid()));
CREATE POLICY "practices_update_members" ON practices FOR UPDATE USING (is_org_member(organization_id, auth.uid()));
CREATE POLICY "practices_delete_owner" ON practices FOR DELETE USING (
  EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND owner_user_id = auth.uid())
);

-- ── VOICE SAMPLES ─────────────────────────────────────────────────────────────
CREATE POLICY "voice_samples_select" ON voice_samples FOR SELECT USING (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);
CREATE POLICY "voice_samples_insert" ON voice_samples FOR INSERT WITH CHECK (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);
CREATE POLICY "voice_samples_update" ON voice_samples FOR UPDATE USING (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);
CREATE POLICY "voice_samples_delete" ON voice_samples FOR DELETE USING (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);

-- ── KNOWLEDGE NOTES ───────────────────────────────────────────────────────────
CREATE POLICY "knowledge_notes_select" ON knowledge_notes FOR SELECT USING (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);
CREATE POLICY "knowledge_notes_insert" ON knowledge_notes FOR INSERT WITH CHECK (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);
CREATE POLICY "knowledge_notes_update" ON knowledge_notes FOR UPDATE USING (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);
CREATE POLICY "knowledge_notes_delete" ON knowledge_notes FOR DELETE USING (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);

-- ── CAPTIONS ──────────────────────────────────────────────────────────────────
CREATE POLICY "captions_select" ON captions FOR SELECT USING (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);
CREATE POLICY "captions_insert" ON captions FOR INSERT WITH CHECK (
  practice_id = ANY(get_user_practice_ids(auth.uid())) AND
  created_by = auth.uid()
);
CREATE POLICY "captions_update" ON captions FOR UPDATE USING (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);
CREATE POLICY "captions_delete" ON captions FOR DELETE USING (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);

-- ── CAPTION SOURCE NOTES ─────────────────────────────────────────────────────
CREATE POLICY "caption_source_notes_select" ON caption_source_notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM captions c WHERE c.id = caption_id AND c.practice_id = ANY(get_user_practice_ids(auth.uid())))
);
CREATE POLICY "caption_source_notes_insert" ON caption_source_notes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM captions c WHERE c.id = caption_id AND c.practice_id = ANY(get_user_practice_ids(auth.uid())))
);
CREATE POLICY "caption_source_notes_delete" ON caption_source_notes FOR DELETE USING (
  EXISTS (SELECT 1 FROM captions c WHERE c.id = caption_id AND c.practice_id = ANY(get_user_practice_ids(auth.uid())))
);

-- ── MEDIA ASSETS ──────────────────────────────────────────────────────────────
CREATE POLICY "media_assets_select" ON media_assets FOR SELECT USING (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);
CREATE POLICY "media_assets_insert" ON media_assets FOR INSERT WITH CHECK (
  practice_id = ANY(get_user_practice_ids(auth.uid())) AND
  uploaded_by = auth.uid()
);
CREATE POLICY "media_assets_delete" ON media_assets FOR DELETE USING (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);

-- ── CAPTION MEDIA ─────────────────────────────────────────────────────────────
CREATE POLICY "caption_media_select" ON caption_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM captions c WHERE c.id = caption_id AND c.practice_id = ANY(get_user_practice_ids(auth.uid())))
);
CREATE POLICY "caption_media_insert" ON caption_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM captions c WHERE c.id = caption_id AND c.practice_id = ANY(get_user_practice_ids(auth.uid())))
);
CREATE POLICY "caption_media_delete" ON caption_media FOR DELETE USING (
  EXISTS (SELECT 1 FROM captions c WHERE c.id = caption_id AND c.practice_id = ANY(get_user_practice_ids(auth.uid())))
);

-- ── SOCIAL CONNECTIONS ────────────────────────────────────────────────────────
CREATE POLICY "social_connections_select" ON social_connections FOR SELECT USING (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);
CREATE POLICY "social_connections_insert" ON social_connections FOR INSERT WITH CHECK (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);
CREATE POLICY "social_connections_update" ON social_connections FOR UPDATE USING (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);
CREATE POLICY "social_connections_delete" ON social_connections FOR DELETE USING (
  practice_id = ANY(get_user_practice_ids(auth.uid()))
);

-- ── SOCIAL ACCOUNTS ───────────────────────────────────────────────────────────
CREATE POLICY "social_accounts_select" ON social_accounts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM social_connections sc
    WHERE sc.id = social_connection_id
    AND sc.practice_id = ANY(get_user_practice_ids(auth.uid()))
  )
);
CREATE POLICY "social_accounts_insert" ON social_accounts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM social_connections sc
    WHERE sc.id = social_connection_id
    AND sc.practice_id = ANY(get_user_practice_ids(auth.uid()))
  )
);
CREATE POLICY "social_accounts_update" ON social_accounts FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM social_connections sc
    WHERE sc.id = social_connection_id
    AND sc.practice_id = ANY(get_user_practice_ids(auth.uid()))
  )
);
CREATE POLICY "social_accounts_delete" ON social_accounts FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM social_connections sc
    WHERE sc.id = social_connection_id
    AND sc.practice_id = ANY(get_user_practice_ids(auth.uid()))
  )
);

-- ── SCHEDULED POSTS ───────────────────────────────────────────────────────────
CREATE POLICY "scheduled_posts_select" ON scheduled_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM captions c WHERE c.id = caption_id AND c.practice_id = ANY(get_user_practice_ids(auth.uid())))
);
CREATE POLICY "scheduled_posts_insert" ON scheduled_posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM captions c WHERE c.id = caption_id AND c.practice_id = ANY(get_user_practice_ids(auth.uid())))
);
CREATE POLICY "scheduled_posts_update" ON scheduled_posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM captions c WHERE c.id = caption_id AND c.practice_id = ANY(get_user_practice_ids(auth.uid())))
);

-- ── SCHEDULING ATTEMPTS ───────────────────────────────────────────────────────
CREATE POLICY "scheduling_attempts_select" ON scheduling_attempts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM scheduled_posts sp
    JOIN captions c ON c.id = sp.caption_id
    WHERE sp.id = scheduled_post_id
    AND c.practice_id = ANY(get_user_practice_ids(auth.uid()))
  )
);

-- ── SUBSCRIPTIONS ─────────────────────────────────────────────────────────────
-- Users can read but NOT modify their own subscription (billing system modifies via service role)
CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT USING (
  is_org_member(organization_id, auth.uid())
);

-- ── USAGE RECORDS ─────────────────────────────────────────────────────────────
CREATE POLICY "usage_records_select" ON usage_records FOR SELECT USING (
  is_org_member(organization_id, auth.uid())
);

-- ── AUDIT EVENTS ─────────────────────────────────────────────────────────────
CREATE POLICY "audit_events_select" ON audit_events FOR SELECT USING (
  organization_id IS NOT NULL AND is_org_member(organization_id, auth.uid())
);

-- =============================================================================
-- STORAGE BUCKETS (run in Supabase dashboard or via supabase CLI)
-- =============================================================================
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'practice-media',
--   'practice-media',
--   false,
--   10485760, -- 10 MB
--   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
-- ) ON CONFLICT DO NOTHING;

-- Storage policies for practice-media bucket are applied via Supabase dashboard or CLI.
-- Key rule: users can only access storage paths under their organization/practice.
