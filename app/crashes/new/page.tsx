'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { DevicePlatform } from '@/lib/types'
import ApiKeySettings from '@/components/ApiKeySettings'
import { getAiHeaders } from '@/lib/apiKey'

const PLATFORMS: Array<{ value: DevicePlatform; label: string }> = [
  { value: 'SIGNAGE_DEVICE', label: 'Signage device' },
  { value: 'WINDOWS', label: 'Windows' },
  { value: 'ANDROID', label: 'Android' },
  { value: 'FIRE_OS', label: 'Fire OS' },
  { value: 'TIZEN', label: 'Tizen' },
  { value: 'WEBOS', label: 'webOS' },
  { value: 'OTHER', label: 'Other' },
]

interface ImagePreview {
  name: string
  dataUrl: string
  file: File
}

export default function NewCrashPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState<DevicePlatform>('SIGNAGE_DEVICE')
  const [logs, setLogs] = useState('')
  const [notes, setNotes] = useState('')
  const [images, setImages] = useState<ImagePreview[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5 - images.length)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = event => {
        const dataUrl = event.target?.result as string
        setImages(prev => {
          if (prev.length >= 5) return prev
          return [...prev, { name: file.name, dataUrl, file }]
        })
      }
      reader.readAsDataURL(file)
    })
    // Reset input so same files can be re-selected after removal
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) { setError('Title is required'); return }
    if (!logs.trim()) { setError('Logs are required'); return }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('platform', platform)
      formData.append('logs', logs)
      formData.append('notes', notes)
      images.forEach(img => formData.append('images', img.file))

      const res = await fetch('/api/crashes', { method: 'POST', body: formData, headers: { ...getAiHeaders() } })
      if (!res.ok) {
        const body = await res.json() as { error?: string }
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      const result = await res.json() as { id: string }
      router.push(`/crashes/view?id=${result.id}`)
    } catch (err) {
      setError((err as Error).message)
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">Report a Crash</h1>
          <ApiKeySettings />
        </div>
        <p className="text-gray-400 mt-1">
          Upload screenshots and paste logs — AI will reconstruct the timeline.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Crash Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Black screen on lobby display after content update"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Platform */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Device Platform <span className="text-red-400">*</span>
          </label>
          <select
            value={platform}
            onChange={e => setPlatform(e.target.value as DevicePlatform)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
          >
            {PLATFORMS.map(p => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Logs */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Device Logs <span className="text-red-400">*</span>
          </label>
          <textarea
            value={logs}
            onChange={e => setLogs(e.target.value)}
            rows={10}
            placeholder="Paste raw device logs, browser console output, or syslog here..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-violet-500 transition-colors resize-y"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Developer Notes <span className="text-gray-500">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Any additional context: what triggered it, recent deployments, device history..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-y"
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Screenshots{' '}
            <span className="text-gray-500">(up to 5 images)</span>
          </label>

          {images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-700 hover:border-violet-600 rounded-lg py-6 text-gray-400 hover:text-violet-400 transition-colors text-sm"
            >
              Click to upload screenshots
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {images.length > 0 && (
            <div className="mt-3 flex gap-3 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.dataUrl}
                    alt={img.name}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 hover:bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900 disabled:text-violet-600 text-white py-3 rounded-lg font-medium transition-colors"
        >
          {submitting ? 'Analyzing crash with AI...' : 'Submit & Analyze'}
        </button>
      </form>
    </div>
  )
}
