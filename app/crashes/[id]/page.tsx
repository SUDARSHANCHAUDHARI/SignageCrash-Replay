'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { CrashReport, CrashSeverity, TimelineEvent } from '@/lib/types'

const SEVERITY_COLORS: Record<CrashSeverity, string> = {
  LOW: 'text-green-400 bg-green-400/10 border-green-400/30',
  MEDIUM: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  HIGH: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  CRITICAL: 'text-red-400 bg-red-400/10 border-red-400/30',
}

const LEVEL_COLORS: Record<TimelineEvent['level'], string> = {
  FATAL: 'text-red-400',
  ERROR: 'text-orange-400',
  WARN: 'text-yellow-400',
  INFO: 'text-blue-400',
  UNKNOWN: 'text-gray-500',
}

function exportMarkdown(crash: CrashReport): void {
  const lines: string[] = [
    `# Crash Report: ${crash.title}`,
    '',
    `**ID:** ${crash.id}`,
    `**Platform:** ${crash.platform}`,
    `**Severity:** ${crash.severity}`,
    `**Status:** ${crash.status}`,
    `**Created:** ${new Date(crash.createdAt).toLocaleString()}`,
    `**Affected System:** ${crash.affectedSystem}`,
    `**AI Confidence:** ${crash.confidence}`,
    '',
    '## Root Cause',
    crash.rootCause,
    '',
    '## Customer Explanation',
    crash.customerExplanation,
    '',
    '## Recommended Steps',
    ...crash.recommendedSteps.map((s, i) => `${i + 1}. ${s}`),
    '',
    '## Developer Notes',
    crash.developerNotes || '_None_',
    '',
    '## Event Timeline',
    ...crash.events.slice(0, 100).map(
      e => `- [${e.level}] ${e.timestamp ?? 'no-ts'} | ${e.category} | ${e.message}`
    ),
    '',
    '## Raw Logs',
    '```',
    crash.rawLogs,
    '```',
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `crash-${crash.id}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export default function CrashDetailPage() {
  const params = useParams<{ id: string }>()
  const [crash, setCrash] = useState<CrashReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/crashes/${params.id}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Report not found' : `HTTP ${r.status}`)
        return r.json() as Promise<CrashReport>
      })
      .then(data => {
        setCrash(data)
        setLoading(false)
      })
      .catch(err => {
        setError((err as Error).message)
        setLoading(false)
      })
  }, [params.id])

  function handleCopy() {
    if (!crash) return
    navigator.clipboard.writeText(crash.customerExplanation).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) {
    return (
      <div className="text-center py-24 text-gray-500">Loading crash report...</div>
    )
  }

  if (error || !crash) {
    return (
      <div className="text-center py-24 text-red-400">{error ?? 'Report not found'}</div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 ${SEVERITY_COLORS[crash.severity]}`}
            >
              {crash.severity}
            </span>
            <span className="text-xs text-gray-500">{crash.platform}</span>
            <span className="text-xs text-gray-500">{crash.affectedSystem}</span>
          </div>
          <h1 className="text-2xl font-bold text-white leading-snug">{crash.title}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {new Date(crash.createdAt).toLocaleString()} — AI confidence:{' '}
            <span className="text-violet-400 font-medium">{crash.confidence}</span>
          </p>
        </div>
        <button
          onClick={() => exportMarkdown(crash)}
          className="shrink-0 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Export MD
        </button>
      </div>

      {/* Screenshot strip */}
      {crash.screenshots.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Screenshots ({crash.screenshots.length})
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {crash.screenshots.map((src, i) => (
              <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Screenshot ${i + 1}`}
                  className="h-36 w-auto rounded-lg border border-gray-700 hover:border-violet-500 transition-colors object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* AI Root Cause */}
      <div className="bg-violet-950 border border-violet-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-violet-300 uppercase tracking-wider mb-3">
          AI Root Cause
        </h2>
        <p className="text-white leading-relaxed">{crash.rootCause}</p>
      </div>

      {/* Customer explanation */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Customer Explanation
          </h2>
          <button
            onClick={handleCopy}
            className="text-xs text-violet-400 hover:text-violet-300 border border-violet-800 hover:border-violet-600 px-3 py-1 rounded-md transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-gray-200 leading-relaxed">{crash.customerExplanation}</p>
      </div>

      {/* Recommended steps */}
      {crash.recommendedSteps.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Recommended Steps
          </h2>
          <ol className="space-y-2">
            {crash.recommendedSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-gray-300 text-sm">
                <span className="shrink-0 w-6 h-6 rounded-full bg-violet-900 text-violet-300 text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Developer notes */}
      {crash.developerNotes && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Developer Notes
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
            {crash.developerNotes}
          </p>
        </div>
      )}

      {/* Event timeline */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Event Timeline ({crash.events.length} events)
        </h2>
        <div className="space-y-1 max-h-96 overflow-y-auto rounded-xl border border-gray-800 p-4">
          {crash.events.map(event => (
            <div key={event.id} className="flex gap-3 font-mono text-xs">
              <span className={`shrink-0 w-14 font-semibold ${LEVEL_COLORS[event.level]}`}>
                {event.level}
              </span>
              <span className="shrink-0 text-gray-600 w-40 truncate">
                {event.timestamp ?? '—'}
              </span>
              <span className="shrink-0 text-violet-500 w-32 truncate">{event.category}</span>
              <span className="text-gray-300 truncate">{event.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
