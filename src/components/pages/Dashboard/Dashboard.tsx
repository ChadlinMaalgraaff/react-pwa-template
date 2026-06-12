import './Dashboard.css'

/**
 * Dashboard Page
 * Main dashboard component
 */
function Dashboard() {
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Welcome to Dashboard</h2>
      
      <div className="dashboard-grid">
        <div className="dashboard-stat-card">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Users</h3>
          <p className="dashboard-stat-value text-blue-600">1,234</p>
        </div>
        
        <div className="dashboard-stat-card">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Sessions</h3>
          <p className="dashboard-stat-value text-green-600">456</p>
        </div>
        
        <div className="dashboard-stat-card">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance</h3>
          <p className="dashboard-stat-value text-purple-600">98%</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <p className="text-gray-600">• User registration spike detected</p>
          <p className="text-gray-600">• System performance optimal</p>
          <p className="text-gray-600">• All services running smoothly</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
