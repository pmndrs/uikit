import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    dedupe: ['three'],
  },
  base: '/uikit/examples/ttf-vanilla/',
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
    exclude: ['@zappar/msdf-generator'],
  },
  build: {
    target: 'esnext',
  },
  assetsInclude: ['**/*.wasm'],
})
