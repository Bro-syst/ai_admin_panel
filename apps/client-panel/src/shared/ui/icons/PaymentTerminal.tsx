export function PaymentTerminalIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M15.5 4.5a4 4 0 0 1 4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15.5 7.5a1 1 0 0 1 1 1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="3.5" y="7" width="17" height="11.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 10.75h17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.75 14.5h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M6.75 16.75h6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="17" cy="15.75" r="1.25" fill="currentColor" />
    </svg>
  )
}
