import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Тот же catalog_service, документация: http://127.0.0.1:8000/docs
      '/catalog': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/order': { target: 'http://127.0.0.1:8001', changeOrigin: true },
    },
  },
})
