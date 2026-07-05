import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('fintrack_theme') === 'dark'
  })

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('fintrack_theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('fintrack_theme', 'light')
    }
  }, [isDarkMode])

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(true)
    } else {
      setDesktopSidebarOpen(!desktopSidebarOpen)
    }
  }

  return (
    <div className={`layout-wrapper ${desktopSidebarOpen ? 'desktop-sidebar-open' : 'desktop-sidebar-closed'}`} style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isDesktopOpen={desktopSidebarOpen}
      />

      <div
        className="main-content"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh',
          transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Topbar 
          onMenuClick={toggleSidebar} 
          isDarkMode={isDarkMode} 
          toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        />

        <main
          id="main-content"
          role="main"
          style={{
            flex: 1,
            padding: '1.5rem',
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
