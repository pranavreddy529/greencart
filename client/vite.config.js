import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://greencart-backend-three-flame.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
