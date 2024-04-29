import { defineConfig } from 'vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, '../../packages/kits/default') },
      {
        find: '@pmndrs/uikit/internals',
        replacement: path.resolve(__dirname, '../../packages/uikit/src/internals.ts'),
      },
      { find: '@pmndrs/uikit', replacement: path.resolve(__dirname, '../../packages/uikit/src/index.ts') },
    ],
    dedupe: ['@react-three/fiber'],
  },
  base: '/uikit/examples/vanilla/',
  optimizeDeps: {
    include: ['@pmndrs/uikit-lucide', '@pmndrs/uikit'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
  },
})
