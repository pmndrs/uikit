import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@react-three/uikit', replacement: path.resolve(__dirname, '../../packages/react/src/index.ts') },
      {
        find: '@pmndrs/uikit/internals',
        replacement: path.resolve(__dirname, '../../packages/uikit/src/internals.ts'),
      },
      { find: '@pmndrs/uikit', replacement: path.resolve(__dirname, '../../packages/uikit/src/index.ts') },
    ],
    dedupe: ['@react-three/fiber', 'three'],
  },
})
