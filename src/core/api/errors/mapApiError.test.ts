import { describe, expect, it } from 'vitest'
import { mapApiError } from '@/core/api/errors/mapApiError'

describe('mapApiError', () => {
  it('maps 401 to unauthorized', () => {
    const error = {
      isAxiosError: true,
      message: 'Request failed',
      response: {
        status: 401,
        data: { status: { description: 'Unauthorized' } },
        headers: {
          'x-request-id': 'req_401',
        },
      },
    }

    expect(mapApiError(error)).toMatchObject({
      kind: 'unauthorized',
      status: 401,
      message: 'Unauthorized',
      requestId: 'req_401',
    })
  })

  it('maps backend code and locked status', () => {
    const error = {
      isAxiosError: true,
      message: 'Request failed',
      response: {
        status: 423,
        data: {
          code: 'locked',
          detail: 'Current AML officer is locked',
        },
        headers: {
          'x-request-id': 'req_locked',
        },
      },
    }

    expect(mapApiError(error)).toMatchObject({
      kind: 'locked',
      status: 423,
      code: 'locked',
      message: 'Current AML officer is locked',
      requestId: 'req_locked',
    })
  })

  it('maps forbidden, not found, and conflict responses to dedicated kinds', () => {
    const forbidden = mapApiError({
      isAxiosError: true,
      message: 'Request failed',
      response: {
        status: 403,
        data: { detail: 'Forbidden for current AML officer scope' },
        headers: { 'x-request-id': 'req_403' },
      },
    })

    const notFound = mapApiError({
      isAxiosError: true,
      message: 'Request failed',
      response: {
        status: 404,
        data: { detail: 'Requested resource was not found in current scope' },
        headers: { 'x-request-id': 'req_404' },
      },
    })

    const conflict = mapApiError({
      isAxiosError: true,
      message: 'Request failed',
      response: {
        status: 409,
        data: { detail: 'Resource state does not allow this operation' },
        headers: { 'x-request-id': 'req_409' },
      },
    })

    expect(forbidden).toMatchObject({
      kind: 'forbidden',
      status: 403,
      message: 'Forbidden for current AML officer scope',
      requestId: 'req_403',
    })
    expect(notFound).toMatchObject({
      kind: 'not_found',
      status: 404,
      message: 'Requested resource was not found in current scope',
      requestId: 'req_404',
    })
    expect(conflict).toMatchObject({
      kind: 'conflict',
      status: 409,
      message: 'Resource state does not allow this operation',
      requestId: 'req_409',
    })
  })

  it('maps timeout network error', () => {
    const error = {
      isAxiosError: true,
      code: 'ECONNABORTED',
      message: 'timeout',
    }

    expect(mapApiError(error)).toMatchObject({
      kind: 'timeout',
      message: 'timeout',
    })
  })

  it('maps non-axios error to unknown', () => {
    expect(mapApiError(new Error('boom'))).toMatchObject({
      kind: 'unknown',
      message: 'Unknown error',
    })
  })
})
