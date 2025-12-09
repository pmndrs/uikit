import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['@react-three/fiber', 'three'],
  },
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
