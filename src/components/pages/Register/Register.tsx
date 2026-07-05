import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '@/services/auth.service'
import { useAppDispatch } from '@hooks/redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'
import { redirectToGoogleSignIn } from '@utils/googleAuth'
import { useCompleteLogin } from '@hooks/useCompleteLogin'
import { MailIcon, LockIcon, UserIcon, EyeIcon, GoogleIcon } from '@components/pages/authIcons'
import '@styles/auth.css'

const Register = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const completeLogin = useCompleteLogin()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await authService.register({ name, email, password })
    } catch (err) {
      setError(getErrorMessage(err))
      setIsLoading(false)
      return
    }

    // Registration succeeded — the backend auto-confirms new accounts, so an
    // immediate login should work. If it doesn't, the account still exists;
    // fall back to the login screen rather than reporting a failure.
    try {
      const { accessToken } = await authService.login({ email, password })
      await completeLogin(accessToken)
    } catch {
      dispatch(setNotification({ message: 'Account created — please sign in', type: 'success' }))
      navigate('/login', { state: { email } })
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
            <p className="wl-auth-welcome">Create your account</p>
            <p className="wl-auth-sub">Start finding the lekker in your fridge</p>
          </div>

          {error && (
            <p role="alert" className="wl-auth-error">
              {error}
            </p>
          )}

          <form className="wl-auth-form" onSubmit={handleSubmit} noValidate>
            <div className="wl-auth-field">
              <label htmlFor="name">Name</label>
              <div className="wl-auth-input">
                <span className="wl-auth-icon" aria-hidden="true">
                  <UserIcon />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            </div>

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
                  autoComplete="new-password"
                  placeholder="Create a password"
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
              {isLoading ? 'Creating account…' : 'Sign up'}
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
            Already have an account?{' '}
            <Link className="wl-auth-link" to="/login">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
