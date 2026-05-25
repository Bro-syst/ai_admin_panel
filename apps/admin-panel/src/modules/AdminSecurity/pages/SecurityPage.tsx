import { useI18n } from '@/core/i18n/useI18n'
import { AdminTotpPanel } from '@/modules/AdminSecurity/ui/AdminTotpPanel'
import { AdminSessionsPanel } from '@/modules/Settings'
import { AppShell } from '@/shared/ui/AppShell'

export function SecurityPage() {
  const { t } = useI18n()

  return (
    <AppShell title={t('nav.security')}>
      <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
        <AdminTotpPanel />
        <AdminSessionsPanel />
      </div>
    </AppShell>
  )
}
