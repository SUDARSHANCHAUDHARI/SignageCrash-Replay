export type CrashSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type DevicePlatform = 'SIGNAGE_DEVICE' | 'WINDOWS' | 'ANDROID' | 'FIRE_OS' | 'TIZEN' | 'WEBOS' | 'OTHER'
export type CrashStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED'

export interface TimelineEvent {
  id: string
  timestamp: string | null
  level: 'ERROR' | 'WARN' | 'INFO' | 'FATAL' | 'UNKNOWN'
  category: string
  message: string
}

export interface CrashReport {
  id: string
  title: string
  platform: DevicePlatform
  severity: CrashSeverity
  status: CrashStatus
  screenshots: string[]   // base64 data URLs
  rawLogs: string
  events: TimelineEvent[]
  rootCause: string
  customerExplanation: string
  developerNotes: string
  recommendedSteps: string[]
  affectedSystem: string
  confidence: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt: string
}
