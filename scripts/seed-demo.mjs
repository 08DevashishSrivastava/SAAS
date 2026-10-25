/**
 * Idempotent seed script for the Caption AI demo account.
 * Uses the configured demo user credentials from .env.local to authenticate
 * via Supabase Auth, verify the practice, and seed example captions & knowledge notes.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env.local')

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim()
      if (!process.env[key]) {
        process.env[key] = val
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const demoEmail = process.env.SUPABASE_DEMO_EMAIL
const demoPassword = process.env.SUPABASE_DEMO_PASSWORD

if (!supabaseUrl || !supabaseAnonKey || !demoEmail || !demoPassword) {
  console.error('[Seed Error] Missing Supabase or demo credentials in environment.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function run() {
  console.log(`[Seed] Authenticating as demo user: ${demoEmail}...`)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword,
  })

  if (authError || !authData.user) {
    console.error('[Seed Error] Failed to authenticate demo user:', authError?.message)
    process.exit(1)
  }

  const user = authData.user
  console.log(`[Seed] Authenticated successfully. User ID: ${user.id}`)

  // Get practice
  const { data: practices, error: practiceError } = await supabase
    .from('practices')
    .select('id, name, onboarding_completed')
    .limit(1)

  if (practiceError || !practices || practices.length === 0) {
    console.error('[Seed Error] No practice found for demo user. Practice setup required.')
    process.exit(1)
  }

  const practice = practices[0]
  console.log(`[Seed] Using practice: "${practice.name}" (${practice.id})`)

  // Ensure onboarding is marked completed
  if (!practice.onboarding_completed) {
    await supabase.from('practices').update({ onboarding_completed: true }).eq('id', practice.id)
    console.log('[Seed] Marked onboarding completed for demo practice.')
  }

  // 1. Seed Knowledge Notes
  const sampleNotes = [
    {
      title: 'Teeth Whitening Protocols & FAQs',
      content: 'We offer in-office Zoom whitening (45-minute treatment, up to 8 shades brighter) and customized take-home trays with 15% carbamide peroxide gel. Sensitive patients should use fluoride toothpaste 2 weeks prior.',
      category: 'Treatment FAQs',
      tags: ['whitening', 'cosmetic', 'sensitivity'],
      pinned: true,
    },
    {
      title: 'Spring Dental Health Checkup Drive',
      content: 'Annual spring checkup campaign: Comprehensive exam, digital panoramic X-rays, ultrasonic scaling, and personalized home-care routine assessment. Appointments available Monday through Saturday.',
      category: 'Clinic News',
      tags: ['campaign', 'prevention', 'checkup'],
      pinned: true,
    },
    {
      title: 'Emergency Toothache Protocol',
      content: 'For acute tooth pain: rinse with warm saltwater, take prescribed or OTC anti-inflammatory as directed, never place aspirin directly on gums. Same-day emergency appointments guaranteed during clinic hours.',
      category: 'Patient Education',
      tags: ['emergency', 'toothache', 'firstaid'],
      pinned: false,
    },
  ]

  console.log('[Seed] Checking existing knowledge notes...')
  const { data: existingNotes } = await supabase
    .from('knowledge_notes')
    .select('title')
    .eq('practice_id', practice.id)

  const existingTitles = new Set((existingNotes || []).map(n => n.title))

  for (const note of sampleNotes) {
    if (!existingTitles.has(note.title)) {
      const { error: insertErr } = await supabase.from('knowledge_notes').insert({
        ...note,
        practice_id: practice.id,
      })
      if (insertErr) {
        console.warn(`[Seed Warning] Could not insert note "${note.title}":`, insertErr.message)
      } else {
        console.log(`[Seed] Added knowledge note: "${note.title}"`)
      }
    } else {
      console.log(`[Seed] Note already exists: "${note.title}"`)
    }
  }

  // 2. Seed Captions
  const sampleCaptions = [
    {
      body: 'Did you know that drinking coffee, tea, and red wine can stain your enamel over time? ☕🍷\n\nOur in-office whitening treatment brightens your smile up to 8 shades in just 45 minutes, with built-in sensitivity protection so you can enjoy your favorite drinks with confidence.\n\nReady for a brighter smile this season?',
      opening_hook: 'Is your morning coffee dimming your smile?',
      call_to_action: 'Tap the link in our bio to book your 45-minute whitening consultation today!',
      hashtags: ['TeethWhitening', 'SmileMakeover', 'DentalCare', 'HealthySmiles', 'DentistLife'],
      platform: 'instagram',
      status: 'draft',
      safety_flags: [],
      review_required: false,
      generation_metadata: {
        topic: 'Professional Teeth Whitening',
        model: 'gpt-4o',
        source: 'demo_seed',
      },
    },
    {
      body: 'Toothache striking out of nowhere? Don’t wait it out! 🦷\n\nA persistent toothache is your body’s alarm signal that an infection or deep cavity may be reaching the nerve. Rinsing with warm salt water can provide temporary relief, but only a clinical exam can treat the root cause.\n\nWe reserve daily emergency slots for urgent dental care.',
      opening_hook: 'Don’t ignore a toothache — it won’t fix itself!',
      call_to_action: 'Call our emergency helpline or message us directly for same-day relief.',
      hashtags: ['DentalEmergency', 'ToothacheRelief', 'PreventiveDentistry', 'OralHealth'],
      platform: 'facebook',
      status: 'draft',
      safety_flags: [],
      review_required: false,
      generation_metadata: {
        topic: 'Emergency Dental Care',
        model: 'gpt-4o',
        source: 'demo_seed',
      },
    },
    {
      body: 'Happy Dental Health Awareness Month! 🪥✨\n\n3 quick daily habits that save you thousands in future dental procedures:\n1. Brush for full 2 minutes twice a day\n2. Floss BEFORE brushing to dislodge trapped particles\n3. Replace your brush every 3 months or after a cold.\n\nWhen was your last professional cleaning?',
      opening_hook: '3 simple dental habits that save you thousands down the road.',
      call_to_action: 'Schedule your routine preventive checkup today through our website link.',
      hashtags: ['DentalTips', 'OralHygiene', 'PreventiveCare', 'SmileHealthy'],
      platform: 'general',
      status: 'draft',
      safety_flags: [],
      review_required: false,
      generation_metadata: {
        topic: 'Daily Preventive Dental Habits',
        model: 'gpt-4o',
        source: 'demo_seed',
      },
    },
  ]

  console.log('[Seed] Checking existing captions...')
  const { data: existingCaptions } = await supabase
    .from('captions')
    .select('opening_hook')
    .eq('practice_id', practice.id)

  const existingHooks = new Set((existingCaptions || []).map(c => c.opening_hook))

  for (const cap of sampleCaptions) {
    if (!existingHooks.has(cap.opening_hook)) {
      const { error: insertErr } = await supabase.from('captions').insert({
        ...cap,
        practice_id: practice.id,
        created_by: user.id,
      })
      if (insertErr) {
        console.warn(`[Seed Warning] Could not insert caption:`, insertErr.message)
      } else {
        console.log(`[Seed] Added sample draft caption: "${cap.opening_hook}"`)
      }
    } else {
      console.log(`[Seed] Caption already exists: "${cap.opening_hook}"`)
    }
  }

  console.log('[Seed] Demo data seeding completed successfully! 🎉')
}

run().catch((err) => {
  console.error('[Seed Error] Fatal error:', err)
  process.exit(1)
})
