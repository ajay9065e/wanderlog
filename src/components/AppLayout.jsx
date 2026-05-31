import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AppLayout() {
  const { user, logout, bucket, visited } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/explore" className="brand">
          <span className="brand-icon" aria-hidden="true">🌍</span>
          <span>WanderLog</span>
        </Link>

        <nav className="topbar-nav">
          <NavLink to="/explore" className="nav-pill">
            Explore
          </NavLink>
          <span className="stat-chip">🤍 Bucket: {bucket.length}</span>
          <span className="stat-chip">✅ Visited: {visited.length}</span>
        </nav>

        <div className="user-actions">
          <span className="user-email">{user?.email}</span>
          <button className="btn btn-ghost" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
