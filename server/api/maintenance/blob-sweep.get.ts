import { z } from 'zod'

const querySchema = z.object({
  delete: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  minAgeHours: z.coerce
    .number()
    .int()
    .min(0)
    .max(24 * 365)
    .optional(),
})

export default defineEventHandler(async (event) => {
  await requireCronOrAdmin(event)
  const { delete: del, minAgeHours } = useValidatedQuery(event, querySchema)
  const report = await useMaintenanceService().sweepBlobs({
    minAgeHours: minAgeHours ?? 24,
    deleteOrphans: del ?? false,
  })
  console.log(
    `[blob-sweep] scanned=${report.scanned} orphaned=${report.orphaned} ` +
      `eligible=${report.eligible} deleted=${report.deleted} dryRun=${report.dryRun}`,
  )
  return report
})
