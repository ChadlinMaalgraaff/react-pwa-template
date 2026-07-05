import { useState, FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import authService from '@/services/auth.service'
import { useCompleteLogin } from '@hooks/useCompleteLogin'
import { redirectToGoogleSignIn } from '@utils/googleAuth'
import { MailIcon, LockIcon, EyeIcon, GoogleIcon } from '@components/pages/authIcons'
import '@styles/auth.css'

interface LoginLocationState {
  email?: string
}

const Login = () => {
  const completeLogin = useCompleteLogin()
  const location = useLocation()
  const prefilledEmail = (location.state as LoginLocationState | null)?.email ?? ''
  const [email, setEmail] = useState(prefilledEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const { accessToken } = await authService.login({ email, password })
      await completeLogin(accessToken)
    } catch {
      setError('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="wl-auth">
      <div className="wl-auth-wrap">
        <div className="wl-auth-badge">
          <img src="/whats-lekker-logo.png" alt="What's Lekker" />
        </div>

        <div className="wl-auth-card">
          <div className="wl-auth-head">
            <h1 className="wl-auth-wordmark">
              What&rsquo;s Lekker<span className="wl-auth-q">?</span>
            </h1>
            <p className="wl-auth-welcome">Welcome back</p>
            <p className="wl-auth-sub">Find the lekker in your fridge</p>
          </div>

          {error && (
            <p role="alert" className="wl-auth-error">
              {error}
            </p>
          )}

          <form className="wl-auth-form" onSubmit={handleSubmit} noValidate>
            <div className="wl-auth-field">
              <label htmlFor="email">Email</label>
              <div className="wl-auth-input">
                <span className="wl-auth-icon" aria-hidden="true">
                  <MailIcon />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="wl-auth-field">
              <label htmlFor="password">Password</label>
              <div className="wl-auth-input">
                <span className="wl-auth-icon" aria-hidden="true">
                  <LockIcon />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="wl-auth-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
            </div>

            <button type="submit" className="wl-auth-btn" disabled={isLoading}>
              {isLoading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <div className="wl-auth-divider">
            <span>OR</span>
          </div>

          <button type="button" className="wl-auth-google" onClick={redirectToGoogleSignIn}>
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="wl-auth-foot">
            Don&rsquo;t have an account?{' '}
            <Link className="wl-auth-link" to="/register">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
