import { useAuth } from '@/core/auth/useAuth'
import { isLocale, localeOptions } from '@/core/i18n/locales'
import { useI18n } from '@/core/i18n/useI18n'
import { useTheme } from '@/core/theme/useTheme'
import { CurrentAdminUserPanel } from '@/modules/Settings/ui/CurrentAdminUserPanel'
import { AppShell } from '@/shared/ui/AppShell'
import { GlobeIcon } from '@/shared/ui/icons/Globe'
import { MoonIcon, SunIcon } from '@/shared/ui/icons/SunMoon'

export function SettingsPage() {
  const { adminUser, authState } = useAuth()
  const { locale, setLocale, t } = useI18n()
  const { mode, setMode } = useTheme()

  return (
    <AppShell title={t('nav.settings')}>
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <CurrentAdminUserPanel adminUser={adminUser} authState={authState} />

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--primary)]">
                {mode === 'dark' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
              </span>
              <h3 className="text-sm font-semibold text-[var(--text)]">{t('common.theme')}</h3>
            </div>

            <div className="mt-3 flex items-center justify-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <span
                className={[
                  'text-sm font-semibold',
                  mode === 'light' ? 'text-[var(--text)]' : 'text-[var(--text-muted)]',
                ].join(' ')}
              >
                {t('common.theme_light')}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={mode === 'dark'}
                aria-label={t('common.theme')}
                onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                className={[
                  'relative inline-flex h-7 w-12 items-center rounded-full transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                  mode === 'dark' ? 'bg-[var(--primary)]' : 'bg-[var(--surface-muted)]',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                    mode === 'dark' ? 'translate-x-6' : 'translate-x-1',
                  ].join(' ')}
                />
              </button>
              <span
                className={[
                  'text-sm font-semibold',
                  mode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--text-muted)]',
                ].join(' ')}
              >
                {t('common.theme_dark')}
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--primary)]">
                <GlobeIcon className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-semibold text-[var(--text)]">{t('common.language')}</h3>
            </div>

            <label className="mt-3 grid gap-1">
              <select
                value={locale}
                onChange={(event) => {
                  if (isLocale(event.target.value)) setLocale(event.target.value)
                }}
                className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                {localeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
