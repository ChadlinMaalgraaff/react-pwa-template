import { Link } from 'react-router-dom'
import { useAppSelector } from '@hooks/redux.hooks'
import './Sidebar.css'

/**
 * Sidebar Component
 * Navigation menu sidebar
 */
function Sidebar() {
  const { sidebarOpen } = useAppSelector((state) => state.ui)

  if (!sidebarOpen) {
    return null
  }

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <Link
          to="/"
          className="sidebar-link"
        >
          Dashboard
        </Link>
        <Link
          to="/settings"
          className="sidebar-link"
        >
          Settings
        </Link>
        <Link
          to="/components"
          className="sidebar-link"
        >
          Components
        </Link>
      </nav>
    </aside>
  )
}

export default Sidebar
