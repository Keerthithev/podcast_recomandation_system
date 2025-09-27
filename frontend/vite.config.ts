import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/podcasts': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})


