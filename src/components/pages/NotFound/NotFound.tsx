import { Link } from 'react-router-dom'
import './NotFound.css'

/**
 * NotFound Page (404)
 * Displayed when route is not found
 */
function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">
          Page Not Found
        </h2>
        <p className="notfound-message">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="notfound-link"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound
