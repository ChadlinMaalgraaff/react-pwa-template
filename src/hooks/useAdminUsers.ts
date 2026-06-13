import { useState, useEffect, useCallback } from 'react'
import adminUsersService from '@/services/admin-users.service'
import { AdminUserSummary, ListAdminUsersParams } from '@/types/admin-users.types'
import { UserRole } from '@/types/profile.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'

export const useAdminUsers = (initialParams: ListAdminUsersParams = {}) => {
  const dispatch = useAppDispatch()
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<ListAdminUsersParams>(initialParams)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const data = await adminUsersService.listUsers(params)
        setUsers(data.items)
        setTotal(data.total)
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, JSON.stringify(params)])

  const updateUserRole = useCallback(
    async (id: string, role: UserRole) => {
      try {
        const updated = await adminUsersService.updateUserRole(id, role)
        setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)))
        return updated
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      }
    },
    [dispatch]
  )

  return { users, total, isLoading, error, params, setParams, updateUserRole }
}
