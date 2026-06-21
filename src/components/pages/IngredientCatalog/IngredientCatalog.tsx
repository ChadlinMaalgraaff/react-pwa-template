import { useEffect, useMemo, useState } from 'react'
import { Button, SearchBar, Select, ConfirmDialog, Input } from '@components/shared'
import { DataTable, AdminFormModal, DataTableColumn } from '@components/admin'
import { useIngredients } from '@hooks/useIngredients'
import { useAppDispatch } from '@hooks/redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import ingredientsService from '@/services/ingredients.service'
import { Ingredient } from '@/types/ingredients.types'
import './IngredientCatalog.css'

interface IngredientFormState {
  name: string
  category: string
  defaultUnit: string
  aliases: string
}

const EMPTY_FORM: IngredientFormState = { name: '', category: '', defaultUnit: '', aliases: '' }

const IngredientCatalog = () => {
  const dispatch = useAppDispatch()
  const { ingredients: allIngredients } = useIngredients()
  const { ingredients, isLoading, params, setParams, createIngredient, updateIngredient, deleteIngredient } =
    useIngredients()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState<IngredientFormState>(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isNormalizeConfirmOpen, setIsNormalizeConfirmOpen] = useState(false)
  const [isNormalizing, setIsNormalizing] = useState(false)

  useEffect(() => {
    setParams({ search: search || undefined, category: category || undefined })
  }, [search, category, setParams])

  const categories = useMemo(
    () => Array.from(new Set(allIngredients.map((ingredient) => ingredient.category).filter(Boolean))) as string[],
    [allIngredients]
  )

  const openCreateForm = () => {
    setEditingIngredient(null)
    setForm(EMPTY_FORM)
    setIsFormOpen(true)
  }

  const openEditForm = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient)
    setForm({
      name: ingredient.name,
      category: ingredient.category ?? '',
      defaultUnit: ingredient.defaultUnit,
      aliases: ingredient.aliases.join(', '),
    })
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingIngredient(null)
    setForm(EMPTY_FORM)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const data = {
        name: form.name,
        category: form.category || undefined,
        defaultUnit: form.defaultUnit,
        aliases: form.aliases
          .split(',')
          .map((alias) => alias.trim())
          .filter(Boolean),
      }
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, data)
      } else {
        await createIngredient(data)
      }
      closeForm()
    } finally {
      setIsSaving(false)
    }
  }

  const handleNormalize = async () => {
    setIsNormalizeConfirmOpen(false)
    setIsNormalizing(true)
    try {
      const result = await ingredientsService.normalizeIngredientsBulk()
      if (result.total === 0) {
        dispatch(setNotification({ message: 'All ingredients are already normalized.', type: 'success' }))
      } else if (result.failed > 0) {
        dispatch(setNotification({ message: `Normalized ${result.updated} of ${result.total}. ${result.failed} could not be normalized.`, type: 'success' }))
      } else {
        dispatch(setNotification({ message: `Normalized ${result.updated} of ${result.total} ingredients.`, type: 'success' }))
      }
    } catch (err) {
      const status = (err as { response?: { status: number } })?.response?.status
      if (status === 403) {
        dispatch(setNotification({ message: 'Access denied.', type: 'error' }))
      } else {
        dispatch(setNotification({ message: 'Normalization failed. Check server logs.', type: 'error' }))
      }
    } finally {
      setIsNormalizing(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingIngredient) return
    setIsDeleting(true)
    try {
      await deleteIngredient(deletingIngredient.id)
      setDeletingIngredient(null)
    } catch {
      // error notification already dispatched by useIngredients
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: DataTableColumn<Ingredient>[] = [
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category', render: (row) => row.category ?? '-' },
    { key: 'defaultUnit', header: 'Default Unit' },
    { key: 'aliases', header: 'Aliases', render: (row) => row.aliases.join(', ') },
  ]

  return (
    <div className="ingredient-catalog-page">
      <div className="ingredient-catalog-header">
        <h1 className="ingredient-catalog-title">Ingredients</h1>
        <div className="ingredient-catalog-header-actions">
          <Button type="button" variant="secondary" onClick={() => setIsNormalizeConfirmOpen(true)} isLoading={isNormalizing}>
            {isNormalizing ? 'Normalizing…' : 'Normalize Ingredients'}
          </Button>
          <Button type="button" onClick={openCreateForm}>
            + New Ingredient
          </Button>
        </div>
      </div>

      <div className="ingredient-catalog-filters">
        <SearchBar placeholder="Search ingredients..." onSearch={setSearch} />
        <Select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          options={categories.map((value) => ({ value, label: value }))}
          placeholder="All categories"
        />
      </div>

      <DataTable
        columns={columns}
        rows={ingredients}
        getRowId={(row) => row.id}
        onEdit={openEditForm}
        onDelete={setDeletingIngredient}
        emptyMessage={params.search || params.category ? 'No ingredients match your filters.' : 'No ingredients yet.'}
        isLoading={isLoading}
      />

      <AdminFormModal
        isOpen={isFormOpen}
        title={editingIngredient ? 'Edit Ingredient' : 'New Ingredient'}
        onClose={closeForm}
        onSave={handleSave}
        isSaving={isSaving}
      >
        <div className="ingredient-catalog-form">
          <Input
            label="Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <Input
            label="Category"
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
          />
          <Input
            label="Default Unit"
            value={form.defaultUnit}
            onChange={(event) => setForm({ ...form, defaultUnit: event.target.value })}
            required
          />
          <Input
            label="Aliases (comma-separated)"
            value={form.aliases}
            onChange={(event) => setForm({ ...form, aliases: event.target.value })}
          />
        </div>
      </AdminFormModal>

      <ConfirmDialog
        isOpen={!!deletingIngredient}
        title="Delete Ingredient"
        message={`Are you sure you want to delete "${deletingIngredient?.name}"? This cannot be undone.`}
        confirmText="Delete"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingIngredient(null)}
      />

      <ConfirmDialog
        isOpen={isNormalizeConfirmOpen}
        title="Normalize ingredient names?"
        message="This will use AI to populate the normalized name for all ingredients that don't have one yet. This helps recipe matching work across different brand names. This may take up to 2 minutes for large ingredient lists."
        confirmText="Normalize"
        isLoading={isNormalizing}
        onConfirm={handleNormalize}
        onCancel={() => setIsNormalizeConfirmOpen(false)}
      />
    </div>
  )
}

export default IngredientCatalog
