import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildGoogleAuthUrl, consumeOAuthState, redirectToGoogleSignIn } from '@utils/googleAuth'

describe('googleAuth', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.stubEnv('VITE_COGNITO_DOMAIN', 'auth.example.com')
    vi.stubEnv('VITE_COGNITO_CLIENT_ID', 'client-123')
    vi.stubEnv('VITE_OAUTH_REDIRECT_URI', 'http://localhost:5173/auth/callback')
    vi.stubEnv('VITE_GOOGLE_IDP_NAME', 'Google')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('builds the Cognito Hosted UI authorize URL with the expected params', () => {
    const url = new URL(buildGoogleAuthUrl('state-abc'))
    expect(url.origin + url.pathname).toBe('https://auth.example.com/oauth2/authorize')
    expect(url.searchParams.get('identity_provider')).toBe('Google')
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('client_id')).toBe('client-123')
    expect(url.searchParams.get('scope')).toBe('openid email profile')
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:5173/auth/callback')
    expect(url.searchParams.get('state')).toBe('state-abc')
  })

  it('consumeOAuthState returns true only for a matching, stored state and clears it', () => {
    sessionStorage.setItem('googleOAuthState', 'match-me')
    expect(consumeOAuthState('match-me')).toBe(true)
    // single-use: the second check fails because it was cleared
    expect(consumeOAuthState('match-me')).toBe(false)
  })

  it('consumeOAuthState rejects a mismatched or missing state', () => {
    sessionStorage.setItem('googleOAuthState', 'expected')
    expect(consumeOAuthState('different')).toBe(false)
    expect(consumeOAuthState(null)).toBe(false)
  })

  it('redirectToGoogleSignIn stores a state and navigates to the authorize URL', () => {
    const assign = vi.fn()
    const originalLocation = window.location
    Object.defineProperty(window, 'location', { value: { assign }, writable: true, configurable: true })
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('11111111-1111-1111-1111-111111111111')

    redirectToGoogleSignIn()

    expect(sessionStorage.getItem('googleOAuthState')).toBe('11111111-1111-1111-1111-111111111111')
    expect(assign).toHaveBeenCalledTimes(1)
    expect(assign.mock.calls[0][0]).toContain('state=11111111-1111-1111-1111-111111111111')

    Object.defineProperty(window, 'location', { value: originalLocation, writable: true, configurable: true })
  })
})
