// Cloudflare Pages Function — serves POST + GET /api/crashes.
// Ported from app/api/crashes/route.ts. Crash reports persist in Cloudflare KV
// (binding: SIGNAGE_KV) instead of the filesystem.
import { nanoid } from 'nanoid'
import { parseLogs } from '../../lib/logParser'
import { chat, type AIProvider } from '../../lib/ai'
import { KVCrashRepository, type KVNamespaceLike } from '../../lib/storage/kv'
import type { CrashReport, DevicePlatform, CrashSeverity } from '../../lib/types'

const MAX_LOG_CHARS = 300_000
const MAX_IMAGE_COUNT = 5
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

const SYSTEM_PROMPT = `You are an expert digital signage device reliability engineer with deep experience in diagnosing crashes on signage devices, Android, Fire OS, Tizen, webOS, and Windows signage players. Analyze the provided logs and crash context, then return a JSON object with the following fields:
- rootCause: concise technical explanation of the crash root cause
- customerExplanation: plain English explanation suitable for a non-technical customer (2-3 sentences)
- developerNotes: technical notes for the engineering team including stack traces, relevant modules, and failure patterns
- recommendedSteps: array of strings — ordered list of steps to investigate and resolve the crash
- affectedSystem: the primary subsystem affected (e.g. "Media Player", "Network Stack", "Content Cache", "Display Driver")
- confidence: "LOW" | "MEDIUM" | "HIGH" — your confidence in this diagnosis
- severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" — the crash severity

Return ONLY valid JSON. No markdown fences, no explanation outside the JSON.`

interface AIAnalysis {
  rootCause: string
  customerExplanation: string
  developerNotes: string
  recommendedSteps: string[]
  affectedSystem: string
  confidence: 'LOW' | 'MEDIUM' | 'HIGH'
  severity: CrashSeverity
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function parseAIResponse(raw: string): AIAnalysis {
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
  const parsed = JSON.parse(cleaned) as Partial<AIAnalysis>
  return {
    rootCause: parsed.rootCause ?? 'Unable to determine root cause',
    customerExplanation: parsed.customerExplanation ?? 'An unexpected error occurred on your device.',
    developerNotes: parsed.developerNotes ?? '',
    recommendedSteps: Array.isArray(parsed.recommendedSteps) ? parsed.recommendedSteps : [],
    affectedSystem: parsed.affectedSystem ?? 'Unknown',
    confidence: parsed.confidence ?? 'LOW',
    severity: parsed.severity ?? 'MEDIUM',
  }
}

type Ctx = { request: Request; env: { SIGNAGE_KV: KVNamespaceLike } }

export const onRequestPost = async (context: Ctx): Promise<Response> => {
  try {
    const request = context.request
    // Bring-your-own-key: supplied by the user per request, never stored server-side.
    const apiKey = request.headers.get('x-api-key') ?? ''
    const provider: AIProvider = request.headers.get('x-ai-provider') === 'openai' ? 'openai' : 'claude'

    const formData = await request.formData()
    const title = formData.get('title') as string | null
    const platform = formData.get('platform') as string | null
    const logs = formData.get('logs') as string | null
    const notes = formData.get('notes') as string | null
    const imageFiles = formData.getAll('images') as File[]

    if (!title || typeof title !== 'string') return json({ error: 'title is required' }, 400)
    if (!platform || typeof platform !== 'string') return json({ error: 'platform is required' }, 400)
    if (!logs || typeof logs !== 'string') return json({ error: 'logs is required' }, 400)
    if (logs.length > MAX_LOG_CHARS) return json({ error: `logs must be ${MAX_LOG_CHARS} characters or fewer` }, 413)
    if (imageFiles.length > MAX_IMAGE_COUNT) return json({ error: `maximum ${MAX_IMAGE_COUNT} screenshots allowed` }, 400)
    for (const file of imageFiles) {
      if (!ACCEPTED_IMAGE_TYPES.has(file.type)) return json({ error: 'screenshots must be PNG, JPEG, or WebP' }, 400)
      if (file.size > MAX_IMAGE_BYTES) return json({ error: 'each screenshot must be 5MB or smaller' }, 413)
    }

    // Read images as base64 (nodejs_compat provides Buffer)
    const screenshots: string[] = []
    for (const file of imageFiles) {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      screenshots.push(`data:${file.type};base64,${base64}`)
    }

    const { events, severity: parsedSeverity } = parseLogs(logs)

    const userMessage = `
Title: ${title}
Platform: ${platform}
Developer Notes: ${notes ?? 'None'}
Screenshot count: ${screenshots.length}

Raw Logs:
${logs}

Parsed events summary:
${events.slice(0, 50).map(e => `[${e.level}] ${e.category}: ${e.message.slice(0, 200)}`).join('\n')}
`.trim()

    let analysis: AIAnalysis
    try {
      const raw = await chat(SYSTEM_PROMPT, userMessage, { provider, apiKey })
      analysis = parseAIResponse(raw)
    } catch (aiError) {
      console.error('AI analysis failed:', aiError)
      analysis = {
        rootCause: 'AI analysis unavailable. Manual review required.',
        customerExplanation: 'We encountered an issue analyzing this crash automatically. Our team will review it manually.',
        developerNotes: notes ?? '',
        recommendedSteps: ['Review raw logs manually', 'Check device health metrics', 'Restart affected service'],
        affectedSystem: 'Unknown',
        confidence: 'LOW',
        severity: parsedSeverity,
      }
    }

    const report: CrashReport = {
      id: nanoid(),
      title: title.trim(),
      platform: platform as DevicePlatform,
      severity: analysis.severity,
      status: 'OPEN',
      screenshots,
      rawLogs: logs,
      events,
      rootCause: analysis.rootCause,
      customerExplanation: analysis.customerExplanation,
      developerNotes: analysis.developerNotes,
      recommendedSteps: analysis.recommendedSteps,
      affectedSystem: analysis.affectedSystem,
      confidence: analysis.confidence,
      createdAt: new Date().toISOString(),
    }

    await new KVCrashRepository(context.env.SIGNAGE_KV).add(report)
    return json(report, 201)
  } catch (error) {
    console.error('POST /api/crashes error:', error)
    return json({ error: 'Internal server error' }, 500)
  }
}

export const onRequestGet = async (context: Ctx): Promise<Response> => {
  const crashes = await new KVCrashRepository(context.env.SIGNAGE_KV).list()
  return json(crashes)
}
