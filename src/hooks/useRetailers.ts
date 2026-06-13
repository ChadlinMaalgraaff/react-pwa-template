import { useState, useEffect, useCallback } from 'react'
import retailersService from '@/services/retailers.service'
import { Retailer, CreateRetailerRequest, UpdateRetailerRequest } from '@/types/retailers.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'

export const useRetailers = () => {
  const dispatch = useAppDispatch()
  const [retailers, setRetailers] = useState<Retailer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        setIsLoading(true)
        const data = await retailersService.listRetailers()
        setRetailers(data)
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
      } finally {
        setIsLoading(false)
      }
    }

    fetchRetailers()
  }, [dispatch])

  const createRetailer = useCallback(
    async (data: CreateRetailerRequest) => {
      try {
        const created = await retailersService.createRetailer(data)
        setRetailers((prev) => [...prev, created])
        return created
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      }
    },
    [dispatch]
  )

  const updateRetailer = useCallback(
    async (id: string, data: UpdateRetailerRequest) => {
      try {
        const updated = await retailersService.updateRetailer(id, data)
        setRetailers((prev) => prev.map((retailer) => (retailer.id === id ? updated : retailer)))
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

  return { retailers, isLoading, error, createRetailer, updateRetailer }
}
