import type { CrashReport } from '../types'
import type { CrashRepository } from './types'

// Minimal shape of a Cloudflare KV namespace — only the methods this driver uses.
// Declared locally so lib/ stays typecheckable without @cloudflare/workers-types.
export interface KVNamespaceLike {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
  list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>
}

const KEY_PREFIX = 'crash:'
const keyFor = (id: string) => `${KEY_PREFIX}${id}`

/**
 * Cloudflare KV-backed crash store. Each crash report is one JSON value under
 * `crash:<id>`. Persists across requests/isolates (unlike the memory driver).
 */
export class KVCrashRepository implements CrashRepository {
  constructor(private readonly kv: KVNamespaceLike) {}

  async add(report: CrashReport): Promise<void> {
    await this.kv.put(keyFor(report.id), JSON.stringify(report))
  }

  async get(id: string): Promise<CrashReport | undefined> {
    const raw = await this.kv.get(keyFor(id))
    return raw ? (JSON.parse(raw) as CrashReport) : undefined
  }

  async list(): Promise<CrashReport[]> {
    const { keys } = await this.kv.list({ prefix: KEY_PREFIX })
    const reports = await Promise.all(
      keys.map(async (k) => {
        const raw = await this.kv.get(k.name)
        return raw ? (JSON.parse(raw) as CrashReport) : null
      })
    )
    return reports
      .filter((r): r is CrashReport => r !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}
