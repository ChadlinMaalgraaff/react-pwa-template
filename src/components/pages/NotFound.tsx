import { Link } from 'react-router-dom'

/**
 * NotFound Page (404)
 * Displayed when route is not found
 */
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="btn-primary"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound
