import type { PlanConfig } from '@/types'

export const APP_NAME = 'Caption AI'
export const APP_TAGLINE = 'Social captions that sound like your practice.'
export const APP_DESCRIPTION =
  'Turn everyday clinic updates and medical insights into authentic social media captions, written in your voice and ready for Instagram and Facebook.'

export const PRACTICE_TYPES = [
  'General Dentistry',
  'Cosmetic Dentistry',
  'Orthodontics',
  'Pediatric Dentistry',
  'Periodontics',
  'Endodontics',
  'Oral Surgery',
  'Prosthodontics',
  'Dental Implants',
  'Invisalign / Clear Aligners',
  'Dermatology',
  'Aesthetic Medicine',
  'Plastic Surgery',
  'General Medicine',
  'Family Medicine',
  'Pediatrics',
  'Cardiology',
  'Orthopedics',
  'Ophthalmology',
  'ENT',
  'Other Specialty',
] as const

export const CONTENT_TOPICS = [
  'Teeth Whitening',
  'Invisalign & Clear Aligners',
  'Oral Hygiene',
  'Preventive Care',
  'Dental Implants',
  'Orthodontics',
  'Cosmetic Dentistry',
  'Dermatology',
  'Skin Care',
  'Patient Education',
  'Clinic Announcements',
  'Staff Introductions',
  'Equipment Updates',
  'Patient FAQs',
  'Seasonal Campaigns',
  'Promotions',
  'Events',
  'General Educational Content',
] as const

export const WRITING_TONES = [
  { value: 'friendly_professional', label: 'Friendly & Professional' },
  { value: 'educational_trustworthy', label: 'Educational & Trustworthy' },
  { value: 'warm_reassuring', label: 'Warm & Reassuring' },
  { value: 'fun_conversational', label: 'Fun & Conversational' },
  { value: 'premium_polished', label: 'Premium & Polished' },
  { value: 'concise_informative', label: 'Concise & Informative' },
  { value: 'custom', label: 'Custom (describe below)' },
] as const

export const VOICE_SAMPLE_SOURCE_TYPES = [
  { value: 'instagram_caption', label: 'Instagram Caption' },
  { value: 'facebook_post', label: 'Facebook Post' },
  { value: 'patient_email', label: 'Patient Email' },
  { value: 'practice_announcement', label: 'Practice Announcement' },
  { value: 'educational_explanation', label: 'Educational Explanation' },
  { value: 'website_text', label: 'Website Text' },
  { value: 'other', label: 'Other' },
] as const

export const CAPTION_PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: 'Instagram' },
  { value: 'facebook', label: 'Facebook', icon: 'Facebook' },
  { value: 'general', label: 'General', icon: 'Globe' },
] as const

export const CAPTION_COUNTS = [1, 3, 5, 10] as const

export const CAPTION_LENGTHS = [
  { value: 'short', label: 'Short (< 100 words)' },
  { value: 'medium', label: 'Medium (100–200 words)' },
  { value: 'long', label: 'Long (200+ words)' },
] as const

export const EMOJI_PREFERENCES = [
  { value: 'none', label: 'No emojis' },
  { value: 'minimal', label: 'Minimal (1–2)' },
  { value: 'moderate', label: 'Moderate (3–5)' },
  { value: 'heavy', label: 'Heavy (many)' },
] as const

export const HASHTAG_PREFERENCES = [
  { value: 'none', label: 'No hashtags' },
  { value: 'minimal', label: 'Minimal (3–5)' },
  { value: 'moderate', label: 'Moderate (8–15)' },
  { value: 'many', label: 'Many (20–30)' },
] as const

export const NOTE_CATEGORIES = [
  'Announcement',
  'Promotion',
  'Education',
  'Staff',
  'Equipment',
  'Event',
  'FAQ',
  'Seasonal',
  'Patient Story',
  'General',
] as const

export const TIMEZONES = [
  'Asia/Kolkata',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
] as const

export const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ar', label: 'Arabic' },
  { value: 'pt', label: 'Portuguese' },
] as const

export const PLAN_CONFIGS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Free',
    price_monthly: 0,
    price_yearly: 0,
    limits: {
      caption_generations_per_month: 10,
      knowledge_notes_max: 20,
      voice_samples_max: 3,
      image_uploads_per_month: 5,
      practices_max: 1,
      members_max: 1,
      social_scheduling: false,
      content_calendar: false,
      advanced_analytics: false,
    },
    features: [
      '10 caption generations/month',
      '1 practice profile',
      '20 knowledge notes',
      '3 voice samples',
      '5 image uploads/month',
      'Basic AI personalization',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price_monthly: 29,
    price_yearly: 290,
    limits: {
      caption_generations_per_month: 200,
      knowledge_notes_max: 500,
      voice_samples_max: 20,
      image_uploads_per_month: 100,
      practices_max: 1,
      members_max: 3,
      social_scheduling: true,
      content_calendar: true,
      advanced_analytics: false,
    },
    features: [
      '200 caption generations/month',
      '1 practice profile',
      '500 knowledge notes',
      '20 voice samples',
      '100 image uploads/month',
      'Social media scheduling',
      'Content calendar',
      'Full AI personalization',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    price_monthly: 79,
    price_yearly: 790,
    limits: {
      caption_generations_per_month: 1000,
      knowledge_notes_max: 2000,
      voice_samples_max: 100,
      image_uploads_per_month: 500,
      practices_max: 5,
      members_max: 10,
      social_scheduling: true,
      content_calendar: true,
      advanced_analytics: true,
    },
    features: [
      '1,000 caption generations/month',
      'Up to 5 practices',
      '2,000 knowledge notes',
      '100 voice samples',
      '500 image uploads/month',
      'Social media scheduling',
      'Content calendar',
      'Advanced analytics',
      'Team collaboration (10 members)',
      'Priority support',
    ],
  },
]

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const MEDIA_BUCKET = 'practice-media'

export const ONBOARDING_STEPS = [
  { step: 1, title: 'Practice Profile', description: 'Tell us about your practice' },
  { step: 2, title: 'Content Topics', description: 'What do you want to post about?' },
  { step: 3, title: 'Writing Tone', description: 'How does your practice communicate?' },
  { step: 4, title: 'Writing Voice', description: 'Share examples of your writing' },
  { step: 5, title: 'Review & Finish', description: 'Review and confirm your profile' },
] as const
