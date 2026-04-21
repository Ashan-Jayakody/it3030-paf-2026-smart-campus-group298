import { useEffect, useState } from 'react'
import { getCurrentUser } from '../api/authApi'
import { AuthContext } from './authContext'

const TOKEN_KEY = 'smart-campus-token'
const USER_KEY = 'smart-campus-user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    const bootstrap = async () => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        if (alive) setLoading(false)
        return
      }

      try {
        const { data } = await getCurrentUser()
        if (alive) setUser(data)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        if (alive) setUser(null)
      } finally {
        if (alive) setLoading(false)
      }
    }

    bootstrap()
    return () => {
      alive = false
    }
  }, [])

  const login = (payload) => {
    localStorage.setItem(TOKEN_KEY, payload.token)
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
    setUser(payload.user)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: Boolean(user?.roles?.includes('ADMIN')),
        isManager: Boolean(user?.roles?.includes('MANAGER')),
        isTechnician: Boolean(user?.roles?.includes('TECHNICIAN')),
        canManageResources: Boolean(user?.roles?.includes('ADMIN') || user?.roles?.includes('MANAGER')),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}