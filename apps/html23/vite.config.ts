import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@react-three/uikit', replacement: path.resolve(__dirname, './node_modules/remote-react-three-uikit') },
      {
        find: '@react-three/uikit-default',
        replacement: path.resolve(__dirname, './node_modules/remote-react-three-uikit-default'),
      },
      {
        find: '@react-three/uikit-lucide',
        replacement: path.resolve(__dirname, './node_modules/remote-react-three-uikit-lucide'),
      },
      { find: '@pmndrs/uikit/internals', replacement: path.resolve(__dirname, './node_modules/remote-pmndrs-uikit/dist/internals.js') },
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
