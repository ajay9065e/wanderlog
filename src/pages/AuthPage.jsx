import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DEMO_EMAIL = 'eve.holt@reqres.in'

function AuthPage() {
  const { isAuthenticated, authLoading, authError, login, signup, loginWithGoogle } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState('citylights')
  const [localMessage, setLocalMessage] = useState('')
  const location = useLocation()

  const redirectPath = location.state?.from || '/explore'

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setLocalMessage('')

    if (!email || !password) {
      setLocalMessage('Email and password are required.')
      return
    }

    const action = mode === 'login' ? login : signup
    const result = await action(email.trim(), password.trim())

    if (!result.ok && result.message) {
      setLocalMessage(result.message)
    }
  }

  const onGoogleContinue = async () => {
    setLocalMessage('')
    const result = await loginWithGoogle()
    if (!result.ok && result.message) {
      setLocalMessage(result.message)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <div className="auth-logo">
          <div className="logo-mark" aria-hidden="true">🌍</div>
          <h1 className="logo-wordmark">WanderLog</h1>
          <p className="logo-tagline">Your journey. Your bucket list.</p>
        </div>

        <h2 className="auth-title">Welcome back!</h2>
        <p className="auth-subtext">Sign in to continue your adventures.</p>

        <div className="mode-tabs" role="tablist" aria-label="Auth mode">
          <button
            className={`tab ${mode === 'login' ? 'active' : ''}`}
            type="button"
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`tab ${mode === 'register' ? 'active' : ''}`}
            type="button"
            onClick={() => setMode('register')}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="eve.holt@reqres.in"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button className="forgot-link" type="button">
            Forgot password?
          </button>

          <button disabled={authLoading} className="btn btn-primary" type="submit">
            {authLoading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>

        {(localMessage || authError) && (
          <p className="error-box">{localMessage || authError}</p>
        )}

        <div className="auth-divider" aria-hidden="true">
          <span />
          <span>or</span>
          <span />
        </div>

        <button
          type="button"
          className="btn btn-google"
          onClick={onGoogleContinue}
          disabled={authLoading}
        >
          <span aria-hidden="true">🔍</span>
          {authLoading ? 'Please wait...' : 'Continue with Google'}
        </button>

        <p className="auth-switch-row">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            className="inline-link"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Create account' : 'Sign in'}
          </button>
        </p>

        <p className="test-credentials">
          Demo credentials: <strong>{DEMO_EMAIL}</strong> and any password.
        </p>
      </section>
    </div>
  )
}

export default AuthPage
