import { useEffect, useRef, useState } from 'react'
import { UtensilsCrossed, CheckCircle2, SkipForward, AlertTriangle } from 'lucide-react'
import { Button, Modal, Select, Spinner } from '@components/shared'
import recipesService from '@/services/recipes.service'
import { TheMealDBRecipe, BulkImportResult } from '@/types/recipes.types'
import { useAppDispatch } from '@hooks/redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'
import './TheMealDBImportModal.css'

type ModalScreen = 'browse' | 'importing' | 'summary'

interface TheMealDBImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

const SKELETON_COUNT = 4

const TheMealDBImportModal = ({ isOpen, onClose, onImportComplete }: TheMealDBImportModalProps) => {
  const dispatch = useAppDispatch()
  const [screen, setScreen] = useState<ModalScreen>('browse')
  const [categories, setCategories] = useState<string[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [category, setCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [browseError, setBrowseError] = useState<string | null>(null)
  const [recipes, setRecipes] = useState<TheMealDBRecipe[]>([])
  const [recipesLoading, setRecipesLoading] = useState(false)
  const [hasBrowsed, setHasBrowsed] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    resetToInitial()
    setCategoriesLoading(true)
    recipesService
      .getTheMealDBCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => {
        dispatch(setNotification({ message: 'Could not load categories.', type: 'error' }))
      })
      .finally(() => setCategoriesLoading(false))
  }, [isOpen, dispatch])

  const resetToInitial = () => {
    setScreen('browse')
    setCategory('')
    setSearchTerm('')
    setBrowseError(null)
    setRecipes([])
    setRecipesLoading(false)
    setHasBrowsed(false)
    setSelectedIds(new Set())
    setImportResult(null)
  }

  const handleBrowse = async () => {
    if (!category && !searchTerm.trim()) {
      setBrowseError('Select a category or enter a search term.')
      return
    }
    setBrowseError(null)
    setRecipesLoading(true)
    setHasBrowsed(true)
    setSelectedIds(new Set())
    try {
      const params = category ? { category } : { search: searchTerm.trim() }
      const data = await recipesService.browseTheMealDB(params)
      setRecipes(data.recipes)
    } catch (err) {
      const status = (err as { response?: { status: number } })?.response?.status
      if (status === 502) {
        dispatch(setNotification({ message: 'Could not reach TheMealDB. Try again.', type: 'error' }))
      } else if (status === 403) {
        dispatch(setNotification({ message: 'Access denied.', type: 'error' }))
      } else {
        dispatch(setNotification({ message: getErrorMessage(err), type: 'error' }))
      }
      setRecipes([])
    } finally {
      setRecipesLoading(false)
    }
  }

  const importableRecipes = recipes.filter((r) => !r.alreadyImported)
  const alreadyImportedCount = recipes.length - importableRecipes.length
  const allSelected = importableRecipes.length > 0 && importableRecipes.every((r) => selectedIds.has(r.externalId))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(importableRecipes.map((r) => r.externalId)))
    }
  }

  const toggleRow = (externalId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(externalId)) next.delete(externalId)
      else next.add(externalId)
      return next
    })
  }

  const handleImport = async () => {
    setScreen('importing')
    try {
      const result = await recipesService.bulkImportRecipes(Array.from(selectedIds))
      setImportResult(result)
      setScreen('summary')
    } catch (err) {
      const status = (err as { response?: { status: number } })?.response?.status
      if (status === 403) {
        dispatch(setNotification({ message: 'Access denied.', type: 'error' }))
      } else {
        dispatch(setNotification({ message: 'Import failed. Please try again.', type: 'error' }))
      }
      setScreen('browse')
    }
  }

  const handleDone = () => {
    onImportComplete()
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  const title =
    screen === 'importing'
      ? 'Importing recipes…'
      : screen === 'summary'
        ? 'Import complete'
        : 'Import from TheMealDB'

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} className="themealdb-modal">
      {screen === 'browse' && (
        <div className="themealdb-browse">
          <div className="themealdb-search-bar">
            <div className="themealdb-search-category">
              <Select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setSearchTerm('')
                }}
                options={
                  categoriesLoading
                    ? [{ value: '', label: 'Loading categories…' }]
                    : categories.map((c) => ({ value: c, label: c }))
                }
                placeholder="Category"
                disabled={categoriesLoading}
              />
            </div>
            <span className="themealdb-or">or</span>
            <input
              ref={searchRef}
              className="themealdb-search-input"
              type="text"
              placeholder="Search…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCategory('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleBrowse()}
            />
            <Button type="button" onClick={handleBrowse} disabled={recipesLoading}>
              Browse
            </Button>
          </div>
          {browseError && <p className="themealdb-browse-error">{browseError}</p>}

          {recipesLoading && (
            <div className="themealdb-table-wrap">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <div key={i} className="themealdb-skeleton-row">
                  <div className="themealdb-skeleton-check" />
                  <div className="themealdb-skeleton-thumb" />
                  <div className="themealdb-skeleton-text" />
                </div>
              ))}
            </div>
          )}

          {!recipesLoading && hasBrowsed && (
            <>
              <div className="themealdb-table-meta">
                <label className="themealdb-select-all">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    disabled={importableRecipes.length === 0}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                  <span>Select all</span>
                </label>
                <span className="themealdb-table-count">
                  {recipes.length === 0
                    ? 'No results'
                    : `${recipes.length} recipe${recipes.length !== 1 ? 's' : ''}${alreadyImportedCount > 0 ? `, ${alreadyImportedCount} already imported` : ''}`}
                </span>
              </div>
              <div className="themealdb-table-wrap">
                {recipes.length === 0 ? (
                  <p className="themealdb-empty">No recipes found. Try a different category or search term.</p>
                ) : (
                  <table className="themealdb-table">
                    <tbody>
                      {recipes.map((recipe) => (
                        <tr
                          key={recipe.externalId}
                          className={`themealdb-row${recipe.alreadyImported ? ' themealdb-row--imported' : ''}`}
                          onClick={() => !recipe.alreadyImported && toggleRow(recipe.externalId)}
                        >
                          <td className="themealdb-cell-check">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(recipe.externalId)}
                              disabled={recipe.alreadyImported}
                              onChange={() => toggleRow(recipe.externalId)}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Select ${recipe.title}`}
                            />
                          </td>
                          <td className="themealdb-cell-thumb">
                            {recipe.thumbnail ? (
                              <img
                                src={recipe.thumbnail}
                                alt=""
                                className="themealdb-thumb"
                                aria-hidden="true"
                              />
                            ) : (
                              <span className="themealdb-thumb-placeholder">
                                <UtensilsCrossed className="h-5 w-5" />
                              </span>
                            )}
                          </td>
                          <td className="themealdb-cell-title">{recipe.title}</td>
                          <td className="themealdb-cell-status">
                            {recipe.alreadyImported && (
                              <span className="themealdb-imported-chip">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Already imported
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          <div className="themealdb-footer">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={selectedIds.size === 0}
            >
              Import selected ({selectedIds.size})
            </Button>
          </div>
        </div>
      )}

      {screen === 'importing' && (
        <div className="themealdb-importing">
          <Spinner />
          <p className="themealdb-importing-message">
            Importing {selectedIds.size} recipe{selectedIds.size !== 1 ? 's' : ''}…
          </p>
          <p className="themealdb-importing-hint">Please don&rsquo;t close this window.</p>
        </div>
      )}

      {screen === 'summary' && importResult && (
        <div className="themealdb-summary">
          <div className="themealdb-summary-row">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span>{importResult.imported} recipe{importResult.imported !== 1 ? 's' : ''} imported successfully</span>
          </div>
          {importResult.skipped > 0 && (
            <div className="themealdb-summary-row">
              <SkipForward className="h-5 w-5 text-ink-soft" />
              <span>{importResult.skipped} skipped (already in your database)</span>
            </div>
          )}
          {importResult.failed.length > 0 && (
            <div className="themealdb-summary-failed">
              <div className="themealdb-summary-row">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>{importResult.failed.length} failed:</span>
              </div>
              <ul className="themealdb-failed-list">
                {importResult.failed.map((f) => (
                  <li key={f.externalId}>
                    {f.externalId} — {f.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="themealdb-footer">
            <Button type="button" variant="secondary" onClick={resetToInitial}>
              Import more
            </Button>
            <Button type="button" onClick={handleDone}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default TheMealDBImportModal
