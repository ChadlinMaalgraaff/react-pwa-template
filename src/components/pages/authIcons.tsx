/**
 * Inline SVG icons for the auth pages (Login / Register), shared so the markup
 * stays DRY. Field icons are decorative (aria-hidden via the wrapping span).
 */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const MailIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" {...stroke}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
)

export const LockIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" {...stroke}>
    <rect x="4" y="10.5" width="16" height="10" rx="3" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </svg>
)

export const UserIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" {...stroke}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" />
  </svg>
)

export const EyeIcon = ({ off = false }: { off?: boolean }) =>
  off ? (
    <svg width="19" height="19" viewBox="0 0 24 24" {...stroke}>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 0 0 4 4" />
      <path d="M9.4 5.3A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.2 4.1M6.3 6.3A18 18 0 0 0 2 12s3.5 7 10 7a9.5 9.5 0 0 0 3.3-.6" />
    </svg>
  ) : (
    <svg width="19" height="19" viewBox="0 0 24 24" {...stroke}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

export const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.22-4.74 3.22-8.32Z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
    />
  </svg>
)
