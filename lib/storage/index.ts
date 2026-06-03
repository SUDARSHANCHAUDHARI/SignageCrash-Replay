import { MemoryCrashRepository } from './memory'
import type { CrashRepository } from './types'

const repository: CrashRepository = new MemoryCrashRepository()

export function getCrashRepository(): CrashRepository {
  return repository
}
