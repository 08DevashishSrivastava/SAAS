import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: {
    configuration: {
      status: 'pass' | 'fail'
      message?: string
    }
    database: {
      status: 'pass' | 'fail' | 'warn'
      latency_ms?: number
      message?: string
    }
    auth_service: {
      status: 'pass' | 'fail'
      latency_ms?: number
      message?: string
    }
    services: {
      openai_configured: boolean
      postiz_configured: boolean
      encryption_configured: boolean
      demo_login_enabled: boolean
    }
  }
}

export async function GET() {
  const startTime = Date.now()
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      configuration: { status: 'pass' },
      database: { status: 'pass' },
      auth_service: { status: 'pass' },
      services: {
        openai_configured: Boolean(
          process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('placeholder')
        ),
        postiz_configured: Boolean(
          process.env.POSTIZ_API_BASE_URL && !process.env.POSTIZ_API_BASE_URL.includes('placeholder')
        ),
        encryption_configured: Boolean(
          process.env.APPLICATION_ENCRYPTION_KEY && process.env.APPLICATION_ENCRYPTION_KEY.length === 64
        ),
        demo_login_enabled: process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === 'true',
      },
    },
  }

  // 1. Configuration check
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    result.status = 'unhealthy'
    result.checks.configuration = {
      status: 'fail',
      message: 'Missing required Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).',
    }
    return NextResponse.json(result, { status: 503 })
  }

  // 2. Auth service check (settings endpoint check)
  const authStart = Date.now()
  try {
    const authUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/settings`
    const authRes = await fetch(authUrl, {
      headers: {
        apikey: supabaseAnonKey,
      },
      signal: AbortSignal.timeout(5000),
    })

    result.checks.auth_service.latency_ms = Date.now() - authStart

    if (!authRes.ok) {
      result.status = 'degraded'
      result.checks.auth_service = {
        status: 'fail',
        latency_ms: Date.now() - authStart,
        message: `Auth service returned status ${authRes.status}`,
      }
    }
  } catch (authErr) {
    result.status = 'unhealthy'
    result.checks.auth_service = {
      status: 'fail',
      latency_ms: Date.now() - authStart,
      message: authErr instanceof Error ? authErr.message : 'Unable to connect to Supabase Auth service',
    }
  }

  // 3. Database query & permission check
  const dbStart = Date.now()
  try {
    const supabase = await createClient()
    // Perform a lightweight query against organizations or public tables
    const { error: dbError } = await supabase
      .from('organizations')
      .select('id', { head: true, count: 'exact' })
      .limit(1)

    result.checks.database.latency_ms = Date.now() - dbStart

    if (dbError) {
      // Permission vs query failure
      result.status = 'degraded'
      result.checks.database = {
        status: 'warn',
        latency_ms: Date.now() - dbStart,
        message: `Database query returned: ${dbError.message}`,
      }
    }
  } catch (dbErr) {
    result.status = 'unhealthy'
    result.checks.database = {
      status: 'fail',
      latency_ms: Date.now() - dbStart,
      message: dbErr instanceof Error ? dbErr.message : 'Database connection error',
    }
  }

  const statusCode = result.status === 'unhealthy' ? 503 : 200
  return NextResponse.json({ ...result, total_duration_ms: Date.now() - startTime }, { status: statusCode })
}
