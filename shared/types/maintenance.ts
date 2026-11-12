/** A blob in storage that no DB row references, with its grace-period status. */
export interface BlobSweepOrphan {
  url: string
  pathname: string
  prefix: string
  size: number
  uploadedAt: string
  ageHours: number
  eligible: boolean
}

/** Result of an orphaned-blob sweep (dry-run unless orphans were deleted). */
export interface BlobSweepReportDto {
  dryRun: boolean
  minAgeHours: number
  scanned: number
  referenced: number
  orphaned: number
  eligible: number
  deleted: number
  capped: boolean
  orphans: BlobSweepOrphan[]
}
