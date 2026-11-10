import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
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
