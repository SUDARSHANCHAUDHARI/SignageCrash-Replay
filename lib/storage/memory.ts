import type { CrashReport } from '../types'
import type { CrashRepository } from './types'

export class MemoryCrashRepository implements CrashRepository {
  private readonly crashes = new Map<string, CrashReport>()

  async add(report: CrashReport): Promise<void> {
    this.crashes.set(report.id, report)
  }

  async get(id: string): Promise<CrashReport | undefined> {
    return this.crashes.get(id)
  }

  async list(): Promise<CrashReport[]> {
    return Array.from(this.crashes.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }
}
