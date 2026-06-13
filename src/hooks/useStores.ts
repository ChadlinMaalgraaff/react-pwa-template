import { useState, useCallback } from 'react'
import retailersService from '@/services/retailers.service'
import { Store, CreateStoreRequest, UpdateStoreRequest } from '@/types/retailers.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'

export const useStores = () => {
  const dispatch = useAppDispatch()
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStoresForRetailer = useCallback(
    async (retailerId: string) => {
      try {
        setIsLoading(true)
        const data = await retailersService.listStores({ retailerId })
        setStores(data)
        return data
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [dispatch]
  )

  const createStore = useCallback(
    async (data: CreateStoreRequest) => {
      try {
        const created = await retailersService.createStore(data)
        setStores((prev) => [...prev, created])
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

  const updateStore = useCallback(
    async (id: string, data: UpdateStoreRequest) => {
      try {
        const updated = await retailersService.updateStore(id, data)
        setStores((prev) => prev.map((store) => (store.id === id ? updated : store)))
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

  const deleteStore = useCallback(
    async (id: string) => {
      try {
        const result = await retailersService.deleteStore(id)
        setStores((prev) => prev.filter((store) => store.id !== id))
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

  return { stores, isLoading, error, fetchStoresForRetailer, createStore, updateStore, deleteStore }
}
