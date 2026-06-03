import { FileCrashRepository } from './file'
import { MemoryCrashRepository } from './memory'
import type { CrashRepository } from './types'

const repository: CrashRepository =
  process.env.SIGNAGE_STORAGE_DRIVER === 'memory'
    ? new MemoryCrashRepository()
    : new FileCrashRepository()

export function getCrashRepository(): CrashRepository {
  return repository
}
