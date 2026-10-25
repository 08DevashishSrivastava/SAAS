'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  PRACTICE_TYPES, CONTENT_TOPICS, WRITING_TONES,
  VOICE_SAMPLE_SOURCE_TYPES, SUPPORTED_LANGUAGES, TIMEZONES, ONBOARDING_STEPS
} from '@/config'

interface PracticeData {
  name: string; practice_type: string; city: string; region: string;
  country: string; website: string; target_audience: string;
  preferred_language: string; timezone: string;
}
interface TopicsData { preferred_topics: string[]; custom_topics: string[] }
interface ToneData { preferred_tone: string; tone_description: string }
interface VoiceSample { id: string; title: string; content: string; source_type: string }

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [practiceId, setPracticeId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [practiceData, setPracticeData] = useState<PracticeData>({
    name: '', practice_type: '', city: '', region: '', country: 'India',
    website: '', target_audience: 'Patients seeking dental care',
    preferred_language: 'en', timezone: 'Asia/Kolkata',
  })
  const [topicsData, setTopicsData] = useState<TopicsData>({ preferred_topics: [], custom_topics: [] })
  const [toneData, setToneData] = useState<ToneData>({ preferred_tone: '', tone_description: '' })
  const [voiceSamples, setVoiceSamples] = useState<VoiceSample[]>([])
  const [newSample, setNewSample] = useState({ title: '', content: '', source_type: 'instagram_caption' })
  const [customTopic, setCustomTopic] = useState('')

  const totalSteps = ONBOARDING_STEPS.length

  useEffect(() => {
    async function loadExistingState() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/sign-in')
        return
      }

      const { data: practices } = await supabase
        .from('practices')
        .select('*')
        .limit(1)

      const practice = practices?.[0]
      if (practice) {
        setPracticeId(practice.id)
        if (practice.onboarding_completed) {
          router.push('/dashboard')
          return
        }

        setPracticeData({
          name: practice.name || '',
          practice_type: practice.practice_type || '',
          city: practice.city || '',
          region: practice.region || '',
          country: practice.country || 'India',
          website: practice.website || '',
          target_audience: practice.target_audience || 'Patients seeking dental care',
          preferred_language: practice.preferred_language || 'en',
          timezone: practice.timezone || 'Asia/Kolkata',
        })

        if (practice.preferred_topics && practice.preferred_topics.length > 0) {
          setTopicsData({
            preferred_topics: practice.preferred_topics,
            custom_topics: [],
          })
        }

        if (practice.preferred_tone) {
          setToneData({
            preferred_tone: practice.preferred_tone,
            tone_description: '',
          })
        }

        const { data: samples } = await supabase
          .from('voice_samples')
          .select('*')
          .eq('practice_id', practice.id)

        if (samples && samples.length > 0) {
          setVoiceSamples(
            samples.map((s) => ({
              id: s.id,
              title: s.title || '',
              content: s.content,
              source_type: s.source_type || '',
            }))
          )
        }

        if (!practice.name) setStep(1)
        else if (!practice.preferred_topics || practice.preferred_topics.length === 0) setStep(2)
        else if (!practice.preferred_tone) setStep(3)
        else setStep(4)
      }
    }
    loadExistingState()
  }, [router])

  // ── Step 1: Save practice ────────────────────────────────────────────────
  async function saveStep1() {
    if (!practiceData.name.trim()) { setError('Practice name is required'); return false }
    setError('')
    setSaving(true)

    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Session expired. Please sign in again.')
        return false
      }

      const { data: existingOrg, error: orgLookupError } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_user_id', user.id)
        .limit(1)
        .maybeSingle()
      if (orgLookupError) throw orgLookupError

      let orgId = existingOrg?.id
      if (!orgId) {
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({ name: practiceData.name.trim(), owner_user_id: user.id })
          .select('id')
          .single()
        if (orgError) throw orgError
        orgId = newOrg.id
      }

      const { data: membership, error: membershipLookupError } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .maybeSingle()
      if (membershipLookupError) throw membershipLookupError
      if (!membership) {
        const { error: membershipError } = await supabase
          .from('organization_members')
          .insert({ organization_id: orgId, user_id: user.id, role: 'owner' })
        if (membershipError) throw membershipError
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: user.user_metadata?.full_name || '' })
      if (profileError) throw profileError

      const { data: subscription, error: subscriptionLookupError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('organization_id', orgId)
        .maybeSingle()
      if (subscriptionLookupError) throw subscriptionLookupError
      if (!subscription) {
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert({ organization_id: orgId, plan: 'free', status: 'active' })
        if (subscriptionError) throw subscriptionError
      }

      const { data: existingPractice, error: practiceLookupError } = await supabase
        .from('practices')
        .select('id')
        .eq('organization_id', orgId)
        .limit(1)
        .maybeSingle()
      if (practiceLookupError) throw practiceLookupError

      const practicePayload = {
        name: practiceData.name.trim(),
        practice_type: practiceData.practice_type || null,
        city: practiceData.city || null,
        region: practiceData.region || null,
        country: practiceData.country || null,
        website: practiceData.website || null,
        target_audience: practiceData.target_audience || null,
        preferred_language: practiceData.preferred_language || 'en',
        timezone: practiceData.timezone || 'Asia/Kolkata',
      }

      if (existingPractice) {
        const { error: updateError } = await supabase
          .from('practices')
          .update(practicePayload)
          .eq('id', existingPractice.id)
        if (updateError) throw updateError
        setPracticeId(existingPractice.id)
      } else {
        const { data: newPractice, error: practiceError } = await supabase
          .from('practices')
          .insert({ ...practicePayload, organization_id: orgId, onboarding_completed: false })
          .select('id')
          .single()
        if (practiceError) throw practiceError
        setPracticeId(newPractice.id)
      }

      return true
    } catch (saveError) {
      console.error('[Onboarding Practice Setup Error]', saveError)
      setError(saveError instanceof Error ? saveError.message : 'Could not save your practice setup. Please try again.')
      return false
    } finally {
      setSaving(false)
    }
  }

  // ── Step 2: Save topics ──────────────────────────────────────────────────
  async function saveStep2() {
    if (topicsData.preferred_topics.length === 0) { setError('Select at least one topic'); return false }
    setError('')
    if (!practiceId) return false
    setSaving(true)
    try {
      const supabase = createClient()
      const allTopics = [...topicsData.preferred_topics, ...topicsData.custom_topics]
      const { error: updateError } = await supabase
        .from('practices')
        .update({ preferred_topics: allTopics })
        .eq('id', practiceId)
      if (updateError) throw updateError
      return true
    } catch (saveError) {
      console.error('[Onboarding Topics Error]', saveError)
      setError(saveError instanceof Error ? saveError.message : 'Could not save your topics. Please try again.')
      return false
    } finally {
      setSaving(false)
    }
  }

  // ── Step 3: Save tone ────────────────────────────────────────────────────
  async function saveStep3() {
    if (!toneData.preferred_tone) { setError('Please select a tone'); return false }
    setError('')
    if (!practiceId) return false
    setSaving(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('practices')
        .update({ preferred_tone: toneData.preferred_tone })
        .eq('id', practiceId)
      if (updateError) throw updateError
      return true
    } catch (saveError) {
      console.error('[Onboarding Tone Error]', saveError)
      setError(saveError instanceof Error ? saveError.message : 'Could not save your writing tone. Please try again.')
      return false
    } finally {
      setSaving(false)
    }
  }

  // ── Step 4: Add voice sample ─────────────────────────────────────────────
  async function addVoiceSample() {
    if (!newSample.content.trim() || !practiceId) return
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const { data, error: insertError } = await supabase.from('voice_samples')
        .insert({ practice_id: practiceId, title: newSample.title || undefined, content: newSample.content, source_type: newSample.source_type })
        .select().single()
      if (insertError) throw insertError
      setVoiceSamples(p => [...p, { ...data, title: data.title || '', source_type: data.source_type || '' }])
      setNewSample({ title: '', content: '', source_type: 'instagram_caption' })
    } catch (saveError) {
      console.error('[Onboarding Voice Sample Error]', saveError)
      setError(saveError instanceof Error ? saveError.message : 'Could not save this voice sample. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteVoiceSample(id: string) {
    setError('')
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase.from('voice_samples').delete().eq('id', id)
      if (deleteError) throw deleteError
      setVoiceSamples(p => p.filter(s => s.id !== id))
    } catch (saveError) {
      console.error('[Onboarding Voice Sample Delete Error]', saveError)
      setError(saveError instanceof Error ? saveError.message : 'Could not delete this voice sample.')
    }
  }

  // ── Step 5: Finish ───────────────────────────────────────────────────────
  async function finishOnboarding() {
    if (!practiceId) return
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('practices')
        .update({ onboarding_completed: true })
        .eq('id', practiceId)
      if (updateError) throw updateError
      router.push('/dashboard')
      router.refresh()
    } catch (saveError) {
      console.error('[Onboarding Completion Error]', saveError)
      setError(saveError instanceof Error ? saveError.message : 'Could not finish setup. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleNext() {
    let ok = false
    if (step === 1) ok = await saveStep1()
    else if (step === 2) ok = await saveStep2()
    else if (step === 3) ok = await saveStep3()
    else if (step === 4) { setError(''); ok = true }
    else if (step === 5) { await finishOnboarding(); return }
    if (ok) setStep(s => s + 1)
  }

  const toggleTopic = (t: string) => {
    setTopicsData(p => ({
      ...p,
      preferred_topics: p.preferred_topics.includes(t)
        ? p.preferred_topics.filter(x => x !== t)
        : [...p.preferred_topics, t],
    }))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-white)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>C</div>
        <span style={{ fontWeight: 700, fontSize: '1rem' }}>Caption AI</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--color-secondary-text)' }}>Practice Setup</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1.5rem' }}>
        {/* Progress */}
        <div style={{ width: '100%', maxWidth: 680, marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
              Step {step} of {totalSteps}: {ONBOARDING_STEPS[step - 1]?.title}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-secondary-text)' }}>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--color-primary)', borderRadius: 3, width: `${(step / totalSteps) * 100}%`, transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Step Content */}
        <div className="card" style={{ width: '100%', maxWidth: 680, padding: '2rem' }}>
          <h2 style={{ fontSize: '1.375rem', marginBottom: '0.5rem' }}>{ONBOARDING_STEPS[step - 1]?.title}</h2>
          <p style={{ color: 'var(--color-secondary-text)', fontSize: '0.9375rem', marginBottom: '2rem' }}>{ONBOARDING_STEPS[step - 1]?.description}</p>

          {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}><span>⚠</span> {error}</div>}

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <div className="form-group">
                <label className="label">Practice name *</label>
                <input type="text" className="input" placeholder="Smile Studio Dental Clinic" value={practiceData.name} onChange={e => setPracticeData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Practice type</label>
                <select className="input" value={practiceData.practice_type} onChange={e => setPracticeData(p => ({ ...p, practice_type: e.target.value }))}>
                  <option value="">Select type…</option>
                  {PRACTICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">City</label>
                  <input type="text" className="input" placeholder="Mumbai" value={practiceData.city} onChange={e => setPracticeData(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">State / Region</label>
                  <input type="text" className="input" placeholder="Maharashtra" value={practiceData.region} onChange={e => setPracticeData(p => ({ ...p, region: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Country</label>
                  <input type="text" className="input" placeholder="India" value={practiceData.country} onChange={e => setPracticeData(p => ({ ...p, country: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">Website <span style={{ color: 'var(--color-secondary-text)', fontWeight: 400 }}>(optional)</span></label>
                  <input type="url" className="input" placeholder="https://…" value={practiceData.website} onChange={e => setPracticeData(p => ({ ...p, website: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Target audience</label>
                <input type="text" className="input" placeholder="Adults seeking affordable dental care in Mumbai" value={practiceData.target_audience} onChange={e => setPracticeData(p => ({ ...p, target_audience: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Preferred language</label>
                  <select className="input" value={practiceData.preferred_language} onChange={e => setPracticeData(p => ({ ...p, preferred_language: e.target.value }))}>
                    {SUPPORTED_LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Timezone</label>
                  <select className="input" value={practiceData.timezone} onChange={e => setPracticeData(p => ({ ...p, timezone: e.target.value }))}>
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', marginBottom: '1.5rem' }}>
                {CONTENT_TOPICS.map(t => (
                  <button key={t} type="button"
                    onClick={() => toggleTopic(t)}
                    className={`btn btn-sm ${topicsData.preferred_topics.includes(t) ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="form-group">
                <label className="label">Add custom topic</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" className="input" placeholder="Type a custom topic…" value={customTopic} onChange={e => setCustomTopic(e.target.value)} />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      if (customTopic.trim()) {
                        setTopicsData(p => ({ ...p, custom_topics: [...p.custom_topics, customTopic.trim()] }))
                        setCustomTopic('')
                      }
                    }}
                  >Add</button>
                </div>
              </div>
              {topicsData.custom_topics.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {topicsData.custom_topics.map(t => (
                    <span key={t} className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => setTopicsData(p => ({ ...p, custom_topics: p.custom_topics.filter(x => x !== t) }))}>
                      {t} ✕
                    </span>
                  ))}
                </div>
              )}
              <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--color-secondary-text)' }}>
                {topicsData.preferred_topics.length + topicsData.custom_topics.length} topic{topicsData.preferred_topics.length + topicsData.custom_topics.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {WRITING_TONES.map(t => (
                <button key={t.value} type="button"
                  onClick={() => setToneData(p => ({ ...p, preferred_tone: t.value }))}
                  className={`btn ${toneData.preferred_tone === t.value ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <div className="alert alert-info" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                <span>ℹ</span>
                <div>Paste examples of your actual writing — previous Instagram captions, Facebook posts, patient emails, or announcements. The AI uses these as <strong>style references only</strong>, not as factual sources. Do not include patient-identifying information.</div>
              </div>

              {/* Existing samples */}
              {voiceSamples.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {voiceSamples.map(s => (
                    <div key={s.id} style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                      {s.title && <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{s.title}</div>}
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary-text)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.content}</p>
                      <button onClick={() => deleteVoiceSample(s.id)} className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem', color: 'var(--color-red)', padding: '0.25rem 0.5rem' }}>Remove</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new sample */}
              <div style={{ border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9375rem', marginBottom: '1rem' }}>Add a writing sample</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                    <div className="form-group">
                      <label className="label">Title <span style={{ color: 'var(--color-secondary-text)', fontWeight: 400 }}>(optional)</span></label>
                      <input type="text" className="input" placeholder="e.g. Our clinic intro post" value={newSample.title} onChange={e => setNewSample(p => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="label">Source type</label>
                      <select className="input" value={newSample.source_type} onChange={e => setNewSample(p => ({ ...p, source_type: e.target.value }))}>
                        {VOICE_SAMPLE_SOURCE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Sample text *</label>
                    <textarea className="input" style={{ minHeight: 120, resize: 'vertical' }} placeholder="Paste your writing here…" value={newSample.content} onChange={e => setNewSample(p => ({ ...p, content: e.target.value }))} />
                  </div>
                  <button type="button" onClick={addVoiceSample} className="btn btn-secondary" disabled={saving || !newSample.content.trim()} style={{ alignSelf: 'flex-start' }}>
                    {saving ? 'Saving…' : '+ Add sample'}
                  </button>
                </div>
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--color-secondary-text)' }}>
                {voiceSamples.length} sample{voiceSamples.length !== 1 ? 's' : ''} added. You can add more later.
              </p>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <ReviewRow label="Practice name" value={practiceData.name} />
                <ReviewRow label="Type" value={practiceData.practice_type || '—'} />
                <ReviewRow label="Location" value={[practiceData.city, practiceData.region, practiceData.country].filter(Boolean).join(', ') || '—'} />
                <ReviewRow label="Language" value={SUPPORTED_LANGUAGES.find(l => l.value === practiceData.preferred_language)?.label || practiceData.preferred_language} />
                <ReviewRow label="Timezone" value={practiceData.timezone} />
                <ReviewRow label="Content topics" value={`${topicsData.preferred_topics.length + topicsData.custom_topics.length} selected`} />
                <ReviewRow label="Writing tone" value={WRITING_TONES.find(t => t.value === toneData.preferred_tone)?.label || toneData.preferred_tone || '—'} />
                <ReviewRow label="Voice samples" value={`${voiceSamples.length} added`} />
              </div>
              <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
                <span>✅</span>
                <span>Everything looks good! Click <strong>Finish Setup</strong> to enter your dashboard.</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              className="btn btn-ghost"
              disabled={step === 1 || saving}
            >
              ← Back
            </button>
            <button onClick={handleNext} className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : step === totalSteps ? '🎉 Finish Setup' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.875rem', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--color-secondary-text)' }}>{label}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-charcoal)', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}
