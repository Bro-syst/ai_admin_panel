import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

const appRoot = fileURLToPath(new URL('.', import.meta.url))
const defaultDevApiTarget = 'http://127.0.0.1:8008'
const defaultCoverageInclude = [
  'src/modules/AgentConfig/api/agentConfigApi.ts',
  'src/modules/AgentConfig/model/agentConfigOptions.ts',
  'src/modules/AgentConfig/model/useAgentConfigManager.ts',
  'src/modules/AgentConfig/ui/AgentConfigView.tsx',
  'src/modules/Agents/ui/AgentDetailView.tsx',
  'src/shared/ui/EntityInfo.tsx',
]
const coverageIncludeByScope: Record<string, string[]> = {
  'tz-svc-8-2': ['src/modules/FormMetadata/api/formMetadataBridgeApi.ts'],
  'tz-svc-8-3': [
    'src/modules/AgentConfig/model/useAgentConfigManager.ts',
    'src/modules/AgentConfig/ui/AgentConfigView.tsx',
    'src/modules/FormMetadata/api/formMetadataBridgeApi.ts',
  ],
  'tz-svc-8-4': [
    'src/modules/Releases/api/releasesApi.ts',
    'src/modules/Releases/model/useReleasesManager.ts',
    'src/modules/Releases/ui/ReleasesView.tsx',
  ],
}

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, appRoot, '')
  const devApiTarget = env.AI_ADMIN_DEV_API_TARGET?.trim() || defaultDevApiTarget
  const devApiTargetOrigin = new URL(devApiTarget).origin
  const coverageInclude =
    coverageIncludeByScope[process.env.AI_ADMIN_COVERAGE_SCOPE ?? ''] ?? defaultCoverageInclude

  return {
    plugins: [react()],
    server: {
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
      coverage: {
        provider: 'v8',
        reporter: ['text'],
        include: coverageInclude,
        thresholds: {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
      },
    },
  }
})
