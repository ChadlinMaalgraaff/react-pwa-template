import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input } from '@components/shared'
import authService from '@/services/auth.service'
import { useAppDispatch } from '@hooks/redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'
import './Register.css'

const Register = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await authService.register({ name, email, password })
      dispatch(setNotification({ message: 'Account created. Please check your email.', type: 'success' }))
      navigate('/login')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-logo">PantryPal</h1>
        <h2 className="auth-heading">Create your account</h2>
        {error && (
          <p role="alert" className="auth-error">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
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
            Sign up
          </Button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
