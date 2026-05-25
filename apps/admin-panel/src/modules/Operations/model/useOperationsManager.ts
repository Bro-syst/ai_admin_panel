import { useCallback, useEffect, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useI18n } from '@/core/i18n/useI18n'
import {
  operationsApi,
  type PlatformSettings,
  type PortalOperationsSummary,
} from '@/modules/Operations/api/operationsApi'

export function useOperationsManager() {
  const { t } = useI18n()
  const [operations, setOperations] = useState<PortalOperationsSummary | null>(null)
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadOperations = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [nextOperations, nextPlatformSettings] = await Promise.all([
        operationsApi.getOperations(),
        operationsApi.getPlatformSettings(),
      ])
      setOperations(nextOperations)
      setPlatformSettings(nextPlatformSettings)
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('operations.operations.load_error')))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadOperations()
  }, [loadOperations])

  return {
    operations,
    platformSettings,
    isLoading,
    errorMessage,
    loadOperations,
  }
}

export type OperationsManager = ReturnType<typeof useOperationsManager>
