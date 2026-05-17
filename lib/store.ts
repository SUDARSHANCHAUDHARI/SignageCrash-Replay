import type { CrashReport } from './types'

const crashes = new Map<string, CrashReport>()

export function addCrash(c: CrashReport): void {
  crashes.set(c.id, c)
}

export function getCrash(id: string): CrashReport | undefined {
  return crashes.get(id)
}

export function listCrashes(): CrashReport[] {
  return Array.from(crashes.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}
