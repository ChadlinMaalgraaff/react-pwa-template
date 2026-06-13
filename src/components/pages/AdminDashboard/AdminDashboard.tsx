import { Link } from 'react-router-dom'
import { Card, Spinner } from '@components/shared'
import { useIngredients } from '@hooks/useIngredients'
import { useRecipes } from '@hooks/useRecipes'
import { useSpecials } from '@hooks/useSpecials'
import { useAdminUsers } from '@hooks/useAdminUsers'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const { ingredients, isLoading: ingredientsLoading } = useIngredients()
  const { total: recipesTotal, isLoading: recipesLoading } = useRecipes({ pageSize: 1 })
  const { total: specialsTotal, isLoading: specialsLoading } = useSpecials({ active: true, pageSize: 1 })
  const { total: usersTotal, isLoading: usersLoading } = useAdminUsers({ pageSize: 1 })

  const summaryCards = [
    { label: 'Total Ingredients', count: ingredients.length, isLoading: ingredientsLoading, to: '/admin/ingredients' },
    { label: 'Total Recipes', count: recipesTotal, isLoading: recipesLoading, to: '/admin/recipes' },
    { label: 'Active Specials', count: specialsTotal, isLoading: specialsLoading, to: '/admin/specials' },
    { label: 'Total Users', count: usersTotal, isLoading: usersLoading, to: '/admin/users' },
  ]

  return (
    <div className="admin-dashboard-page">
      <h1 className="admin-dashboard-title">Dashboard</h1>
      <div className="admin-dashboard-grid">
        {summaryCards.map((card) => (
          <Link key={card.label} to={card.to}>
            <Card className="admin-dashboard-card">
              {card.isLoading ? (
                <Spinner />
              ) : (
                <span className="admin-dashboard-count">{card.count}</span>
              )}
              <span className="admin-dashboard-label">{card.label}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard
