import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Boxes, BookOpen, Store, Percent, Users } from 'lucide-react'
import { useAppSelector } from '@hooks/redux.hooks'
import './Sidebar.css'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/ingredients', label: 'Catalog', icon: Boxes },
  { to: '/admin/recipes', label: 'Recipes', icon: BookOpen },
  { to: '/admin/retailers', label: 'Retailers', icon: Store },
  { to: '/admin/specials', label: 'Specials', icon: Percent },
  { to: '/admin/users', label: 'Users', icon: Users },
]

/**
 * Sidebar Component
 * Admin navigation menu sidebar
 */
function Sidebar() {
  const { sidebarOpen } = useAppSelector((state) => state.ui)

  if (!sidebarOpen) {
    return null
  }

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
