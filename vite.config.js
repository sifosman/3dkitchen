import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three', '@react-three/fiber', '@react-three/drei'],
          'react-vendor': ['react', 'react-dom'],
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
