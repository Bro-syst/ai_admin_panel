import { isValidElement } from 'react'
import { Navigate } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RequireAuth } from '@/core/router/routeGuards'
import { routes } from '@/core/router/routes'

const PUBLIC_ROUTES = [
  '/login',
  '/auth/password-setup',
  '/admin/password-setup',
  '/password-setup',
  '/admin/password-reset',
  '/password-reset/request',
  '/password-reset/confirm',
  '*',
]

const PROTECTED_BASELINE_ROUTES = [
  '/',
  '/dashboard',
  '/operations',
  '/settings',
  '/security',
  '/admins',
]

const OPERATOR_JOURNEY_ROUTES = [
  '/tenants',
  '/tenants/:tenantId',
  '/tenants/:tenantId/agents',
  '/tenants/:tenantId/agents/new',
  '/tenants/:tenantId/agents/:agentId',
  '/tenants/:tenantId/agents/:agentId/config',
  '/tenants/:tenantId/agents/:agentId/knowledge',
  '/tenants/:tenantId/agents/:agentId/capabilities',
  '/tenants/:tenantId/agents/:agentId/policy',
  '/tenants/:tenantId/agents/:agentId/sites-widgets',
  '/tenants/:tenantId/agents/:agentId/releases',
  '/tenants/:tenantId/conversations',
  '/tenants/:tenantId/usage',
  '/tenants/:tenantId/billing-export',
]

const ALL_EXPECTED_ROUTES = [...PUBLIC_ROUTES, ...PROTECTED_BASELINE_ROUTES, ...OPERATOR_JOURNEY_ROUTES]

function routeFor(path: string) {
  const route = routes.find((candidate) => candidate.path === path)
  if (!route) throw new Error(`Missing route ${path}`)
  return route
}

function expectRequireAuth(path: string) {
  const route = routeFor(path)

  expect(isValidElement(route.element)).toBe(true)
  if (!isValidElement(route.element)) return

  expect(route.element.type).toBe(RequireAuth)
}

describe('Admin Portal final route smoke', () => {
  it('keeps the shipped route surface explicit and free of future placeholders', () => {
    expect(routes.map((route) => route.path).sort()).toEqual([...ALL_EXPECTED_ROUTES].sort())
  })

  it('protects the full tenant to billing operator journey', () => {
    for (const path of OPERATOR_JOURNEY_ROUTES) {
      expectRequireAuth(path)
    }
  })

  it('protects the accepted auth, security, dashboard and operations baseline', () => {
    for (const path of PROTECTED_BASELINE_ROUTES) {
      expectRequireAuth(path)
    }
  })

  it('keeps authenticated root pointed at the implemented dashboard', () => {
    const route = routeFor('/')

    expect(isValidElement(route.element)).toBe(true)
    if (!isValidElement(route.element)) return

    const child = route.element.props.children

    expect(isValidElement(child)).toBe(true)
    if (!isValidElement(child)) return

    const childProps = child.props as { to?: string; replace?: boolean }

    expect(child.type).toBe(Navigate)
    expect(childProps.to).toBe('/dashboard')
    expect(childProps.replace).toBe(true)
  })
})
