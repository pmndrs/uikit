import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    dedupe: ['three'],
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
  },
})
