import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, BottomSheet, Input, EmptyState, Spinner } from '@components/shared'
import { ShoppingListSummaryCard } from '@components/shopping-lists'
import { useShoppingLists } from '@hooks/useShoppingLists'
import './ShoppingLists.css'

const ShoppingLists = () => {
  const navigate = useNavigate()
  const { lists, isLoading, createList, deleteList } = useShoppingLists()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const closeCreateSheet = () => {
    setIsCreateOpen(false)
    setName('')
  }

  const handleCreate = async () => {
    setIsSaving(true)
    try {
      const created = await createList(name ? { name } : {})
      closeCreateSheet()
      navigate(`/shopping-lists/${created.id}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="shopping-lists-page">
      <div className="shopping-lists-actions">
        <button type="button" aria-label="New list" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {isLoading ? (
        <Spinner fullScreen />
      ) : lists.length === 0 ? (
        <EmptyState
          title="No shopping lists yet"
          actionLabel="Create one"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="shopping-lists-list">
          {lists.map((list) => (
            <ShoppingListSummaryCard
              key={list.id}
              list={list}
              onClick={() => navigate(`/shopping-lists/${list.id}`)}
              onDelete={(id) => deleteList(id)}
            />
          ))}
        </div>
      )}

      <BottomSheet isOpen={isCreateOpen} onClose={closeCreateSheet} title="New list">
        <div className="shopping-lists-form">
          <Input
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Weekly Groceries"
          />
          <Button type="button" onClick={handleCreate} isLoading={isSaving} className="w-full">
            Create
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}

export default ShoppingLists
