import { nanoid } from 'nanoid'
import type { TimelineEvent, CrashSeverity } from './types'

type EventLevel = TimelineEvent['level']

const LEVEL_PATTERNS: Array<{ level: EventLevel; pattern: RegExp }> = [
  { level: 'FATAL', pattern: /\b(fatal|critical error|unrecoverable)\b/i },
  { level: 'ERROR', pattern: /\b(error|err|exception|crash|fail|failed|failure)\b/i },
  { level: 'WARN', pattern: /\b(warn|warning|deprecated)\b/i },
  { level: 'INFO', pattern: /\b(info|log|debug)\b/i },
]

const CATEGORY_PATTERNS: Array<{ category: string; pattern: RegExp }> = [
  { category: 'CSP_ERROR', pattern: /content security policy|csp violation|refused to (load|execute)/i },
  { category: 'NETWORK_FAILURE', pattern: /net::|network (error|failure|timeout)|failed to fetch|connection refused|ECONNREFUSED|ETIMEDOUT|dns/i },
  { category: 'PLAYER_CRASH', pattern: /player (crash|error|fail)|media player|video player|playback (error|fail)/i },
  { category: 'MEMORY_PRESSURE', pattern: /out of memory|oom|memory (pressure|warning|critical)|heap (limit|overflow)/i },
  { category: 'MEDIA_LOAD_FAILED', pattern: /media (load|decode|source) (error|failed)|failed to load (media|resource|image|video)/i },
  { category: 'CACHE_FAILURE', pattern: /cache (error|fail|miss|corrupt|invalid)|storage quota|indexeddb/i },
  { category: 'DEVICE_OFFLINE', pattern: /offline|no (internet|network|connectivity)|disconnected/i },
  { category: 'BLACK_SCREEN', pattern: /black screen|blank (screen|display)|display (off|failure|error)|screen (blank|dark)/i },
]

// Timestamp patterns: ISO 8601, epoch ms, common log formats
const TIMESTAMP_PATTERNS: RegExp[] = [
  /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)/,
  /(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}(?:\.\d+)?)/,
  /(\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2})/,
  /(\d{13})/,  // epoch ms
  /(\d{2}:\d{2}:\d{2}(?:\.\d+)?)/,  // HH:MM:SS
]

function extractTimestamp(line: string): string | null {
  for (const pattern of TIMESTAMP_PATTERNS) {
    const match = line.match(pattern)
    if (match?.[1]) {
      const raw = match[1]
      // epoch ms
      if (/^\d{13}$/.test(raw)) {
        return new Date(parseInt(raw, 10)).toISOString()
      }
      return raw
    }
  }
  return null
}

function detectLevel(line: string): EventLevel {
  for (const { level, pattern } of LEVEL_PATTERNS) {
    if (pattern.test(line)) return level
  }
  return 'UNKNOWN'
}

function detectCategory(line: string): string {
  for (const { category, pattern } of CATEGORY_PATTERNS) {
    if (pattern.test(line)) return category
  }
  return 'UNKNOWN'
}

export interface ParseResult {
  events: TimelineEvent[]
  severity: CrashSeverity
}

export function parseLogs(rawLogs: string): ParseResult {
  const lines = rawLogs.split('\n').filter(l => l.trim().length > 0)
  const events: TimelineEvent[] = []

  let fatalCount = 0
  let errorCount = 0
  let warnCount = 0

  for (const line of lines) {
    const level = detectLevel(line)
    const category = detectCategory(line)
    const timestamp = extractTimestamp(line)

    if (level === 'FATAL') fatalCount++
    else if (level === 'ERROR') errorCount++
    else if (level === 'WARN') warnCount++

    events.push({
      id: nanoid(),
      timestamp,
      level,
      category,
      message: line.trim(),
    })
  }

  let severity: CrashSeverity = 'LOW'
  if (fatalCount > 0) {
    severity = 'CRITICAL'
  } else if (errorCount >= 5) {
    severity = 'HIGH'
  } else if (errorCount >= 2 || warnCount >= 10) {
    severity = 'MEDIUM'
  }

  return { events, severity }
}
