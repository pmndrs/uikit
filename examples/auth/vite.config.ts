import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@react-three/uikit-lucide', '@react-three/uikit'],
  },
  base: '/uikit/examples/auth/',
  resolve: {
    dedupe: ['@react-three/fiber', 'three'],
  },
})
