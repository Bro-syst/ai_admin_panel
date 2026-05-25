import type { ReactNode } from 'react'
import { useI18n } from '@/core/i18n/useI18n'
import { LocaleThemeToggle } from '@/core/layout/LocaleThemeToggle'
import { AiCoreLogoIcon } from '@/shared/ui/icons/AiCoreLogo'

export function PublicShell({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <div className="mx-auto max-w-md px-4 py-12">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600">
              <AiCoreLogoIcon className="h-5 w-5" />
            </div>
            <div className="text-base font-extrabold tracking-tight text-[var(--text)] sm:text-lg">{t('brand.name')}</div>
          </div>
          <LocaleThemeToggle variant="compact" />
        </header>

        <main className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h1 className="text-lg font-bold tracking-tight text-[var(--text)]">{title}</h1>
          <div className="mt-3">{children}</div>
        </main>
      </div>
    </div>
  )
}
