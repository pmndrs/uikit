import { defineConfig } from 'vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, '../../packages/kits/default') },
      {
        find: '@vanilla-three/uikit/internals',
        replacement: path.resolve(__dirname, '../../packages/uikit/src/internals.ts'),
      },
      { find: '@vanilla-three/uikit', replacement: path.resolve(__dirname, '../../packages/uikit/src/index.ts') },
    ],
  },
  base: '/uikit/examples/vanilla/',
  optimizeDeps: {
    include: ['@vanilla-three/uikit-lucide', '@vanilla-three/uikit'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
  },
})
