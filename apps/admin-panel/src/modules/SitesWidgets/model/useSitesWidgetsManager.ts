import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import { agentsApi, type PortalAgentDetail } from '@/modules/Agents'
import { publicWidgetApi, type WidgetSmokeResult } from '@/modules/SitesWidgets/api/publicWidgetApi'
import {
  sitesWidgetsApi,
  type MutationResult,
  type Site,
  type SitesWidgetsStatus,
  type Widget,
} from '@/modules/SitesWidgets/api/sitesWidgetsApi'

const SITE_WIDGET_ACTION_REFS = [
  'sites_widgets.manage',
  'sites.manage',
  'widgets.manage',
  'agent.widgets.manage',
  'agents.widgets.manage',
  'site_widget_bindings.manage',
]

function canMutateSitesWidgets(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  const permissions = adminUser.permissions ?? []
  if (['sites:write', 'widgets:write', 'site-widgets:write', 'manage-sites', 'manage-widgets', 'manage-agents'].some((permission) => permissions.includes(permission))) {
    return true
  }
  return adminUser.role === 'platform_admin'
}

export function deriveSitesWidgetsCanManage(supportedMutationActions: string[], canMutate: boolean) {
  const supported = new Set(supportedMutationActions)
  return canMutate && SITE_WIDGET_ACTION_REFS.some((actionRef) => supported.has(actionRef))
}

type SiteForm = {
  hostname: string
  allowedOriginsText: string
}

type WidgetForm = {
  siteId: string
  widgetKey: string
}

type SmokeForm = {
  widgetKey: string
  messageText: string
}

export type SitesWidgetsMutationEvidence =
  | {
      kind: 'site'
      result: MutationResult
      site: Site
    }
  | {
      kind: 'widget'
      result: MutationResult
      widget: Widget
    }

export function parseAllowedOriginsText(value: string) {
  const origins: string[] = []
  const invalidLines: string[] = []

  for (const line of linesToArray(value)) {
    try {
      const url = new URL(line)
      const hasAllowedProtocol = url.protocol === 'http:' || url.protocol === 'https:'
      const hasPathQueryOrHash = (url.pathname && url.pathname !== '/') || Boolean(url.search) || Boolean(url.hash)

      if (!hasAllowedProtocol || hasPathQueryOrHash || !url.hostname) {
        invalidLines.push(line)
      } else if (!origins.includes(url.origin)) {
        origins.push(url.origin)
      }
    } catch {
      invalidLines.push(line)
    }
  }

  return { origins, invalidLines }
}

export function isValidWidgetKey(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim())
}

function linesToArray(value: string) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean)
}

function makeIdempotencyKey(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function useSitesWidgetsManager(tenantId: string, agentId: string) {
  const { adminUser } = useAuth()
  const { t } = useI18n()
  const [agentDetail, setAgentDetail] = useState<PortalAgentDetail | null>(null)
  const [status, setStatus] = useState<SitesWidgetsStatus | null>(null)
  const [sites, setSites] = useState<Site[]>([])
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [siteForm, setSiteForm] = useState<SiteForm>({ hostname: '', allowedOriginsText: '' })
  const [widgetForm, setWidgetForm] = useState<WidgetForm>({ siteId: '', widgetKey: '' })
  const [smokeForm, setSmokeForm] = useState<SmokeForm>({ widgetKey: '', messageText: 'Hello from Admin Portal smoke.' })
  const [smokeResult, setSmokeResult] = useState<WidgetSmokeResult | null>(null)
  const [smokeError, setSmokeError] = useState<string | null>(null)
  const [mutationResult, setMutationResult] = useState<MutationResult | null>(null)
  const [mutationEvidence, setMutationEvidence] = useState<SitesWidgetsMutationEvidence | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [isSmoking, setIsSmoking] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const canMutate = canMutateSitesWidgets(adminUser)
  const canManageSitesWidgets = useMemo(
    () => deriveSitesWidgetsCanManage(agentDetail?.supportedMutationActions ?? [], canMutate),
    [agentDetail?.supportedMutationActions, canMutate],
  )

  const loadSitesWidgets = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [agent, nextStatus, nextSites, nextWidgets] = await Promise.all([
        agentsApi.getPortalAgentDetail(tenantId, agentId),
        sitesWidgetsApi.getStatus(tenantId, agentId),
        sitesWidgetsApi.listSites(tenantId),
        sitesWidgetsApi.listWidgets(tenantId),
      ])
      setAgentDetail(agent)
      setStatus(nextStatus)
      setSites(nextSites)
      setWidgets(nextWidgets)
      setWidgetForm((current) => ({
        ...current,
        siteId: current.siteId || nextSites[0]?.id || '',
        widgetKey: current.widgetKey || nextWidgets.find((widget) => widget.agentId === agentId)?.widgetKey || '',
      }))
      setSmokeForm((current) => ({
        ...current,
        widgetKey: current.widgetKey || nextWidgets.find((widget) => widget.agentId === agentId)?.widgetKey || '',
      }))
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('sites_widgets.load_error')))
    } finally {
      setIsLoading(false)
    }
  }, [agentId, tenantId, t])

  useEffect(() => {
    void loadSitesWidgets()
  }, [loadSitesWidgets])

  const applyMutation = useCallback(async <T extends { result: MutationResult }>(mutation: () => Promise<T>, message: string): Promise<T | null> => {
    if (!canManageSitesWidgets) {
      setFormError(t('sites_widgets.action_not_available'))
      return null
    }
    setIsMutating(true)
    setFormError(null)
    setNotice(null)
    setMutationResult(null)
    setMutationEvidence(null)
    try {
      const response = await mutation()
      setMutationResult(response.result)
      setNotice(message)
      await loadSitesWidgets()
      return response
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('sites_widgets.action_error')))
      return null
    } finally {
      setIsMutating(false)
    }
  }, [canManageSitesWidgets, loadSitesWidgets, t])

  const createSite = useCallback(async () => {
    const hostname = siteForm.hostname.trim()
    if (!hostname) {
      setFormError(t('sites_widgets.validation.hostname_required'))
      return
    }
    const originValidation = parseAllowedOriginsText(siteForm.allowedOriginsText)
    if (originValidation.invalidLines.length > 0) {
      setFormError(t('sites_widgets.validation.allowed_origins_invalid'))
      return
    }
    const response = await applyMutation(
      () => sitesWidgetsApi.createSite(tenantId, { hostname, externalAllowedOrigins: originValidation.origins }),
      t('sites_widgets.notice.site_created_next'),
    )
    if (response) {
      setMutationEvidence({ kind: 'site', result: response.result, site: response.resource })
      setWidgetForm((current) => ({ ...current, siteId: response.resource.id || current.siteId }))
      setSiteForm({ hostname: '', allowedOriginsText: '' })
    }
  }, [applyMutation, siteForm, tenantId, t])

  const changeSiteStatus = useCallback(async (siteId: string, statusValue: string) => {
    await applyMutation(() => sitesWidgetsApi.changeSiteStatus(tenantId, siteId, statusValue), t('sites_widgets.notice.site_status'))
  }, [applyMutation, tenantId, t])

  const createWidget = useCallback(async () => {
    const siteId = widgetForm.siteId.trim()
    const widgetKey = widgetForm.widgetKey.trim()
    if (!siteId || !widgetKey) {
      setFormError(t('sites_widgets.validation.widget_required'))
      return
    }
    if (!isValidWidgetKey(widgetKey)) {
      setFormError(t('sites_widgets.validation.widget_key_format'))
      return
    }
    const response = await applyMutation(() => sitesWidgetsApi.createWidget(tenantId, { siteId, agentId, widgetKey }), t('sites_widgets.notice.widget_created_next'))
    if (response) {
      setMutationEvidence({ kind: 'widget', result: response.result, widget: response.resource })
      setWidgetForm({ siteId, widgetKey: '' })
      setSmokeForm((current) => ({ ...current, widgetKey: response.resource.widgetKey || widgetKey }))
    }
  }, [agentId, applyMutation, tenantId, t, widgetForm])

  const changeWidgetStatus = useCallback(async (widgetId: string, statusValue: string) => {
    await applyMutation(() => sitesWidgetsApi.changeWidgetStatus(tenantId, widgetId, statusValue), t('sites_widgets.notice.widget_status'))
  }, [applyMutation, tenantId, t])

  const runSmoke = useCallback(async () => {
    const widgetKey = smokeForm.widgetKey.trim()
    const content = smokeForm.messageText.trim()
    if (!widgetKey) {
      setSmokeError(t('sites_widgets.validation.widget_key_required'))
      return
    }
    setIsSmoking(true)
    setSmokeError(null)
    setSmokeResult(null)
    try {
      const session = await publicWidgetApi.createSession(widgetKey, makeIdempotencyKey('widget_session'))
      const result = session.chatId && content
        ? await publicWidgetApi.sendMessage(widgetKey, session.chatId, makeIdempotencyKey('widget_message'), content)
        : session
      setSmokeResult({
        ...session,
        ...result,
        bootstrap: result.bootstrap ?? session.bootstrap,
        session: result.session ?? session.session,
        token: session.token,
        chatId: result.chatId ?? session.chatId,
      })
    } catch (error) {
      setSmokeError(getLocalizedApiErrorMessage(error, t, t('sites_widgets.smoke_error')))
    } finally {
      setIsSmoking(false)
    }
  }, [smokeForm, t])

  return {
    tenantId,
    agentId,
    agentDetail,
    status,
    sites,
    widgets,
    siteForm,
    widgetForm,
    smokeForm,
    smokeResult,
    smokeError,
    mutationResult,
    mutationEvidence,
    canManageSitesWidgets,
    isLoading,
    isMutating,
    isSmoking,
    errorMessage,
    formError,
    notice,
    loadSitesWidgets,
    setSiteForm,
    setWidgetForm,
    setSmokeForm,
    createSite,
    changeSiteStatus,
    createWidget,
    changeWidgetStatus,
    runSmoke,
  }
}

export type SitesWidgetsManager = ReturnType<typeof useSitesWidgetsManager>
