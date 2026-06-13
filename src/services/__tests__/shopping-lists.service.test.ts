import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '../api-client'
import shoppingListsService from '../shopping-lists.service'

vi.mock('../api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockedClient = apiClient as unknown as Record<'get' | 'post' | 'put' | 'delete', ReturnType<typeof vi.fn>>

describe('shoppingListsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listShoppingLists calls GET /shopping-lists', async () => {
    const data = [{ id: 'sl-1', name: 'This week', itemCount: 6, createdAt: '2026-06-10' }]
    mockedClient.get.mockResolvedValue({ data })

    const result = await shoppingListsService.listShoppingLists()

    expect(mockedClient.get).toHaveBeenCalledWith('/shopping-lists')
    expect(result).toEqual(data)
  })

  it('createShoppingList calls POST /shopping-lists', async () => {
    const payload = { name: 'This week' }
    const data = { id: 'sl-1', name: 'This week', items: [], createdAt: '2026-06-12' }
    mockedClient.post.mockResolvedValue({ data })

    const result = await shoppingListsService.createShoppingList(payload)

    expect(mockedClient.post).toHaveBeenCalledWith('/shopping-lists', payload)
    expect(result).toEqual(data)
  })

  it('getShoppingList calls GET /shopping-lists/{id}', async () => {
    const data = { id: 'sl-1', name: 'This week', items: [], createdAt: '2026-06-12' }
    mockedClient.get.mockResolvedValue({ data })

    const result = await shoppingListsService.getShoppingList('sl-1')

    expect(mockedClient.get).toHaveBeenCalledWith('/shopping-lists/sl-1')
    expect(result).toEqual(data)
  })

  it('deleteShoppingList calls DELETE /shopping-lists/{id}', async () => {
    const data = { id: 'sl-1', message: 'Shopping list deleted.' }
    mockedClient.delete.mockResolvedValue({ data })

    const result = await shoppingListsService.deleteShoppingList('sl-1')

    expect(mockedClient.delete).toHaveBeenCalledWith('/shopping-lists/sl-1')
    expect(result).toEqual(data)
  })

  it('addShoppingListItems calls POST /shopping-lists/{id}/items', async () => {
    const payload = { items: [{ ingredientId: 'ing-14', quantity: 1, unit: 'kg' }] }
    const data = [{ id: 'sli-1', ingredientId: 'ing-14', ingredientName: 'Maize meal', recipeId: null, recipeTitle: null, quantity: 1, unit: 'kg', isChecked: false }]
    mockedClient.post.mockResolvedValue({ data })

    const result = await shoppingListsService.addShoppingListItems('sl-1', payload)

    expect(mockedClient.post).toHaveBeenCalledWith('/shopping-lists/sl-1/items', payload)
    expect(result).toEqual(data)
  })

  it('updateShoppingListItem calls PUT /shopping-lists/{id}/items/{itemId}', async () => {
    const payload = { isChecked: true }
    const data = { id: 'sli-1', ingredientId: 'ing-14', ingredientName: 'Maize meal', recipeId: null, recipeTitle: null, quantity: 1, unit: 'kg', isChecked: true }
    mockedClient.put.mockResolvedValue({ data })

    const result = await shoppingListsService.updateShoppingListItem('sl-1', 'sli-1', payload)

    expect(mockedClient.put).toHaveBeenCalledWith('/shopping-lists/sl-1/items/sli-1', payload)
    expect(result).toEqual(data)
  })

  it('deleteShoppingListItem calls DELETE /shopping-lists/{id}/items/{itemId}', async () => {
    const data = { id: 'sli-1', message: 'Item deleted.' }
    mockedClient.delete.mockResolvedValue({ data })

    const result = await shoppingListsService.deleteShoppingListItem('sl-1', 'sli-1')

    expect(mockedClient.delete).toHaveBeenCalledWith('/shopping-lists/sl-1/items/sli-1')
    expect(result).toEqual(data)
  })

  it('addRecipeToShoppingList calls POST /shopping-lists/{id}/from-recipe/{recipeId}', async () => {
    const data = { addedItems: [], skippedAlreadyInPantry: [] }
    mockedClient.post.mockResolvedValue({ data })

    const result = await shoppingListsService.addRecipeToShoppingList('sl-1', 'rec-1')

    expect(mockedClient.post).toHaveBeenCalledWith('/shopping-lists/sl-1/from-recipe/rec-1', {})
    expect(result).toEqual(data)
  })
})
