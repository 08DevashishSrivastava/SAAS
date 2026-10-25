/**
 * Centralized Supabase and Demo Configuration
 * Provides safe fallbacks so the application runs seamlessly in local dev,
 * test environments, and cloud deployments (e.g., Vercel) even before
 * manual environment variables are configured.
 */

export const SUPABASE_URL: string =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://rhtjqxicgwrnghxmwpmi.supabase.co'

export const SUPABASE_ANON_KEY: string =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_vPi6QPu1Sn8ks3IioKigDA_fU3dWx6i'

export const DEMO_EMAIL: string =
  process.env.SUPABASE_DEMO_EMAIL ||
  'caption-ai-demo+rhtjqxicgwrnghxmwpmi@example.com'

export const DEMO_PASSWORD: string =
  process.env.SUPABASE_DEMO_PASSWORD ||
  'CaptionDemo!2026-z9L8zwORKnvxl3jRm0g61ReUvcw-15Xb'

export const IS_DEMO_ENABLED: boolean =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN !== 'false'
