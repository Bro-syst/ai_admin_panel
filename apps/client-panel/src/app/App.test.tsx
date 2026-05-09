import { describe, expect, it } from 'vitest'
import { routes } from '@/core/router/routes'

describe('client panel routes', () => {
  it('keeps the reusable auth template routes', () => {
    expect(routes.map((route) => route.path)).toEqual([
      '/login',
      '/auth/verify-email',
      '/',
      '/account',
      '/settings',
      '*',
    ])
  })
})
