import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import ingredientsService from '@/services/ingredients.service'
import { useIngredients } from '../useIngredients'
import { Ingredient } from '@/types/ingredients.types'

vi.mock('@/services/ingredients.service', () => ({
  default: {
    listIngredients: vi.fn(),
    createIngredient: vi.fn(),
    updateIngredient: vi.fn(),
    deleteIngredient: vi.fn(),
  },
}))

const mockedService = ingredientsService as unknown as Record<
  'listIngredients' | 'createIngredient' | 'updateIngredient' | 'deleteIngredient',
  ReturnType<typeof vi.fn>
>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const ingredient: Ingredient = {
  id: 'ing-1',
  name: 'Rice',
  category: 'Grains',
  defaultUnit: 'kg',
  aliases: [],
}

describe('useIngredients', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches ingredients on mount', async () => {
    mockedService.listIngredients.mockResolvedValue([ingredient])
    const store = buildStore()

    const { result } = renderHook(() => useIngredients(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.ingredients).toEqual([ingredient])
    expect(result.current.total).toBe(1)
  })

  it('refetches when params change', async () => {
    mockedService.listIngredients.mockResolvedValue([ingredient])
    const store = buildStore()

    const { result } = renderHook(() => useIngredients(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setParams({ search: 'rice' })
    })

    await waitFor(() => expect(mockedService.listIngredients).toHaveBeenCalledWith({ search: 'rice' }))
  })

  it('createIngredient appends the new ingredient', async () => {
    mockedService.listIngredients.mockResolvedValue([])
    const created = { ...ingredient, id: 'ing-2' }
    mockedService.createIngredient.mockResolvedValue(created)
    const store = buildStore()

    const { result } = renderHook(() => useIngredients(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.createIngredient({ name: 'Rice', defaultUnit: 'kg' })
    })

    expect(result.current.ingredients).toEqual([created])
  })

  it('updateIngredient replaces the ingredient', async () => {
    mockedService.listIngredients.mockResolvedValue([ingredient])
    const updated = { ...ingredient, name: 'Brown Rice' }
    mockedService.updateIngredient.mockResolvedValue(updated)
    const store = buildStore()

    const { result } = renderHook(() => useIngredients(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.updateIngredient('ing-1', { name: 'Brown Rice' })
    })

    expect(result.current.ingredients).toEqual([updated])
  })

  it('deleteIngredient removes the ingredient', async () => {
    mockedService.listIngredients.mockResolvedValue([ingredient])
    mockedService.deleteIngredient.mockResolvedValue({ id: 'ing-1', message: 'deleted' })
    const store = buildStore()

    const { result } = renderHook(() => useIngredients(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.deleteIngredient('ing-1')
    })

    expect(result.current.ingredients).toEqual([])
  })
})
