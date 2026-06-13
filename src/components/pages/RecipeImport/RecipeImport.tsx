import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input, Card } from '@components/shared'
import { useRecipeAdmin } from '@hooks/useRecipeAdmin'
import { RecipeDetail } from '@/types/recipes.types'
import './RecipeImport.css'

const RecipeImport = () => {
  const { importRecipe, isSaving } = useRecipeAdmin()
  const [externalId, setExternalId] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [importedRecipe, setImportedRecipe] = useState<RecipeDetail | null>(null)

  const handleImport = async () => {
    if (!externalId.trim()) {
      setValidationError('TheMealDB Recipe ID is required.')
      return
    }
    setValidationError(null)

    try {
      const recipe = await importRecipe(externalId.trim())
      setImportedRecipe(recipe)
    } catch {
      // error notification already dispatched by useRecipeAdmin
    }
  }

  const handleReset = () => {
    setImportedRecipe(null)
    setExternalId('')
    setValidationError(null)
  }

  return (
    <div className="recipe-import-page">
      <h1 className="recipe-import-title">Import Recipe</h1>
      <p className="recipe-import-description">
        Import a recipe from TheMealDB by its recipe ID, avoiding manual entry for generic and
        international recipes.
      </p>

      {!importedRecipe && (
        <div className="recipe-import-form">
          <Input
            label="TheMealDB Recipe ID"
            value={externalId}
            onChange={(event) => setExternalId(event.target.value)}
            error={validationError ?? undefined}
          />
          <Button type="button" onClick={handleImport} isLoading={isSaving}>
            Import
          </Button>
        </div>
      )}

      {importedRecipe && (
        <Card>
          <h2 className="recipe-import-preview-title">{importedRecipe.title}</h2>
          {importedRecipe.description && (
            <p className="recipe-import-preview-meta">{importedRecipe.description}</p>
          )}

          <div className="recipe-import-preview-section">
            <h3 className="recipe-import-preview-heading">Ingredients</h3>
            <ul className="recipe-import-preview-list">
              {importedRecipe.ingredients.map((ingredient) => (
                <li key={ingredient.ingredientId}>
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="recipe-import-preview-section">
            <h3 className="recipe-import-preview-heading">Instructions</h3>
            <ul className="recipe-import-preview-list">
              {importedRecipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="recipe-import-preview-actions">
            <Link to={`/admin/recipes/${importedRecipe.id}/edit`}>
              <Button type="button">View in Recipe Editor</Button>
            </Link>
            <Button type="button" variant="secondary" onClick={handleReset}>
              Import another
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default RecipeImport
