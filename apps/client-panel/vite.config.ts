import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const devApiTarget = process.env.CLIENT_PANEL_DEV_API_TARGET?.trim() || 'http://127.0.0.1:8000'
const devApiTargetOrigin = new URL(devApiTarget).origin

function normalizeSetCookieValues(setCookie: string | string[]) {
  const values = Array.isArray(setCookie) ? setCookie : [setCookie]
  return values.flatMap((value) => {
    const split = value
      .split(/,(?=[^;,\s]+=)/g)
      .map((chunk) => chunk.trim())
      .filter(Boolean)
    return split.length > 0 ? split : [value]
  })
}

function patchDevSetCookie(headers: Record<string, string | string[] | undefined>) {
  const setCookie = headers['set-cookie']
  if (!setCookie) return

  headers['set-cookie'] = normalizeSetCookieValues(setCookie).map((value) =>
    value
      .replace(/;\s*Secure/gi, '')
      .replace(/;\s*SameSite=None/gi, '; SameSite=Lax')
      .replace(/;\s*Domain=[^;]*/gi, '')
      .replace(/;\s*Partitioned/gi, ''),
  )
}

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
          proxy.on('proxyRes', (proxyRes) => {
            patchDevSetCookie(proxyRes.headers as Record<string, string | string[] | undefined>)
          })
        },
      },
      '/auth': {
        target: devApiTarget,
        changeOrigin: true,
        secure: false,
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
