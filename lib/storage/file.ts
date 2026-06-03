import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { CrashReport } from '../types'
import type { CrashRepository } from './types'

export class FileCrashRepository implements CrashRepository {
  private readonly filePath: string
  private writeQueue = Promise.resolve()

  constructor(dataDir = process.env.SIGNAGE_DATA_DIR ?? join(process.cwd(), '.signage-data')) {
    this.filePath = join(dataDir, 'crash-reports.json')
  }

  async add(report: CrashReport): Promise<void> {
    await this.withWriteLock(async () => {
      const reports = await this.readAll()
      const next = new Map(reports.map(item => [item.id, item]))
      next.set(report.id, report)
      await this.writeAll(Array.from(next.values()))
    })
  }

  async get(id: string): Promise<CrashReport | undefined> {
    return (await this.readAll()).find(report => report.id === id)
  }

  async list(): Promise<CrashReport[]> {
    return (await this.readAll()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  private async readAll(): Promise<CrashReport[]> {
    try {
      const raw = await readFile(this.filePath, 'utf8')
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed as CrashReport[] : []
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
      throw error
    }
  }

  private async writeAll(reports: CrashReport[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true })
    const tempPath = `${this.filePath}.tmp`
    await writeFile(tempPath, `${JSON.stringify(reports, null, 2)}\n`, 'utf8')
    await rename(tempPath, this.filePath)
  }

  private async withWriteLock(operation: () => Promise<void>): Promise<void> {
    this.writeQueue = this.writeQueue.then(operation, operation)
    return this.writeQueue
  }
}
