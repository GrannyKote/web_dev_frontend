import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  clearAuth,
  getStoredToken,
  getStoredUser,
  loginUser,
  registerUser,
  storeAuth,
} from './authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState(() => getStoredUser())

  useEffect(() => {
    if (token && user) {
      storeAuth(token, user)
    }
  }, [token, user])

  const login = useCallback(async ({ username, password }) => {
    const data = await loginUser({ username, password })
    setToken(data.access_token)
    setUser(data.user)
    storeAuth(data.access_token, data.user)
    return data
  }, [])

  const register = useCallback(async ({ username, password, email }) => {
    const data = await registerUser({ username, password, email })
    setToken(data.access_token)
    setUser(data.user)
    storeAuth(data.access_token, data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    clearAuth()
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
