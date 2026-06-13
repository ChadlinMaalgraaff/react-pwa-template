import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from '../BottomNav/BottomNav'
import { getScreenTitle } from './screenTitles'
import './CustomerShell.css'

const CustomerShell = () => {
  const { pathname } = useLocation()
  const title = getScreenTitle(pathname)

  return (
    <div className="customer-shell">
      <header className="customer-shell-header">
        <h1 className="customer-shell-title">{title}</h1>
      </header>
      <main className="customer-shell-main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

export default CustomerShell
