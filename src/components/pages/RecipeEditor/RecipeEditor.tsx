import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Button, Input, Select, Chip, Spinner } from '@components/shared'
import { RecipeIngredientFormRow, RecipeIngredientFormValue } from '@components/admin'
import { useRecipeDetail } from '@hooks/useRecipeDetail'
import { useRecipeAdmin } from '@hooks/useRecipeAdmin'
import { CreateRecipeRequest } from '@/types/recipes.types'
import './RecipeEditor.css'

const CUISINE_OPTIONS = ['South African', 'Italian', 'Indian', 'Chinese', 'Mexican', 'Mediterranean']

const createEmptyIngredient = (): RecipeIngredientFormValue => ({
  ingredientName: '',
  quantity: 1,
  unit: '',
  isOptional: false,
  notes: '',
})

const RecipeEditor = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)
  const { recipe, isLoading, error } = useRecipeDetail(id)
  const { createRecipe, updateRecipe, isSaving } = useRecipeAdmin()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [prepTimeMinutes, setPrepTimeMinutes] = useState('')
  const [cookTimeMinutes, setCookTimeMinutes] = useState('')
  const [servings, setServings] = useState('')
  const [isSaStaple, setIsSaStaple] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [ingredients, setIngredients] = useState<RecipeIngredientFormValue[]>([createEmptyIngredient()])
  const [titleError, setTitleError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEditMode && !isLoading && error) {
      navigate('/admin/recipes')
    }
  }, [isEditMode, isLoading, error, navigate])

  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title)
      setDescription(recipe.description ?? '')
      setCuisine(recipe.cuisine ?? '')
      setPrepTimeMinutes(recipe.prepTimeMinutes !== null ? String(recipe.prepTimeMinutes) : '')
      setCookTimeMinutes(recipe.cookTimeMinutes !== null ? String(recipe.cookTimeMinutes) : '')
      setServings(recipe.servings !== null ? String(recipe.servings) : '')
      setIsSaStaple(recipe.isSaStaple)
      setInstructions(recipe.instructions.join('\n'))
      setIngredients(
        recipe.ingredients.length > 0
          ? recipe.ingredients.map((ingredient) => ({
              ingredientId: ingredient.ingredientId,
              ingredientName: ingredient.name,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              isOptional: ingredient.isOptional,
              notes: ingredient.notes ?? '',
            }))
          : [createEmptyIngredient()]
      )
    }
  }, [recipe])

  const addIngredient = () => setIngredients((prev) => [...prev, createEmptyIngredient()])

  const updateIngredient = (index: number, value: RecipeIngredientFormValue) =>
    setIngredients((prev) => prev.map((existing, i) => (i === index ? value : existing)))

  const removeIngredient = (index: number) =>
    setIngredients((prev) => prev.filter((_, i) => i !== index))

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError('Title is required.')
      return
    }
    setTitleError(null)

    const data: CreateRecipeRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      instructions: instructions
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      cuisine: cuisine || undefined,
      prepTimeMinutes: prepTimeMinutes ? Number(prepTimeMinutes) : undefined,
      cookTimeMinutes: cookTimeMinutes ? Number(cookTimeMinutes) : undefined,
      servings: servings ? Number(servings) : undefined,
      isSaStaple,
      ingredients: ingredients
        .filter((ingredient) => ingredient.ingredientName || ingredient.ingredientId)
        .map((ingredient) => ({
          ingredientId: ingredient.ingredientId,
          ingredientName: ingredient.ingredientId ? undefined : ingredient.ingredientName,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          isOptional: ingredient.isOptional,
          notes: ingredient.notes.trim() || undefined,
        })),
    }

    if (isEditMode && id) {
      await updateRecipe(id, data)
    } else {
      await createRecipe(data)
    }
    navigate('/admin/recipes')
  }

  if (isEditMode && isLoading) {
    return <Spinner fullScreen />
  }

  return (
    <div className="recipe-editor-page">
      <h1 className="recipe-editor-title">{isEditMode ? 'Edit Recipe' : 'New Recipe'}</h1>

      <div className="recipe-editor-grid">
        <Input
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={titleError ?? undefined}
          required
        />
        <Select
          label="Cuisine"
          value={cuisine}
          onChange={(event) => setCuisine(event.target.value)}
          options={CUISINE_OPTIONS.map((value) => ({ value, label: value }))}
          placeholder="Select cuisine"
        />
        <Input
          label="Prep Time (minutes)"
          type="number"
          value={prepTimeMinutes}
          onChange={(event) => setPrepTimeMinutes(event.target.value)}
        />
        <Input
          label="Cook Time (minutes)"
          type="number"
          value={cookTimeMinutes}
          onChange={(event) => setCookTimeMinutes(event.target.value)}
        />
        <Input
          label="Servings"
          type="number"
          value={servings}
          onChange={(event) => setServings(event.target.value)}
        />
      </div>

      <Chip selected={isSaStaple} onClick={() => setIsSaStaple((prev) => !prev)}>
        SA Staple
      </Chip>

      <div className="recipe-editor-section">
        <label className="recipe-editor-textarea-label" htmlFor="recipe-description">
          Description
        </label>
        <textarea
          id="recipe-description"
          className="recipe-editor-textarea"
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="recipe-editor-section">
        <label className="recipe-editor-textarea-label" htmlFor="recipe-instructions">
          Instructions (one step per line)
        </label>
        <textarea
          id="recipe-instructions"
          className="recipe-editor-textarea"
          rows={6}
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
        />
      </div>

      <div className="recipe-editor-section">
        <h2 className="recipe-editor-section-title">Ingredients</h2>
        <div className="recipe-editor-ingredients">
          {ingredients.map((ingredient, index) => (
            <RecipeIngredientFormRow
              key={index}
              value={ingredient}
              onChange={(value) => updateIngredient(index, value)}
              onRemove={() => removeIngredient(index)}
            />
          ))}
        </div>
        <Button type="button" variant="secondary" onClick={addIngredient}>
          + Add Ingredient
        </Button>
      </div>

      <div className="recipe-editor-actions">
        <Link to="/admin/recipes">Cancel</Link>
        <Button type="button" onClick={handleSave} isLoading={isSaving}>
          Save Recipe
        </Button>
      </div>
    </div>
  )
}

export default RecipeEditor
