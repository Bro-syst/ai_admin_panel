import { useI18n } from '@/core/i18n/useI18n'
import { RolePageShell } from '@/core/layout'
import { useAccountPage } from '@/modules/Account/model/useAccountPage'
import { AccountPageContent } from '@/modules/Account/ui/AccountPageContent'

export function AccountPage() {
  const { t } = useI18n()
  const controller = useAccountPage()

  return (
    <RolePageShell title={t('nav.account')}>
      <AccountPageContent controller={controller} />
    </RolePageShell>
  )
}
