'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { CrashReport, CrashSeverity } from '@/lib/types'

const SEVERITY_COLORS: Record<CrashSeverity, string> = {
  LOW: 'text-green-400 bg-green-400/10 border-green-400/30',
  MEDIUM: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  HIGH: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  CRITICAL: 'text-red-400 bg-red-400/10 border-red-400/30',
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'text-blue-400',
  INVESTIGATING: 'text-yellow-400',
  RESOLVED: 'text-green-400',
}

export default function DashboardPage() {
  const [crashes, setCrashes] = useState<CrashReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/crashes')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<CrashReport[]>
      })
      .then(data => {
        setCrashes(data)
        setLoading(false)
      })
      .catch(err => {
        setError((err as Error).message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Crash Reports</h1>
          <p className="text-gray-400 mt-1">All crash reports — most recent first</p>
        </div>
        <Link
          href="/crashes/new"
          className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Report Crash
        </Link>
      </div>

      {loading && (
        <div className="text-center py-24 text-gray-500">Loading crash reports...</div>
      )}

      {error && (
        <div className="text-center py-24 text-red-400">Failed to load: {error}</div>
      )}

      {!loading && !error && crashes.length === 0 && (
        <div className="text-center py-24">
          <p className="text-gray-500 text-lg mb-4">No crash reports yet.</p>
          <Link
            href="/crashes/new"
            className="text-violet-400 hover:text-violet-300 underline underline-offset-4"
          >
            Report your first crash
          </Link>
        </div>
      )}

      {crashes.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {crashes.map(crash => (
            <Link key={crash.id} href={`/crashes/view?id=${crash.id}`}>
              <div className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-5 transition-colors cursor-pointer h-full">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 ${SEVERITY_COLORS[crash.severity]}`}
                  >
                    {crash.severity}
                  </span>
                  <span className={`text-xs font-medium ${STATUS_COLORS[crash.status] ?? 'text-gray-400'}`}>
                    {crash.status}
                  </span>
                </div>
                <h3 className="text-white font-medium leading-snug mb-2 line-clamp-2">
                  {crash.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">{crash.rootCause}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{crash.platform}</span>
                  <span>{new Date(crash.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
