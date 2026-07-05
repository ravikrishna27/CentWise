import { useLocation } from 'react-router-dom'
import { Menu, Bell, Moon, Sun } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface TopbarProps {
  onMenuClick: () => void
  isDarkMode: boolean
  toggleTheme: () => void
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Your financial overview at a glance',
  },
  '/transactions': {
    title: 'Transactions',
    subtitle: 'View and manage all your transactions',
  },
  '/categories': {
    title: 'Categories',
    subtitle: 'Organise your income and expenses',
  },
}

export function Topbar({ onMenuClick, isDarkMode, toggleTheme }: TopbarProps) {
  const location = useLocation()
  const { user } = useAuth()
  const page = PAGE_TITLES[location.pathname] ?? { title: 'CentWise', subtitle: '' }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <header
      id="topbar"
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        height: '64px',
        background: isDarkMode ? 'rgba(9, 9, 11, 0.85)' : 'rgba(248,250,252,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        zIndex: 30,
        gap: '1rem',
      }}
    >
      {/* Left: hamburger + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
        {/* Hamburger — visible on mobile and desktop now */}
        <button
          id="btn-open-sidebar"
          aria-label="Toggle navigation menu"
          aria-controls="sidebar"
          className="btn btn-ghost"
          style={{ padding: '0.375rem', flexShrink: 0 }}
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>

        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: '1.0625rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            {page.title}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {location.pathname === '/dashboard'
              ? `${greeting()}, ${user?.name?.split(' ')[0] ?? 'there'} 👋`
              : page.subtitle}
          </p>
        </div>
      </div>

      {/* Right: theme toggle, notification bell + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <button
          id="btn-theme-toggle"
          aria-label="Toggle dark mode"
          className="btn btn-ghost"
          style={{ padding: '0.375rem' }}
          onClick={toggleTheme}
        >
          {isDarkMode ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
        </button>

        <button
          id="btn-notifications"
          aria-label="Notifications"
          className="btn btn-ghost"
          style={{ padding: '0.375rem', position: 'relative' }}
        >
          <Bell size={18} strokeWidth={2} />
          {/* Notification dot */}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              border: '1.5px solid var(--color-bg)',
            }}
          />
        </button>

        <div
          aria-label={`Logged in as ${user?.name ?? ''}`}
          title={user?.email}
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.8125rem',
            cursor: 'default',
            userSelect: 'none',
            flexShrink: 0,
          }}
        >
          {user?.name?.charAt(0).toUpperCase() ?? '?'}
        </div>
      </div>
    </header>
  )
}
