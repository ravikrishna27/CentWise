interface LogoProps {
  size?: number | string
  className?: string
  color?: string
}

export function Logo({ size = 24, className = '', color = 'currentColor' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke={color}
      className={className}
    >
      {/* The 'C' curve */}
      <path
        d="M11 20C6.58172 20 3 16.4183 3 12C3 7.58172 6.58172 4 11 4"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* The vertical strike (forming the cent ¢ symbol) */}
      <path
        d="M11 2V22"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* The upward growth arrow (representing wisdom/wealth) */}
      <path
        d="M13 11L22 2"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M16 2H22V8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
