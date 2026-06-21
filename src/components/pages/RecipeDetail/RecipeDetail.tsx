import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, BottomSheet, EmptyState, Spinner } from '@components/shared'
import { RecipeIngredientRow, CostBreakdownPanel } from '@components/recipes'
import { ShoppingListSummaryCard } from '@components/shopping-lists'
import { useRecipeDetail } from '@hooks/useRecipeDetail'
import { useRecipeCost } from '@hooks/useRecipeCost'
import { useShoppingLists } from '@hooks/useShoppingLists'
import { usePantry } from '@hooks/usePantry'
import { useAppDispatch, useAppSelector } from '@hooks/redux.hooks'
import { selectUser } from '@store/selectors/auth.selectors'
import { setNotification } from '@store/slices/ui.slice'
import shoppingListsService from '@/services/shopping-lists.service'
import { getErrorMessage } from '@utils/helpers'
import './RecipeDetail.css'

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const { recipe, isLoading } = useRecipeDetail(id)
  const { cost, fetchCost } = useRecipeCost()
  const { lists } = useShoppingLists()
  const { items: pantryItems, removeItem: removePantryItem } = usePantry()
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isMadeOpen, setIsMadeOpen] = useState(false)
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<Set<string>>(new Set())
  const [isRemoving, setIsRemoving] = useState(false)

  const hasMissing = recipe?.ingredients.some((ingredient) => !ingredient.inPantry) ?? false
  const inPantryIngredients = recipe?.ingredients.filter((i) => i.inPantry) ?? []

  useEffect(() => {
    if (recipe && hasMissing) {
      fetchCost(recipe.id, user?.preferredArea ?? undefined)
    }
  }, [recipe, hasMissing, user?.preferredArea, fetchCost])

  const openMadeSheet = () => {
    setSelectedIngredientIds(new Set(inPantryIngredients.map((i) => i.ingredientId)))
    setIsMadeOpen(true)
  }

  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredientIds((prev) => {
      const next = new Set(prev)
      if (next.has(ingredientId)) {
        next.delete(ingredientId)
      } else {
        next.add(ingredientId)
      }
      return next
    })
  }

  const handleMadeConfirm = async () => {
    if (selectedIngredientIds.size === 0) {
      setIsMadeOpen(false)
      return
    }
    setIsRemoving(true)
    try {
      const toRemove = pantryItems.filter((item) => selectedIngredientIds.has(item.ingredientId))
      await Promise.all(toRemove.map((item) => removePantryItem(item.id)))
      dispatch(setNotification({ message: `${toRemove.length} ingredient${toRemove.length !== 1 ? 's' : ''} removed from your pantry`, type: 'success' }))
      setIsMadeOpen(false)
    } catch (err) {
      dispatch(setNotification({ message: getErrorMessage(err), type: 'error' }))
    } finally {
      setIsRemoving(false)
    }
  }

  const addToList = async (listId: string) => {
    if (!recipe) return
    setIsAdding(true)
    try {
      const result = await shoppingListsService.addRecipeToShoppingList(listId, recipe.id)
      dispatch(setNotification({ message: `${result.addedItems.length} items added to shopping list`, type: 'success' }))
      navigate(`/shopping-lists/${listId}`)
    } catch (err) {
      dispatch(setNotification({ message: getErrorMessage(err), type: 'error' }))
    } finally {
      setIsAdding(false)
      setIsPickerOpen(false)
    }
  }

  const createAndAddList = async () => {
    setIsAdding(true)
    try {
      const created = await shoppingListsService.createShoppingList()
      await addToList(created.id)
    } catch (err) {
      dispatch(setNotification({ message: getErrorMessage(err), type: 'error' }))
      setIsAdding(false)
    }
  }

  const handleAddMissing = () => {
    if (lists.length === 0) {
      createAndAddList()
    } else if (lists.length === 1) {
      addToList(lists[0].id)
    } else {
      setIsPickerOpen(true)
    }
  }

  if (isLoading) {
    return <Spinner fullScreen />
  }

  if (!recipe) {
    return <EmptyState title="Recipe not found" />
  }

  return (
    <div className="recipe-detail-page">
      {recipe.imageUrl && <img src={recipe.imageUrl} alt={recipe.title} className="recipe-detail-hero" />}
      <h1 className="recipe-detail-title">{recipe.title}</h1>
      <div className="recipe-detail-meta">
        {recipe.cuisine && <span>{recipe.cuisine}</span>}
        {recipe.prepTimeMinutes != null && <span>Prep {recipe.prepTimeMinutes} min</span>}
        {recipe.cookTimeMinutes != null && <span>Cook {recipe.cookTimeMinutes} min</span>}
        {recipe.servings != null && <span>{recipe.servings} servings</span>}
      </div>

      <section>
        <h2 className="recipe-detail-section-title">Ingredients</h2>
        {recipe.ingredients.map((ingredient) => (
          <RecipeIngredientRow key={ingredient.ingredientId} ingredient={ingredient} />
        ))}
      </section>

      {hasMissing && cost && <CostBreakdownPanel cost={cost} defaultOpen />}

      <section>
        <h2 className="recipe-detail-section-title">Instructions</h2>
        <ol className="recipe-detail-instructions">
          {recipe.instructions.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </section>

      {inPantryIngredients.length > 0 && (
        <Button variant="secondary" onClick={openMadeSheet} className="w-full">
          I made this
        </Button>
      )}

      {hasMissing && (
        <div className="recipe-detail-sticky-bar">
          <Button onClick={handleAddMissing} isLoading={isAdding} className="w-full">
            Add missing to shopping list
          </Button>
        </div>
      )}

      <BottomSheet isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} title="Choose a shopping list">
        <div className="recipe-detail-picker-list">
          {lists.map((list) => (
            <ShoppingListSummaryCard key={list.id} list={list} onClick={() => addToList(list.id)} />
          ))}
          <Button variant="secondary" onClick={createAndAddList} isLoading={isAdding} className="w-full">
            New list
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={isMadeOpen} onClose={() => setIsMadeOpen(false)} title="Mark as cooked">
        <div className="recipe-detail-made-sheet">
          <p className="recipe-detail-made-message">Remove the ingredients you used from your pantry?</p>
          <div className="recipe-detail-made-list">
            {inPantryIngredients.map((ingredient) => (
              <label key={ingredient.ingredientId} className="recipe-detail-made-row">
                <input
                  type="checkbox"
                  checked={selectedIngredientIds.has(ingredient.ingredientId)}
                  onChange={() => toggleIngredient(ingredient.ingredientId)}
                  className="recipe-detail-made-checkbox"
                />
                <span>{ingredient.name}</span>
              </label>
            ))}
          </div>
          <Button
            onClick={handleMadeConfirm}
            isLoading={isRemoving}
            disabled={selectedIngredientIds.size === 0}
            className="w-full"
          >
            Remove selected
          </Button>
          <Button variant="secondary" onClick={() => setIsMadeOpen(false)} className="w-full">
            Just dismiss
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}

export default RecipeDetail
