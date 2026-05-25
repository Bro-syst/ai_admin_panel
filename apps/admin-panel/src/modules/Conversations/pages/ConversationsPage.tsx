import { Navigate, useParams } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import { useConversationsManager } from '@/modules/Conversations/model/useConversationsManager'
import { ConversationsView } from '@/modules/Conversations/ui/ConversationsView'
import { AppShell } from '@/shared/ui/AppShell'

export function ConversationsPage() {
  const { tenantId } = useParams()

  if (!tenantId) {
    return <Navigate to="/tenants" replace />
  }

  return <ConversationsPageContent tenantId={tenantId} />
}

function ConversationsPageContent({ tenantId }: { tenantId: string }) {
  const { t } = useI18n()
  const manager = useConversationsManager(tenantId)

  return (
    <AppShell title={t('conversations.title')}>
      <ConversationsView manager={manager} />
    </AppShell>
  )
}
