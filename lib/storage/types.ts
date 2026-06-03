import type { CrashReport } from '../types'

export interface CrashRepository {
  add(report: CrashReport): Promise<void>
  get(id: string): Promise<CrashReport | undefined>
  list(): Promise<CrashReport[]>
}
