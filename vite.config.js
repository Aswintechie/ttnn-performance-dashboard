import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ttnn-performance-dashboard/',
  server: {
    port: 3000,
    host: true
  },
  publicDir: 'public',
  assetsInclude: ['**/*.json'],
  define: {
    'process.env': {}
  }
}) 