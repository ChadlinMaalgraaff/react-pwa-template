import { useState, useEffect, useCallback } from 'react'
import shoppingListsService from '@/services/shopping-lists.service'
import { ShoppingListSummary, CreateShoppingListRequest } from '@/types/shopping-lists.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'

export const useShoppingLists = () => {
  const dispatch = useAppDispatch()
  const [lists, setLists] = useState<ShoppingListSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLists = async () => {
      try {
        setIsLoading(true)
        const data = await shoppingListsService.listShoppingLists()
        setLists(data)
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
      } finally {
        setIsLoading(false)
      }
    }

    fetchLists()
  }, [dispatch])

  const createList = useCallback(
    async (data: CreateShoppingListRequest = {}) => {
      try {
        const created = await shoppingListsService.createShoppingList(data)
        setLists((prev) => [...prev, { id: created.id, name: created.name, itemCount: created.items.length, createdAt: created.createdAt }])
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

  const deleteList = useCallback(
    async (id: string) => {
      try {
        const result = await shoppingListsService.deleteShoppingList(id)
        setLists((prev) => prev.filter((list) => list.id !== id))
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

  return { lists, isLoading, error, createList, deleteList }
}
