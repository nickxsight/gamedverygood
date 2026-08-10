import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Claude chat proxy runs as a small Express server (server/index.js) on
// port 8787. In dev we proxy /api to it so the client can call /api/chat.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
