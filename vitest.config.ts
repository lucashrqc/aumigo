import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['test/unit/**/*.spec.ts'],
          setupFiles: ['test/setup/globals.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          environment: 'node',
          include: ['test/integration/**/*.spec.ts'],
          setupFiles: ['test/setup/globals.ts'],
          globalSetup: ['test/setup/database.ts'],
          // DB-backed tests run serially to share one schema.
          fileParallelism: false,
        },
      },
    ],
  },
})
