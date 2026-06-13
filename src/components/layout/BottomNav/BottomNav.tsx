import { NavLink } from 'react-router-dom'
import { Package, ChefHat, Tag, ListChecks, User } from 'lucide-react'
import './BottomNav.css'

interface NavItem {
  to: string
  label: string
  icon: typeof Package
}

const navItems: NavItem[] = [
  { to: '/pantry', label: 'Pantry', icon: Package },
  { to: '/recipes', label: 'Recipes', icon: ChefHat },
  { to: '/specials', label: 'Specials', icon: Tag },
  { to: '/shopping-lists', label: 'Lists', icon: ListChecks },
  { to: '/profile', label: 'Profile', icon: User },
]

const BottomNav = () => {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `bottom-nav-link ${isActive ? 'bottom-nav-link-active' : ''}`
          }
        >
          <Icon className="h-6 w-6" />
          <span className="text-xs">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
