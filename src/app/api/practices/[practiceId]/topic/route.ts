/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  notFoundResponse,
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/security/api-response'
import { generatePracticeTopic } from '@/services/ai/topic-generator'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ practiceId: string }> },
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorizedResponse()

    const { practiceId } = await params
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('id, name, practice_type, specialties, preferred_tone, preferred_topics')
      .eq('id', practiceId)
      .single()

    if (practiceError || !practice) return notFoundResponse('Practice')

    const { data: notes, error: notesError } = await supabase
      .from('knowledge_notes')
      .select('title, content, category')
      .eq('practice_id', practiceId)
      .is('archived_at', null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(8)

    if (notesError) {
      console.error('[Topic Notes Error]', notesError.message)
    }

    const topic = await generatePracticeTopic({
      name: practice.name,
      practiceType: practice.practice_type,
      specialties: practice.specialties,
      tone: practice.preferred_tone,
      preferredTopics: practice.preferred_topics,
      notes: notes ?? [],
    })

    return successResponse({ topic })
  } catch (error) {
    return serverErrorResponse(error, 'practice topic suggestion')
  }
}
