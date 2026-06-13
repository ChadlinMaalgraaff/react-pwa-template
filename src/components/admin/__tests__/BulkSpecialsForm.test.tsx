import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import ingredientsService from '@/services/ingredients.service'
import BulkSpecialsForm from '@components/admin/BulkSpecialsForm/BulkSpecialsForm'
import { Retailer, Store } from '@/types/retailers.types'
import { CreateSpecialsRequest } from '@/types/specials.types'

vi.mock('@/services/ingredients.service', () => ({
  default: {
    listIngredients: vi.fn(),
    createIngredient: vi.fn(),
    updateIngredient: vi.fn(),
    deleteIngredient: vi.fn(),
  },
}))

const mockedService = ingredientsService as unknown as Record<'listIngredients', ReturnType<typeof vi.fn>>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const retailers: Retailer[] = [
  { id: 'retailer-1', name: 'Pick n Pay', logoUrl: null },
  { id: 'retailer-2', name: 'Woolworths', logoUrl: null },
]

const stores: Store[] = [
  { id: 'store-1', retailerId: 'retailer-1', retailerName: 'Pick n Pay', branchName: 'Sandton', suburb: null, city: 'Johannesburg' },
  { id: 'store-2', retailerId: 'retailer-2', retailerName: 'Woolworths', branchName: 'Rosebank', suburb: null, city: 'Johannesburg' },
]

const baseValue: CreateSpecialsRequest = {
  retailerId: 'retailer-1',
  validFrom: '2026-06-01',
  validTo: '2026-06-30',
  items: [{ itemName: '', price: 0, unit: '' }],
}

describe('BulkSpecialsForm Component', () => {
  beforeEach(() => {
    mockedService.listIngredients.mockResolvedValue([])
  })

  it('renders the retailer and date range header', () => {
    render(
      <Provider store={buildStore()}>
        <BulkSpecialsForm retailers={retailers} stores={stores} value={baseValue} onChange={vi.fn()} />
      </Provider>
    )
    expect(screen.getByLabelText('Retailer')).toHaveValue('retailer-1')
    expect(screen.getByLabelText('Valid From')).toHaveValue('2026-06-01')
    expect(screen.getByLabelText('Valid To')).toHaveValue('2026-06-30')
  })

  it('only shows stores for the selected retailer', () => {
    render(
      <Provider store={buildStore()}>
        <BulkSpecialsForm retailers={retailers} stores={stores} value={baseValue} onChange={vi.fn()} />
      </Provider>
    )
    const storeSelect = screen.getByLabelText('Store') as HTMLSelectElement
    const optionLabels = Array.from(storeSelect.options).map((option) => option.textContent)
    expect(optionLabels).toContain('Sandton')
    expect(optionLabels).not.toContain('Rosebank')
  })

  it('calls onChange when an item field changes', () => {
    const handleChange = vi.fn()
    render(
      <Provider store={buildStore()}>
        <BulkSpecialsForm retailers={retailers} stores={stores} value={baseValue} onChange={handleChange} />
      </Provider>
    )
    fireEvent.change(screen.getByLabelText('Item name'), { target: { value: 'Brown Bread' } })
    expect(handleChange).toHaveBeenCalledWith({
      ...baseValue,
      items: [{ itemName: 'Brown Bread', price: 0, unit: '' }],
    })
  })

  it('adds a new item row when "Add Item" is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(
      <Provider store={buildStore()}>
        <BulkSpecialsForm retailers={retailers} stores={stores} value={baseValue} onChange={handleChange} />
      </Provider>
    )
    await user.click(screen.getByRole('button', { name: 'Add Item' }))
    expect(handleChange).toHaveBeenCalledWith({
      ...baseValue,
      items: [...baseValue.items, { itemName: '', price: 0, unit: '' }],
    })
  })

  it('removes an item row when its remove button is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const value: CreateSpecialsRequest = {
      ...baseValue,
      items: [
        { itemName: 'Brown Bread', price: 18.99, unit: 'loaf' },
        { itemName: 'White Bread', price: 16.99, unit: 'loaf' },
      ],
    }
    render(
      <Provider store={buildStore()}>
        <BulkSpecialsForm retailers={retailers} stores={stores} value={value} onChange={handleChange} />
      </Provider>
    )
    const removeButtons = screen.getAllByRole('button', { name: 'Remove item' })
    await user.click(removeButtons[0])
    expect(handleChange).toHaveBeenCalledWith({
      ...value,
      items: [{ itemName: 'White Bread', price: 16.99, unit: 'loaf' }],
    })
  })
})
