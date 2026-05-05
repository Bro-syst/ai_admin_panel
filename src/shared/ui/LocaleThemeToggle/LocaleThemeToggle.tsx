import { useI18n } from '@/core/i18n/useI18n'
import { isLocale, localeOptions } from '@/core/i18n/locales'
import { useTheme } from '@/core/theme/useTheme'
import { IconButton } from '@/shared/ui/IconButton'
import { MoonIcon, SunIcon } from '@/shared/ui/icons/SunMoon'

function ChevronDown({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M6 8l4 4 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LocaleThemeToggle({ variant: _variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const { locale, setLocale, t } = useI18n()
  const { mode, toggle } = useTheme()
  const isCompact = _variant === 'compact'

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="relative">
        <select
          value={locale}
          onChange={(e) => {
            if (isLocale(e.target.value)) setLocale(e.target.value)
          }}
          aria-label={t('common.language')}
          title={t('common.language')}
          className={[
            'appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface)]',
            'px-3 pr-9 text-sm font-semibold text-[var(--text)]',
            isCompact ? 'h-9' : 'h-8',
            'hover:bg-[var(--surface-muted)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
          ].join(' ')}
        >
          {localeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.shortLabel}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
      </div>

      <IconButton
        variant="ghost"
        aria-label={t('common.theme')}
        title={t('common.theme')}
        onClick={toggle}
        className={isCompact ? 'h-9 w-9' : 'h-8 w-8'}
      >
        {mode === 'dark' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
      </IconButton>
    </div>
  )
}
