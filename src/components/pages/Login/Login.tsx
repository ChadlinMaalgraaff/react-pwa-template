import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input } from '@components/shared'
import authService from '@/services/auth.service'
import profileService from '@/services/profile.service'
import { useAppDispatch } from '@hooks/redux.hooks'
import { setToken, setUser } from '@store/slices/auth.slice'
import './Login.css'

const Login = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const { accessToken } = await authService.login({ email, password })
      dispatch(setToken(accessToken))
      const profile = await profileService.getProfile()
      dispatch(setUser(profile))
      navigate(profile.role === 'admin' ? '/admin' : '/pantry')
    } catch {
      setError('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-logo">PantryPal</h1>
        <h2 className="auth-heading">Welcome back</h2>
        {error && (
          <p role="alert" className="auth-error">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Log in
          </Button>
        </form>
        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
