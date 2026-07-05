import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Spinner } from '@components/shared'
import authService from '@/services/auth.service'
import { consumeOAuthState } from '@utils/googleAuth'
import { useCompleteLogin } from '@hooks/useCompleteLogin'
import '@styles/auth.css'

/**
 * OAuth redirect target for Google sign-in via the Cognito Hosted UI.
 * Cognito sends back ?code=…&state=…; we verify state, hand the code to the
 * backend for the token exchange, then run the shared post-login sequence.
 */
const AuthCallback = () => {
  const [params] = useSearchParams()
  const completeLogin = useCompleteLogin()
  const [error, setError] = useState<string | null>(null)
  // Guard against the effect running twice (React 18 StrictMode) — the code is single-use.
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const run = async () => {
      const code = params.get('code')
      const returnedState = params.get('state')

      if (params.get('error')) {
        setError('Google sign-in was cancelled or failed. Please try again.')
        return
      }
      if (!consumeOAuthState(returnedState)) {
        setError('We could not verify this sign-in. Please try again.')
        return
      }
      if (!code) {
        setError('Missing authorization code. Please try again.')
        return
      }

      try {
        const { accessToken } = await authService.loginWithGoogleCode(code)
        await completeLogin(accessToken)
      } catch {
        setError('Could not complete Google sign-in. Please try again.')
      }
    }

    run()
  }, [params, completeLogin])

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
            <p className="wl-auth-welcome">{error ? 'Sign-in failed' : 'Signing you in…'}</p>
            {!error && <p className="wl-auth-sub">Hang tight while we finish up</p>}
          </div>

          {error ? (
            <>
              <p role="alert" className="wl-auth-error">
                {error}
              </p>
              <p className="wl-auth-foot">
                <Link className="wl-auth-link" to="/login">
                  Back to login
                </Link>
              </p>
            </>
          ) : (
            <div className="wl-auth-callback">
              <Spinner size="lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthCallback
