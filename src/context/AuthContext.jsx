/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(() => !!localStorage.getItem('token'))

  const refreshUserProfile = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setUserProfile(null)
      setLoading(false)
      return null
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const profile = await res.json()
        setUser({ uid: profile.id, email: profile.email, displayName: profile.name })
        setUserProfile(profile)
        return profile
      } else {
        localStorage.removeItem('token')
        setUser(null)
        setUserProfile(null)
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err)
    } finally {
      setLoading(false)
    }
    return null
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      refreshUserProfile()
    }
  }, [])

  const signup = async (email, password, name, accountType = 'customer', extra = {}) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role: accountType, ...extra })
    })
    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.message || 'რეგისტრაცია ვერ მოხერხდა.')
    }
    const data = await res.json()
    localStorage.setItem('token', data.token)
    setUser({ uid: data.user.id, email: data.user.email, displayName: data.user.name })
    setUserProfile(data.user)

    return {
      user: { uid: data.user.id, email: data.user.email },
      pendingDeveloper: accountType === 'developer'
    }
  }

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.message || 'ავტორიზაცია ვერ მოხერხდა.')
    }
    const data = await res.json()
    localStorage.setItem('token', data.token)
    setUser({ uid: data.user.id, email: data.user.email, displayName: data.user.name })
    setUserProfile(data.user)
    return { uid: data.user.id, email: data.user.email }
  }

  const loginWithGoogle = async () => {
    const mockEmail = 'google_user@gmail.com'
    const mockName = 'Google User'
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: mockEmail, name: mockName })
    })
    if (!res.ok) {
      throw new Error('Google sign-in failed.')
    }
    const data = await res.json()
    localStorage.setItem('token', data.token)
    setUser({ uid: data.user.id, email: data.user.email, displayName: data.user.name })
    setUserProfile(data.user)
    return { uid: data.user.id, email: data.user.email }
  }

  const logout = async () => {
    localStorage.removeItem('token')
    setUser(null)
    setUserProfile(null)
  }

  const value = useMemo(
    () => ({
      user,
      userProfile,
      loading,
      isFirebaseConfigured: true,
      signup,
      login,
      loginWithGoogle,
      logout,
      refreshUserProfile,
    }),
    [user, userProfile, loading],
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
