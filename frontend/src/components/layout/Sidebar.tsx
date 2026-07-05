import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  LogOut,
  X,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Logo } from '../ui/Logo'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isDesktopOpen: boolean
}

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/categories', icon: Tag, label: 'Categories' },
]

export function Sidebar({ isOpen, onClose, isDesktopOpen }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 40,
            backdropFilter: 'blur(2px)',
          }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        id="sidebar"
        aria-label="Main navigation"
        className={`sidebar-panel ${isOpen ? 'mobile-open' : ''} ${isDesktopOpen ? 'desktop-open' : 'desktop-closed'}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '240px',
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Logo / Brand */}
        <div
          style={{
            padding: '1.25rem 1.25rem 1rem',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '2rem',
                height: '2rem',
                background: 'var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Logo size={18} color="white" />
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              CentWise
            </span>
          </div>

          {/* Close button — mobile only */}
          <button
            aria-label="Close sidebar"
            onClick={onClose}
            className="btn btn-ghost sidebar-close-btn"
            style={{ padding: '0.25rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav
          role="navigation"
          style={{ flex: 1, padding: '0.75rem 0.75rem', overflowY: 'auto' }}
        >
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-text-muted)',
              padding: '0 0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            Menu
          </p>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  id={`nav-${label.toLowerCase()}`}
                  to={to}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5625rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive
                      ? 'var(--color-primary)'
                      : 'var(--color-text-secondary)',
                    background: isActive
                      ? 'var(--color-primary-light)'
                      : 'transparent',
                    transition: 'all 0.15s ease',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={17}
                        strokeWidth={isActive ? 2.5 : 2}
                        style={{ flexShrink: 0 }}
                      />
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User + Logout */}
        <div
          style={{
            padding: '0.875rem 1rem',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          {/* User avatar + name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              marginBottom: '0.75rem',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8125rem',
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.6875rem',
                  color: 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.email}
              </p>
            </div>
          </div>

          <button
            id="btn-logout"
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              gap: '0.625rem',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <LogOut size={16} strokeWidth={2} />
            Log out
          </button>
        </div>
      </aside>

      {/* Sidebar spacer on desktop — pushes main content right */}
      <div className="sidebar-spacer" aria-hidden="true" />
    </>
  )
}
