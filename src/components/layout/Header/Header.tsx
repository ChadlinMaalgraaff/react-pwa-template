import { useAppDispatch, useAppSelector } from '@hooks/redux.hooks'
import { setSidebarOpen } from '@store/slices/ui.slice'
import { logout } from '@store/slices/auth.slice'
import './Header.css'

/**
 * Header Component
 * Top navigation bar with branding and user menu
 */
function Header() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { sidebarOpen } = useAppSelector((state) => state.ui)

  const handleToggleSidebar = () => {
    dispatch(setSidebarOpen(!sidebarOpen))
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <button
            onClick={handleToggleSidebar}
            className="sidebar-toggle-button"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">PantryPal</h1>
        </div>

        <div className="header-right">
          {user && (
            <>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
