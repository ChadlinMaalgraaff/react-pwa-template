import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@hooks/redux.hooks'
import { selectIsAdmin } from '@store/selectors/auth.selectors'

const AdminRoute = () => {
  const isAdmin = useAppSelector(selectIsAdmin)

  if (!isAdmin) {
    return <Navigate to="/pantry" replace />
  }

  return <Outlet />
}

export default AdminRoute
