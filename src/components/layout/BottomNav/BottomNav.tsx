import { NavLink } from 'react-router-dom'
import { Package, ChefHat, User } from 'lucide-react'
import './BottomNav.css'

interface NavItem {
  to: string
  label: string
  icon: typeof Package
}

const navItems: NavItem[] = [
  { to: '/pantry', label: 'Pantry', icon: Package },
  { to: '/recipes', label: 'Recipes', icon: ChefHat },
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
          <span className="bottom-nav-pip" />
          <Icon className="h-[23px] w-[23px]" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
