import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Use GitHub Pages base path only when VITE_GITHUB_PAGES=true, otherwise use root for Cloudflare
  base: process.env.VITE_GITHUB_PAGES === 'true' ? '/ttnn-performance-dashboard/' : '/',
  server: {
    port: 3000,
    host: true
  },
  publicDir: 'public',
  assetsInclude: ['**/*.json'],
  define: {
    'process.env': {}
  }
})) 