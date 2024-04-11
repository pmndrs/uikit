import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  optimizeDeps: {
    include: ['@react-three/uikit-lucide', '@react-three/uikit'],
  },
  base: '/uikit/examples/apfel/',
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, '../../packages/kits/apfel') },
      { find: '@react-three/uikit', replacement: path.resolve(__dirname, '../../packages/react/src/index.ts') },
    ],
  },
})
