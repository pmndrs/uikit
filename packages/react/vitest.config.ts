import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: ['test/**/*.spec.ts', 'test/**/*.spec.tsx'],
    coverage: {
      provider: 'v8',
    },
  },
})


