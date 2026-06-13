import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@hooks/redux.hooks'
import { selectIsAuthenticated } from '@store/selectors/auth.selectors'

const ProtectedRoute = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
