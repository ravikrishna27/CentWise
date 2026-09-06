interface LogoProps {
  size?: number | string
  className?: string
  /** If true, renders with the brand gradient instead of a flat color */
  gradient?: boolean
  color?: string
}

export function Logo({ size = 24, className = '', gradient = false, color = 'currentColor' }: LogoProps) {
  const gradientId = 'centwise-logo-grad'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {gradient && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      )}

      {/* Coin body — filled circle for a solid, premium feel */}
      <circle
        cx="14"
        cy="16"
        r="11"
        stroke={gradient ? `url(#${gradientId})` : color}
        strokeWidth="2.25"
      />

      {/* Dollar-sign style vertical bar through the coin */}
      <line
        x1="14"
        y1="8"
        x2="14"
        y2="24"
        stroke={gradient ? `url(#${gradientId})` : color}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Top serif of the $ */}
      <path
        d="M17.5 10.5 C17.5 10.5 16 9 14 9 C11.5 9 10 10.5 10 12 C10 15 17.5 14 17.5 17 C17.5 18.8 16 20.5 14 20.5 C12 20.5 10.5 19 10.5 19"
        stroke={gradient ? `url(#${gradientId})` : color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Rising arrow — breakout growth from the coin */}
      <path
        d="M23 9 L28 4"
        stroke={gradient ? `url(#${gradientId})` : color}
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path
        d="M24 4 L28 4 L28 8"
        stroke={gradient ? `url(#${gradientId})` : color}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
