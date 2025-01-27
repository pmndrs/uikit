import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/uikit/examples/card/',
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, '../../packages/kits/default/src') },
      { find: '@react-three/uikit', replacement: path.resolve(__dirname, './node_modules/remote-react-three-uikit') },
    ],
    dedupe: ['@react-three/fiber', 'three'],
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
  },
})
