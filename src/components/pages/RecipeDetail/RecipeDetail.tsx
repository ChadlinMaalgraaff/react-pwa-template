import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, UtensilsCrossed } from 'lucide-react'
import { Button, BottomSheet, Badge, EmptyState, Spinner } from '@components/shared'
import { RecipeIngredientRow, CostBreakdownPanel, PhotoCredit, SourceCredit } from '@components/recipes'
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

  const missingIngredients = recipe?.ingredients.filter((i) => !i.inPantry) ?? []
  const hasMissing = missingIngredients.length > 0
  const missingCount = missingIngredients.length
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
      if (next.has(ingredientId)) next.delete(ingredientId)
      else next.add(ingredientId)
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

  if (isLoading) return <Spinner fullScreen />
  if (!recipe) return <EmptyState title="Recipe not found" />

  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0)

  return (
    <div className="recipe-detail-page">
      <div className="recipe-detail-hero">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} className="recipe-detail-hero-img" />
        ) : (
          <UtensilsCrossed className="h-24 w-24 text-accent opacity-40" strokeWidth={1.2} />
        )}
        <button
          type="button"
          aria-label="Back"
          className="recipe-detail-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {hasMissing && (
          <span className="recipe-detail-hero-ribbon">
            <Badge variant="accent">Missing {missingCount}</Badge>
          </span>
        )}
      </div>

      <PhotoCredit
        imageAuthor={recipe.imageAuthor}
        imageLicense={recipe.imageLicense}
        imageSourceUrl={recipe.imageSourceUrl}
      />

      <div className="recipe-detail-body">
        <h1 className="recipe-detail-title">{recipe.title}</h1>
        <div className="recipe-detail-meta">
          {recipe.cuisine && <span>{recipe.cuisine}</span>}
          {recipe.cuisine && (totalTime > 0 || recipe.servings != null) && (
            <span className="recipe-detail-meta-dot" />
          )}
          {totalTime > 0 && <span>{totalTime} min</span>}
          {totalTime > 0 && recipe.servings != null && <span className="recipe-detail-meta-dot" />}
          {recipe.servings != null && <span>Serves {recipe.servings}</span>}
        </div>

        <section className="recipe-detail-section">
          <p className="recipe-detail-eyebrow">Ingredients</p>
          <div>
            {recipe.ingredients.map((ingredient) => (
              <RecipeIngredientRow key={ingredient.ingredientId} ingredient={ingredient} />
            ))}
          </div>
        </section>

        {hasMissing && cost && <CostBreakdownPanel cost={cost} defaultOpen />}

        <section className="recipe-detail-section">
          <p className="recipe-detail-eyebrow">Method</p>
          {recipe.instructions.map((step, index) => (
            <div key={index} className="recipe-detail-step">
              <span className="recipe-detail-step-n">{index + 1}</span>
              <p className="recipe-detail-step-text">{step}</p>
            </div>
          ))}
        </section>

        {inPantryIngredients.length > 0 && (
          <Button variant="secondary" onClick={openMadeSheet} className="w-full">
            I made this
          </Button>
        )}

        <SourceCredit
          sourceName={recipe.sourceName}
          sourceUrl={recipe.sourceUrl}
          sourceLicense={recipe.sourceLicense}
        />
      </div>


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
          <Button onClick={handleMadeConfirm} isLoading={isRemoving} disabled={selectedIngredientIds.size === 0} className="w-full">
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
