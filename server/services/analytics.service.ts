import type { AnalyticsRepository } from '../repositories/analytics.repository'
import type { AnalyticsQuery } from '#shared/schemas'
import type { AdminAnalyticsDto } from '#shared/types'

export class AnalyticsService {
  constructor(private readonly analytics: AnalyticsRepository) {}

  overview(query: AnalyticsQuery): Promise<AdminAnalyticsDto> {
    return this.analytics.overview(query)
  }
}
