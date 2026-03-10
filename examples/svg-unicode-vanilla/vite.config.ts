import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    dedupe: ['three'],
  },
  base: '/uikit/examples/svg-unicode-vanilla/',
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
  },
})
