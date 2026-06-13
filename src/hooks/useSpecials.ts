import { useState, useEffect, useCallback } from 'react'
import specialsService from '@/services/specials.service'
import { WeeklySpecial, ListSpecialsParams, UpdateSpecialRequest } from '@/types/specials.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'

export const useSpecials = (initialParams: ListSpecialsParams = {}) => {
  const dispatch = useAppDispatch()
  const [specials, setSpecials] = useState<WeeklySpecial[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<ListSpecialsParams>(initialParams)

  useEffect(() => {
    const fetchSpecials = async () => {
      try {
        setIsLoading(true)
        const data = await specialsService.listSpecials(params)
        setSpecials(data.items)
        setTotal(data.total)
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpecials()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, JSON.stringify(params)])

  const updateSpecial = useCallback(
    async (id: string, data: UpdateSpecialRequest) => {
      try {
        const updated = await specialsService.updateSpecial(id, data)
        setSpecials((prev) => prev.map((special) => (special.id === id ? updated : special)))
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

  const deleteSpecial = useCallback(
    async (id: string) => {
      try {
        const result = await specialsService.deleteSpecial(id)
        setSpecials((prev) => prev.filter((special) => special.id !== id))
        return result
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      }
    },
    [dispatch]
  )

  return { specials, total, isLoading, error, params, setParams, updateSpecial, deleteSpecial }
}
