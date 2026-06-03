import type { CrashReport } from './types'
import { getCrashRepository } from './storage'

export async function addCrash(report: CrashReport): Promise<void> {
  await getCrashRepository().add(report)
}

export async function getCrash(id: string): Promise<CrashReport | undefined> {
  return getCrashRepository().get(id)
}

export async function listCrashes(): Promise<CrashReport[]> {
  return getCrashRepository().list()
}
