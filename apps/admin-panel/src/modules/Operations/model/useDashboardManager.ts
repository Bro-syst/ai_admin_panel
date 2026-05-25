import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useI18n } from '@/core/i18n/useI18n'
import {
  operationsApi,
  type PlatformSettings,
  type PortalDashboard,
  type PortalOperationsSummary,
} from '@/modules/Operations/api/operationsApi'

export function useDashboardManager() {
  const { t } = useI18n()
  const [dashboard, setDashboard] = useState<PortalDashboard | null>(null)
  const [operations, setOperations] = useState<PortalOperationsSummary | null>(null)
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [nextDashboard, nextOperations] = await Promise.all([
        operationsApi.getDashboard(),
        operationsApi.getOperations(),
      ])
      setDashboard(nextDashboard)
      setOperations(nextOperations)
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('operations.dashboard.load_error')))
      setIsLoading(false)
      return
    }

    try {
      setPlatformSettings(await operationsApi.getPlatformSettings())
    } catch {
      setPlatformSettings(null)
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  const isLowData = useMemo(() => {
    if (!dashboard) return false
    return dashboard.tenantSummary.totalTenants === 0 && dashboard.agentSummary.totalAgents === 0 && dashboard.runtimeSummary.totalChats === 0
  }, [dashboard])

  return {
    dashboard,
    operations,
    platformSettings,
    isLoading,
    isLowData,
    errorMessage,
    loadDashboard,
  }
}

export type DashboardManager = ReturnType<typeof useDashboardManager>
