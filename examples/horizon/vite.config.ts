import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@react-three/uikit-lucide', '@pmndrs/uikit', '@pmndrs/uikit-lucide'],
  },
  base: '/uikit/examples/horizon/',
  resolve: {
    dedupe: ['@react-three/fiber', 'three', '@react-three/uikit', '@pmndrs/uikit'],
  },
})
