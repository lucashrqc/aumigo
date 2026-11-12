import type { BlobStorage } from '../storage/blob-storage'
import type { MaintenanceRepository } from '../repositories/maintenance.repository'
import type { BlobSweepOrphan, BlobSweepReportDto } from '#shared/types'

export const MAX_SWEEP_DELETIONS = 200
const SWEEP_PREFIXES = ['pets/', 'avatars/'] as const

export interface SweepOptions {
  minAgeHours: number
  deleteOrphans: boolean
}

/**
 * Lists Blob storage, diffs it against referenced DB URLs, and reports (or
 * deletes) orphans past a grace period. Deletions are capped to bound a run.
 */
export class MaintenanceService {
  constructor(
    private readonly blob: BlobStorage,
    private readonly repo: MaintenanceRepository,
  ) {}

  async sweepBlobs({
    minAgeHours,
    deleteOrphans,
  }: SweepOptions): Promise<BlobSweepReportDto> {
    const referenced = new Set(await this.repo.listReferencedImageUrls())
    const now = Date.now()
    let scanned = 0
    const orphans: BlobSweepOrphan[] = []

    for (const prefix of SWEEP_PREFIXES) {
      const blobs = await this.blob.list(prefix)
      scanned += blobs.length
      for (const b of blobs) {
        if (referenced.has(b.url)) continue
        const ageHours = (now - b.uploadedAt.getTime()) / 3_600_000
        orphans.push({
          url: b.url,
          pathname: b.pathname,
          prefix,
          size: b.size,
          uploadedAt: b.uploadedAt.toISOString(),
          ageHours: Math.floor(ageHours),
          eligible: ageHours >= minAgeHours,
        })
      }
    }

    const eligibleUrls = orphans.filter((o) => o.eligible).map((o) => o.url)
    const capped = eligibleUrls.length > MAX_SWEEP_DELETIONS
    const toDelete = eligibleUrls.slice(0, MAX_SWEEP_DELETIONS)
    if (deleteOrphans && toDelete.length) await this.blob.delete(toDelete)

    return {
      dryRun: !deleteOrphans,
      minAgeHours,
      scanned,
      referenced: referenced.size,
      orphaned: orphans.length,
      eligible: eligibleUrls.length,
      deleted: deleteOrphans ? toDelete.length : 0,
      capped,
      orphans,
    }
  }
}
