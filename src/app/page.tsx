import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Caption AI — Social Captions That Sound Like Your Practice',
  description: 'Turn everyday clinic updates into authentic social media captions, written in your voice. Built for medical and dental practices.',
}

const features = [
  {
    icon: '🏥',
    title: 'Practice Profile',
    description: 'Set up your practice once. Caption AI learns your specialty, audience, and communication style to produce captions that are always on-brand.',
  },
  {
    icon: '🎙️',
    title: 'Personalized Voice',
    description: 'Paste examples of your previous posts, emails, or announcements. The AI matches your writing style — not generic marketing templates.',
  },
  {
    icon: '📝',
    title: 'Knowledge Bank',
    description: 'Dump your thoughts quickly. "We hired a new hygienist." "Running a June whitening promo." The AI uses your real updates in every caption.',
  },
  {
    icon: '✨',
    title: 'AI Caption Generation',
    description: 'Generate 1, 3, 5, or 10 caption variants in seconds. Each caption uses your profile, voice, and notes — not invented facts.',
  },
  {
    icon: '🖼️',
    title: 'Image Attachments',
    description: 'Upload clinic photos directly. Attach images to captions and schedule posts with visuals, all from one place.',
  },
  {
    icon: '📅',
    title: 'Content Calendar',
    description: 'See all scheduled posts in a visual calendar. Track what\'s published, pending, and upcoming across your social accounts.',
  },
]

const steps = [
  { num: '01', title: 'Set up your practice', desc: 'Complete your practice profile, select content topics, and share a few writing samples.' },
  { num: '02', title: 'Add your thoughts', desc: 'Drop quick notes into your knowledge bank — promotions, announcements, updates, FAQs.' },
  { num: '03', title: 'Generate captions', desc: 'Pick a topic, choose a platform, and get authentic captions written in your voice.' },
  { num: '04', title: 'Review and schedule', desc: 'Edit if needed, attach an image, and schedule directly to Instagram or Facebook via Postiz.' },
]

const faqs = [
  {
    q: 'Is Caption AI specific to medical and dental practices?',
    a: 'Yes. Caption AI is designed for healthcare professionals — dentists, dermatologists, general physicians, and specialists. The AI is prompted to follow medical content standards and avoids unsupported clinical claims.',
  },
  {
    q: 'Does the AI learn my writing style permanently?',
    a: 'Caption AI uses your writing samples as contextual style references during generation. It does not permanently fine-tune a model on your samples.',
  },
  {
    q: 'Will captions include invented facts or guarantees?',
    a: 'No. The AI is instructed to use only the facts you provide in your practice profile and knowledge bank. It will not invent prices, outcomes, statistics, or patient stories.',
  },
  {
    q: 'What social platforms are supported?',
    a: 'Caption AI generates captions optimized for Instagram and Facebook. Scheduling is handled through Postiz, which supports multiple platforms.',
  },
  {
    q: 'Is my practice data kept private?',
    a: 'Yes. Your practice data, voice samples, and notes are stored in your private account and are never shared with other users. We recommend not including patient-identifying information in your notes.',
  },
  {
    q: 'Can I try Caption AI for free?',
    a: 'Yes. The Free plan allows up to 10 caption generations per month with one practice profile. No credit card required to start.',
  },
]

export default function HomePage() {
  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* ─── Mobile App Mode Banner ────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(90deg, #064E3B 0%, #047857 100%)',
        color: '#FFFFFF',
        padding: '0.5rem 1rem',
        fontSize: '0.8125rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.625rem',
        textAlign: 'center',
      }}>
        <span>📱 Mobile App View Available:</span>
        <Link href="/welcome" style={{ color: '#A7F3D0', textDecoration: 'underline', fontWeight: 700 }}>
          Launch Mobile App Interface →
        </Link>
      </div>

      {/* ─── Navigation ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250, 250, 246, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, width: '100%' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 18, fontWeight: 700,
            }}>C</div>
            <span style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-charcoal)' }}>Caption AI</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="landing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginRight: '0.5rem' }}>
              <Link href="#features" style={{ fontSize: '0.875rem', color: 'var(--color-secondary-text)', fontWeight: 500, textDecoration: 'none' }}>Features</Link>
              <Link href="#pricing" style={{ fontSize: '0.875rem', color: 'var(--color-secondary-text)', fontWeight: 500, textDecoration: 'none' }}>Pricing</Link>
            </div>
            <Link href="/sign-in" className="btn btn-ghost btn-sm" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}>Sign in</Link>
            <Link href="/sign-in" className="btn btn-primary btn-sm" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>⚡ Try Demo</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '4rem 1rem 3rem', textAlign: 'center', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <div className="badge badge-lavender" style={{ marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
          ✨ Built for medical &amp; dental practices
        </div>

        <h1 className="hero-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, color: 'var(--color-charcoal)', marginBottom: '1.25rem', lineHeight: 1.15 }}>
          Social captions that sound<br />
          <span style={{ color: 'var(--color-primary)' }}>like your practice.</span>
        </h1>

        <p style={{ fontSize: '1.0625rem', color: 'var(--color-secondary-text)', maxWidth: 640, margin: '0 auto 2rem', lineHeight: 1.7 }}>
          Turn everyday clinic updates and medical insights into authentic social media captions,
          written in your voice and ready for Instagram and Facebook.
        </p>

        <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%', maxWidth: 500, margin: '0 auto' }}>
          <Link href="/sign-in" className="btn btn-primary btn-lg" style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
            ⚡ Try Live Demo
          </Link>
          <Link href="/sign-up" className="btn btn-secondary btn-lg" style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>
            Start creating captions
          </Link>
        </div>

        <p style={{ marginTop: '1.25rem', fontSize: '0.8125rem', color: 'var(--color-secondary-text)' }}>
          Free plan available · No credit card required
        </p>

        {/* Dashboard Preview (Demo) */}
        <div className="card" style={{ marginTop: '3rem', padding: '0', overflow: 'hidden', textAlign: 'left', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-border)', width: '100%' }}>
          {/* Demo label */}
          <div style={{ background: 'var(--color-amber-light)', padding: '0.5rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.75rem', color: 'var(--color-amber)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚠</span> Sample demonstration — not real data
          </div>

          {/* Mock Dashboard */}
          <div className="landing-preview-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 380, width: '100%' }}>
            {/* Sidebar */}
            <div className="landing-preview-sidebar" style={{ background: 'var(--color-white)', borderRight: '1px solid var(--color-border)', padding: '1.25rem 0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-secondary-text)', padding: '0 0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Menu</div>
              {['Overview', 'Generate Captions', 'Knowledge Bank', 'Drafts', 'Calendar'].map((item, i) => (
                <div key={item} className={`sidebar-link ${i === 1 ? 'active' : ''}`} style={{ pointerEvents: 'none' }}>
                  <span style={{ fontSize: '0.8125rem' }}>{['📊', '✨', '📝', '📄', '📅'][i]}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="landing-preview-content" style={{ padding: '1.5rem', background: 'var(--color-bg)', width: '100%', overflow: 'hidden' }}>
              <h3 style={{ fontSize: '1.0625rem', marginBottom: '1rem', color: 'var(--color-charcoal)' }}>Generated Captions</h3>
              {[
                {
                  platform: 'Instagram', text: '🦷 Big news at Smile Studio! We just welcomed Dr. Sarah, our new hygienist, to the team. With 8 years of experience, she brings incredible expertise in preventive care and patient comfort...',
                  badge: 'draft', review: true,
                },
                {
                  platform: 'Facebook', text: 'June is Smile Month and we\'re celebrating with an exclusive whitening offer! For a limited time, our in-office whitening treatment is available at a special rate for new patients...',
                  badge: 'draft', review: true,
                },
              ].map((cap, i) => (
                <div key={i} className="card card-hover ai-glow" style={{ marginBottom: '0.75rem', padding: '1rem', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                    <span className="badge badge-lavender" style={{ fontSize: '0.6875rem' }}>{cap.platform}</span>
                    {cap.review && <span className="badge badge-amber" style={{ fontSize: '0.6875rem' }}>Review suggested</span>}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-charcoal)', lineHeight: 1.6, margin: 0 }}>{cap.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '5rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '1rem' }}>
            Everything your practice needs to<br />show up consistently online
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'var(--color-secondary-text)', maxWidth: 560, margin: '0 auto' }}>
            Caption AI handles the writing. You handle the care.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {features.map((f) => (
            <div key={f.title} className="card card-hover" style={{ padding: '1.75rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.0625rem', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-secondary-text)', lineHeight: 1.65, margin: 0 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '5rem 1.5rem', background: 'var(--color-white)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '1rem' }}>How it works</h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--color-secondary-text)' }}>
              From a quick thought to a scheduled post — in four steps.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            {steps.map((s) => (
              <div key={s.num} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'var(--color-mint)',
                  color: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '1.125rem',
                  margin: '0 auto 1rem',
                }}>{s.num}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary-text)', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '5rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '1rem' }}>Simple, transparent pricing</h2>
          <p style={{ fontSize: '1.0625rem', color: 'var(--color-secondary-text)' }}>Start free. Upgrade when you need more.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            { name: 'Free', price: '$0', period: '/month', highlight: false, cta: 'Get started free', href: '/sign-up', features: ['10 caption generations/month', '1 practice profile', '20 knowledge notes', '3 voice samples', 'Basic AI personalization'] },
            { name: 'Pro', price: '$29', period: '/month', highlight: true, cta: 'Start Pro trial', href: '/sign-up', features: ['200 caption generations/month', '1 practice', '500 knowledge notes', 'Social media scheduling', 'Content calendar', 'Full AI personalization'] },
            { name: 'Team', price: '$79', period: '/month', highlight: false, cta: 'Contact us', href: '/sign-up', features: ['1,000 generations/month', 'Up to 5 practices', 'Team collaboration (10 members)', 'Advanced analytics', 'Priority support'] },
          ].map((plan) => (
            <div key={plan.name} className={`card ${plan.highlight ? '' : ''}`} style={{
              padding: '2rem',
              border: plan.highlight ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              position: 'relative',
              boxShadow: plan.highlight ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
            }}>
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary)', color: 'white', padding: '0.25rem 0.875rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  Most popular
                </div>
              )}
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{plan.name}</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-charcoal)' }}>{plan.price}</span>
                <span style={{ color: 'var(--color-secondary-text)', fontSize: '0.875rem' }}>{plan.period}</span>
              </div>
              <Link href={plan.href} className={`btn ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', marginBottom: '1.5rem' }}>
                {plan.cta}
              </Link>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-secondary-text)' }}>
                    <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: '5rem 1.5rem', background: 'var(--color-white)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', textAlign: 'center', marginBottom: '3rem' }}>Frequently asked questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {faqs.map((faq) => (
              <div key={faq.q} className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.625rem', color: 'var(--color-charcoal)' }}>{faq.q}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-secondary-text)', lineHeight: 1.65, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center', background: 'var(--color-mint)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '1rem', color: 'var(--color-charcoal)' }}>
            Ready to start posting consistently?
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'var(--color-secondary-text)', marginBottom: '2rem' }}>
            Your practice. Your voice. Your next post.
          </p>
          <Link href="/sign-up" className="btn btn-primary btn-lg">
            Create your free account
          </Link>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ padding: '2.5rem 1.5rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-white)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>C</div>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-charcoal)' }}>Caption AI</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Contact', '/contact']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: '0.875rem', color: 'var(--color-secondary-text)', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-secondary-text)', margin: 0 }}>
            © 2025 Caption AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
