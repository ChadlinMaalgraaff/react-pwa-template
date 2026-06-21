import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import recipesService from '@/services/recipes.service'
import TheMealDBImportModal from '@components/admin/TheMealDBImportModal/TheMealDBImportModal'

vi.mock('@/services/recipes.service', () => ({
  default: {
    getTheMealDBCategories: vi.fn(),
    browseTheMealDB: vi.fn(),
    bulkImportRecipes: vi.fn(),
  },
}))

const mockedService = recipesService as unknown as Record<
  'getTheMealDBCategories' | 'browseTheMealDB' | 'bulkImportRecipes',
  ReturnType<typeof vi.fn>
>

const buildStore = () =>
  configureStore({ reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer } })

const onClose = vi.fn()
const onImportComplete = vi.fn()

const renderModal = (isOpen = true) =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <TheMealDBImportModal isOpen={isOpen} onClose={onClose} onImportComplete={onImportComplete} />
      </MemoryRouter>
    </Provider>
  )

const categories = ['Beef', 'Chicken', 'Dessert']
const browseResults = [
  { externalId: '52772', title: 'Teriyaki Chicken', thumbnail: null, alreadyImported: false },
  { externalId: '52804', title: 'Chicken Handi', thumbnail: null, alreadyImported: true },
]

describe('TheMealDBImportModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedService.getTheMealDBCategories.mockResolvedValue({ categories })
    mockedService.browseTheMealDB.mockResolvedValue({ recipes: browseResults })
    mockedService.bulkImportRecipes.mockResolvedValue({ imported: 1, skipped: 0, failed: [] })
  })

  it('does not render when closed', () => {
    renderModal(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('loads categories on open and populates the dropdown', async () => {
    renderModal()
    await waitFor(() =>
      expect(mockedService.getTheMealDBCategories).toHaveBeenCalledTimes(1)
    )
    expect(screen.getByRole('option', { name: 'Chicken' })).toBeInTheDocument()
  })

  it('shows browse results after clicking Browse', async () => {
    const user = userEvent.setup()
    renderModal()
    await waitFor(() => expect(screen.getByRole('option', { name: 'Chicken' })).toBeInTheDocument())

    await user.selectOptions(screen.getByRole('combobox'), 'Chicken')
    await user.click(screen.getByRole('button', { name: 'Browse' }))

    await waitFor(() => expect(screen.getByText('Teriyaki Chicken')).toBeInTheDocument())
    expect(screen.getByText('Chicken Handi')).toBeInTheDocument()
  })

  it('disables checkboxes for already-imported rows', async () => {
    const user = userEvent.setup()
    renderModal()
    await waitFor(() => expect(screen.getByRole('option', { name: 'Chicken' })).toBeInTheDocument())

    await user.selectOptions(screen.getByRole('combobox'), 'Chicken')
    await user.click(screen.getByRole('button', { name: 'Browse' }))

    await waitFor(() => expect(screen.getByText('Chicken Handi')).toBeInTheDocument())
    const handiCheckbox = screen.getByRole('checkbox', { name: 'Select Chicken Handi' })
    expect(handiCheckbox).toBeDisabled()
  })

  it('allows selecting importable rows and enables the import button', async () => {
    const user = userEvent.setup()
    renderModal()
    await waitFor(() => expect(screen.getByRole('option', { name: 'Chicken' })).toBeInTheDocument())

    await user.selectOptions(screen.getByRole('combobox'), 'Chicken')
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    await waitFor(() => expect(screen.getByText('Teriyaki Chicken')).toBeInTheDocument())

    expect(screen.getByRole('button', { name: /import selected \(0\)/i })).toBeDisabled()
    await user.click(screen.getByRole('checkbox', { name: 'Select Teriyaki Chicken' }))
    expect(screen.getByRole('button', { name: /import selected \(1\)/i })).toBeEnabled()
  })

  it('selects all importable rows via Select All', async () => {
    const user = userEvent.setup()
    renderModal()
    await waitFor(() => expect(screen.getByRole('option', { name: 'Chicken' })).toBeInTheDocument())

    await user.selectOptions(screen.getByRole('combobox'), 'Chicken')
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    await waitFor(() => expect(screen.getByText('Teriyaki Chicken')).toBeInTheDocument())

    await user.click(screen.getByRole('checkbox', { name: 'Select all' }))
    expect(screen.getByRole('button', { name: /import selected \(1\)/i })).toBeEnabled()
  })

  it('shows importing screen while request is in flight', async () => {
    let resolve!: (v: unknown) => void
    mockedService.bulkImportRecipes.mockReturnValue(new Promise((r) => { resolve = r }))

    const user = userEvent.setup()
    renderModal()
    await waitFor(() => expect(screen.getByRole('option', { name: 'Chicken' })).toBeInTheDocument())

    await user.selectOptions(screen.getByRole('combobox'), 'Chicken')
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    await waitFor(() => expect(screen.getByText('Teriyaki Chicken')).toBeInTheDocument())

    await user.click(screen.getByRole('checkbox', { name: 'Select Teriyaki Chicken' }))
    await user.click(screen.getByRole('button', { name: /import selected/i }))

    expect(screen.getByRole('dialog', { name: 'Importing recipes…' })).toBeInTheDocument()
    resolve({ imported: 1, skipped: 0, failed: [] })
  })

  it('shows summary screen after successful import', async () => {
    const user = userEvent.setup()
    renderModal()
    await waitFor(() => expect(screen.getByRole('option', { name: 'Chicken' })).toBeInTheDocument())

    await user.selectOptions(screen.getByRole('combobox'), 'Chicken')
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    await waitFor(() => expect(screen.getByText('Teriyaki Chicken')).toBeInTheDocument())

    await user.click(screen.getByRole('checkbox', { name: 'Select Teriyaki Chicken' }))
    await user.click(screen.getByRole('button', { name: /import selected/i }))

    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Import complete' })).toBeInTheDocument())
    expect(screen.getByText(/1 recipe imported successfully/i)).toBeInTheDocument()
  })

  it('shows failed entries on summary screen', async () => {
    mockedService.bulkImportRecipes.mockResolvedValue({
      imported: 0,
      skipped: 0,
      failed: [{ externalId: '52772', reason: 'Not found in TheMealDB' }],
    })

    const user = userEvent.setup()
    renderModal()
    await waitFor(() => expect(screen.getByRole('option', { name: 'Chicken' })).toBeInTheDocument())

    await user.selectOptions(screen.getByRole('combobox'), 'Chicken')
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    await waitFor(() => expect(screen.getByText('Teriyaki Chicken')).toBeInTheDocument())

    await user.click(screen.getByRole('checkbox', { name: 'Select Teriyaki Chicken' }))
    await user.click(screen.getByRole('button', { name: /import selected/i }))

    await waitFor(() => expect(screen.getByText(/Not found in TheMealDB/)).toBeInTheDocument())
  })

  it('calls onImportComplete and onClose when Done is clicked', async () => {
    const user = userEvent.setup()
    renderModal()
    await waitFor(() => expect(screen.getByRole('option', { name: 'Chicken' })).toBeInTheDocument())

    await user.selectOptions(screen.getByRole('combobox'), 'Chicken')
    await user.click(screen.getByRole('button', { name: 'Browse' }))
    await waitFor(() => expect(screen.getByText('Teriyaki Chicken')).toBeInTheDocument())

    await user.click(screen.getByRole('checkbox', { name: 'Select Teriyaki Chicken' }))
    await user.click(screen.getByRole('button', { name: /import selected/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(onImportComplete).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows validation error when browsing with no category or search', async () => {
    const user = userEvent.setup()
    renderModal()
    await waitFor(() => expect(screen.getByRole('option', { name: 'Chicken' })).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Browse' }))
    expect(screen.getByText('Select a category or enter a search term.')).toBeInTheDocument()
    expect(mockedService.browseTheMealDB).not.toHaveBeenCalled()
  })
})
