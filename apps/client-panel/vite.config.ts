import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const devApiTarget = process.env.CLIENT_PANEL_DEV_API_TARGET?.trim() || 'http://127.0.0.1:8000'
const devApiTargetOrigin = new URL(devApiTarget).origin

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: devApiTarget,
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: '',
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq, req) => {
            proxyReq.setHeader('origin', devApiTargetOrigin)
            proxyReq.setHeader('referer', `${devApiTargetOrigin}${req.url ?? '/'}`)
          })
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
})
