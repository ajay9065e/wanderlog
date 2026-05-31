/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

const AUTH_STORAGE_KEY = 'wanderlog_auth_user'
const LIST_STORAGE_KEY = 'wanderlog_user_lists'
const ACCOUNTS_STORAGE_KEY = 'wanderlog_local_accounts'
const REQRES_BASE_URL = import.meta.env.VITE_REQRES_BASE_URL || 'https://reqres.in/api'
const REQRES_API_KEY = import.meta.env.VITE_REQRES_API_KEY
const DEMO_EMAIL = 'eve.holt@reqres.in'
const GOOGLE_DEMO_EMAIL = 'traveler.google@wanderlog.local'

const buildMockAuthPayload = (mode) => {
  if (mode === 'register') {
    return {
      id: Date.now(),
      token: `mock-register-${Date.now()}`,
    }
  }

  return {
    token: `mock-login-${Date.now()}`,
  }
}

const isApiKeyFailure = (payload = {}) => {
  const error = String(payload.error || '').toLowerCase()
  const message = String(payload.message || '').toLowerCase()
  return (
    error.includes('api_key') ||
    message.includes('api key') ||
    message.includes('api-key') ||
    message.includes('revoked')
  )
}

const AuthContext = createContext(null)

const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const saveStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStorage(AUTH_STORAGE_KEY, null))
  const [listsByUser, setListsByUser] = useState(() => readStorage(LIST_STORAGE_KEY, {}))
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const persistUser = (nextUser) => {
    setUser(nextUser)
    if (nextUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
      return
    }
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  const persistLists = (nextLists) => {
    setListsByUser(nextLists)
    localStorage.setItem(LIST_STORAGE_KEY, JSON.stringify(nextLists))
  }

  const authenticate = async (mode, email, password) => {
    setAuthLoading(true)
    setAuthError('')

    try {
      const normalizedEmail = email.trim().toLowerCase()
      const localAccounts = readStorage(ACCOUNTS_STORAGE_KEY, {})

      if (mode === 'register') {
        if (localAccounts[normalizedEmail]) {
          throw new Error('An account with this email already exists. Please login instead.')
        }

        const nextAccounts = {
          ...localAccounts,
          [normalizedEmail]: {
            email: email.trim(),
            password,
            createdAt: Date.now(),
          },
        }
        saveStorage(ACCOUNTS_STORAGE_KEY, nextAccounts)

        const nextUser = {
          email: email.trim(),
          token: `local-register-${Date.now()}`,
          id: Date.now(),
        }
        persistUser(nextUser)
        return { ok: true }
      }

      const localAccount = localAccounts[normalizedEmail]
      if (localAccount) {
        if (localAccount.password !== password) {
          throw new Error('Incorrect password. Please try again.')
        }

        const nextUser = {
          email: localAccount.email,
          token: `local-login-${Date.now()}`,
          id: localAccount.createdAt,
        }
        persistUser(nextUser)
        return { ok: true }
      }

      const apiKey = REQRES_API_KEY?.trim()
      const normalizedApiKey = apiKey === 'your_real_reqres_key' ? '' : apiKey
      const useMockFallback = normalizedEmail === DEMO_EMAIL && Boolean(password)

      const headers = {
        'Content-Type': 'application/json',
      }

      if (normalizedApiKey) {
        headers['x-api-key'] = normalizedApiKey
      }

      const response = await fetch(`${REQRES_BASE_URL}/${mode}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password }),
      })

      const payload = await response.json()

      if (!response.ok) {
        if (isApiKeyFailure(payload) && useMockFallback) {
          const fallbackPayload = buildMockAuthPayload(mode)
          const nextUser = {
            email,
            token: fallbackPayload.token,
            id: fallbackPayload.id ?? null,
          }
          persistUser(nextUser)
          return { ok: true }
        }

        throw new Error(payload.message || payload.error || 'Authentication failed. Try again.')
      }

      const nextUser = {
        email,
        token: payload.token,
        id: payload.id ?? null,
      }
      persistUser(nextUser)
      return { ok: true }
    } catch (error) {
      const normalizedEmail = email.trim().toLowerCase()
      if (normalizedEmail === DEMO_EMAIL && Boolean(password)) {
        const fallbackPayload = buildMockAuthPayload(mode)
        const nextUser = {
          email,
          token: fallbackPayload.token,
          id: fallbackPayload.id ?? null,
        }
        persistUser(nextUser)
        return { ok: true }
      }

      setAuthError(error.message)
      return { ok: false, message: error.message }
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = () => {
    persistUser(null)
    setAuthError('')
  }

  const loginWithGoogle = async () => {
    setAuthLoading(true)
    setAuthError('')

    try {
      const nextUser = {
        email: GOOGLE_DEMO_EMAIL,
        token: `google-login-${Date.now()}`,
        id: Date.now(),
        provider: 'google',
      }
      persistUser(nextUser)
      return { ok: true }
    } catch (error) {
      setAuthError(error.message || 'Google sign-in failed. Please try again.')
      return { ok: false, message: error.message }
    } finally {
      setAuthLoading(false)
    }
  }

  const currentEmail = user?.email ?? ''
  const currentLists = listsByUser[currentEmail] ?? { bucket: [], visited: [] }

  const updateCurrentLists = (updater) => {
    if (!currentEmail) return
    const updated = updater(currentLists)
    persistLists({
      ...listsByUser,
      [currentEmail]: {
        bucket: [...new Set(updated.bucket)],
        visited: [...new Set(updated.visited)],
      },
    })
  }

  const toggleBucket = (code) => {
    updateCurrentLists((lists) => {
      const inBucket = lists.bucket.includes(code)
      if (inBucket) {
        return { ...lists, bucket: lists.bucket.filter((item) => item !== code) }
      }
      return {
        bucket: [...lists.bucket, code],
        visited: lists.visited.filter((item) => item !== code),
      }
    })
  }

  const toggleVisited = (code) => {
    updateCurrentLists((lists) => {
      const inVisited = lists.visited.includes(code)
      if (inVisited) {
        return { ...lists, visited: lists.visited.filter((item) => item !== code) }
      }
      return {
        visited: [...lists.visited, code],
        bucket: lists.bucket.filter((item) => item !== code),
      }
    })
  }

  const value = {
    user,
    isAuthenticated: Boolean(user?.token),
    authLoading,
    authError,
    login: (email, password) => authenticate('login', email, password),
    signup: (email, password) => authenticate('register', email, password),
    loginWithGoogle,
    logout,
    bucket: currentLists.bucket,
    visited: currentLists.visited,
    toggleBucket,
    toggleVisited,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
