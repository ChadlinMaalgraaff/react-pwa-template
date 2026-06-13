import { useState, useEffect, useCallback } from 'react'
import shoppingListsService from '@/services/shopping-lists.service'
import { ShoppingListDetail, AddShoppingListItemInput, UpdateShoppingListItemRequest } from '@/types/shopping-lists.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'

export const useShoppingListDetail = (id: string | undefined) => {
  const dispatch = useAppDispatch()
  const [list, setList] = useState<ShoppingListDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchList = async () => {
      try {
        setIsLoading(true)
        const data = await shoppingListsService.getShoppingList(id)
        setList(data)
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
      } finally {
        setIsLoading(false)
      }
    }

    fetchList()
  }, [dispatch, id])

  const addItem = useCallback(
    async (input: AddShoppingListItemInput) => {
      if (!id) return
      try {
        const added = await shoppingListsService.addShoppingListItems(id, { items: [input] })
        setList((prev) => (prev ? { ...prev, items: [...prev.items, ...added] } : prev))
        return added
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      }
    },
    [dispatch, id]
  )

  const updateItem = useCallback(
    async (itemId: string, data: UpdateShoppingListItemRequest) => {
      if (!id) return
      try {
        const updated = await shoppingListsService.updateShoppingListItem(id, itemId, data)
        setList((prev) =>
          prev ? { ...prev, items: prev.items.map((item) => (item.id === itemId ? updated : item)) } : prev
        )
        return updated
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      }
    },
    [dispatch, id]
  )

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!id) return
      try {
        const result = await shoppingListsService.deleteShoppingListItem(id, itemId)
        setList((prev) => (prev ? { ...prev, items: prev.items.filter((item) => item.id !== itemId) } : prev))
        return result
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      }
    },
    [dispatch, id]
  )

  const addFromRecipe = useCallback(
    async (recipeId: string) => {
      if (!id) return
      try {
        const result = await shoppingListsService.addRecipeToShoppingList(id, recipeId)
        setList((prev) => (prev ? { ...prev, items: [...prev.items, ...result.addedItems] } : prev))
        return result
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      }
    },
    [dispatch, id]
  )

  return { list, isLoading, error, addItem, updateItem, removeItem, addFromRecipe }
}
