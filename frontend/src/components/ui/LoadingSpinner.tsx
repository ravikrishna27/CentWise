interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  fullPage?: boolean
}

const sizeMap = {
  sm: '1rem',
  md: '1.75rem',
  lg: '2.5rem',
}

export function LoadingSpinner({
  size = 'md',
  label = 'Loading…',
  fullPage = false,
}: LoadingSpinnerProps) {
  const spinnerSize = sizeMap[size]

  const spinner = (
    <div
      role="status"
      aria-label={label}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
      }}
    >
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: '2.5px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      {label && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
            margin: 0,
          }}
        >
          {label}
        </p>
      )}
    </div>
  )

  if (fullPage) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
          zIndex: 9999,
        }}
      >
        {spinner}
      </div>
    )
  }

  return spinner
}
