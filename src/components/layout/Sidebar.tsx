import { Link } from 'react-router-dom'
import { useAppSelector } from '@hooks/redux.hooks'

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
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="p-4 space-y-2">
        <Link
          to="/"
          className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          to="/settings"
          className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Settings
        </Link>
        <Link
          to="/components"
          className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Components
        </Link>
      </nav>
    </aside>
  )
}

export default Sidebar
