import { Outlet } from 'react-router-dom'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import './Layout.css'

/**
 * Main Layout Component
 * Provides the overall application layout with header and sidebar
 */
function Layout() {
  return (
    <div className="layout-container">
      <Header />
      <div className="layout-content-wrapper">
        <Sidebar />
        <main className="layout-main">
          <div className="layout-main-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
