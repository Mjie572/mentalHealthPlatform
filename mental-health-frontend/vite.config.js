import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
      port: 63335,
      host: '0.0.0.0',
      open: true,
      proxy: {
      '/v1': {
        target: process.env.VITE_DIFY_PROXY_TARGET || 'http://localhost',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})

