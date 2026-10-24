'use client'

import { ArrowRight, MessageCircle, MoveUpRight } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TopicSuggestion } from '@/services/ai/topic-generator'

export default function TodaysTopic({
  practiceId,
  initialTopic,
}: {
  practiceId: string
  initialTopic: TopicSuggestion
}) {
  const router = useRouter()
  const [topic, setTopic] = useState(initialTopic)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function suggestAnother() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/practices/${practiceId}/topic`, { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to suggest another topic.')
      setTopic(result.data.topic)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to suggest another topic.')
    } finally {
      setLoading(false)
    }
  }

  function createCaption() {
    const query = new URLSearchParams({
      topic: topic.title,
      prompts: topic.prompts.join('\n'),
    })
    router.push(`/dashboard/captions?${query.toString()}`)
  }

  return (
    <section className="today-topic-section" aria-labelledby="today-topic-heading">
      <div className="today-topic-label">
        <span><MessageCircle size={16} /></span>
        <h2 id="today-topic-heading">TODAY&apos;S TOPIC</h2>
      </div>
      <div className="today-topic-card">
        <div className="today-topic-badges">
          <span className="today-topic-category">{topic.category}</span>
          <span className="today-topic-difficulty">{topic.difficulty}</span>
        </div>
        <h3>{topic.title}</h3>
        <p className="today-topic-helper">Things you can talk about:</p>
        <ul>
          {topic.prompts.map((prompt) => (
            <li key={prompt}><ArrowRight size={16} aria-hidden="true" /><span>{prompt}</span></li>
          ))}
        </ul>
        {error && <p className="today-topic-error" role="alert">{error}</p>}
        <div className="today-topic-actions">
          <button className="today-topic-create" onClick={createCaption}>
            Create a caption from this topic <MoveUpRight size={16} />
          </button>
          <button className="today-topic-refresh" onClick={suggestAnother} disabled={loading}>
            {loading ? 'Finding a topic...' : 'Suggest another'}
          </button>
        </div>
      </div>
    </section>
  )
}
