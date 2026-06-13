import { useState, useEffect, useCallback } from 'react'
import pantryService from '@/services/pantry.service'
import { PantryItem, AddPantryItemInput, UpdatePantryItemRequest } from '@/types/pantry.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { setPantryItemCount } from '@store/slices/pantry.slice'
import { getErrorMessage } from '@utils/helpers'

export const usePantry = () => {
  const dispatch = useAppDispatch()
  const [items, setItems] = useState<PantryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true)
        const data = await pantryService.listPantryItems()
        setItems(data)
        dispatch(setPantryItemCount(data.length))
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
      } finally {
        setIsLoading(false)
      }
    }

    fetchItems()
  }, [dispatch])

  const addItem = useCallback(
    async (input: AddPantryItemInput) => {
      try {
        const added = await pantryService.addPantryItems({ items: [input] })
        setItems((prev) => {
          const next = [...prev, ...added]
          dispatch(setPantryItemCount(next.length))
          return next
        })
        return added
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      }
    },
    [dispatch]
  )

  const updateItem = useCallback(
    async (id: string, data: UpdatePantryItemRequest) => {
      try {
        const updated = await pantryService.updatePantryItem(id, data)
        setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
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

  const removeItem = useCallback(
    async (id: string) => {
      try {
        await pantryService.deletePantryItem(id)
        setItems((prev) => {
          const next = prev.filter((item) => item.id !== id)
          dispatch(setPantryItemCount(next.length))
          return next
        })
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      }
    },
    [dispatch]
  )

  return { items, isLoading, error, addItem, updateItem, removeItem }
}
