import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@react-three/uikit-lucide', '@react-three/uikit'],
  },
  base: '/uikit/examples/card/',
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, '../../packages/kits/default/src') }],
    dedupe: ['@react-three/fiber', 'three'],
  },
})
