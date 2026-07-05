import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import type { ReactNode } from 'react'

interface PublicRouteProps {
  children: ReactNode
}

/**
 * Wraps public routes (login/register). If a user is already authenticated,
 * it redirects them to the dashboard.
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner fullPage size="lg" label="Loading…" />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
