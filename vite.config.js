import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Все запросы фронта идут на API Gateway (порт 8080),
// который проксирует их в /auth, /catalog, /order, /admin сервисы.
// API Gateway docs: http://127.0.0.1:8080/docs
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/catalog': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/order': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/admin': { target: 'http://127.0.0.1:8080', changeOrigin: true },
    },
  },
})
