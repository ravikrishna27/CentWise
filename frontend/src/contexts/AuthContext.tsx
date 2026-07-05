import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '../api/axios'
import type {
  AuthUser,
  AuthContextValue,
  LoginCredentials,
  RegisterCredentials,
  ApiAuthResponse,
} from '../types/auth'

// ── Storage keys ──────────────────────────────────────────────────────────────
const TOKEN_KEY = 'fintrack_token'
const USER_KEY = 'fintrack_user'

// ── Context ───────────────────────────────────────────────────────────────────
export const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? (JSON.parse(stored) as AuthUser) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  )

  const [isLoading, setIsLoading] = useState<boolean>(true)

  // On mount: verify the stored token is still valid
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      if (!storedToken) {
        setIsLoading(false)
        return
      }
      try {
        const { data } = await authApi.getMe()
        setUser((data as { data: AuthUser }).data)
      } catch {
        // Token invalid or expired — clear everything
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setUser(null)
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    void verifyToken()
  }, [])

  const persistAuth = useCallback((authToken: string, authUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, authToken)
    localStorage.setItem(USER_KEY, JSON.stringify(authUser))
    setToken(authToken)
    setUser(authUser)
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const { data } = await authApi.login(credentials)
      const { token: authToken, data: authUser } = data as ApiAuthResponse
      persistAuth(authToken, authUser)
    },
    [persistAuth]
  )

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      const { data } = await authApi.register(credentials)
      const { token: authToken, data: authUser } = data as ApiAuthResponse
      persistAuth(authToken, authUser)
    },
    [persistAuth]
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
