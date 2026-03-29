import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🏨</span>
            <span className="font-bold text-xl text-brand-600">LuxeStay</span>
          </Link>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-6">
            <Link to="/rooms" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
              Rooms
            </Link>
            {isAuthenticated && (
              <Link to="/my-bookings" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
                My Bookings
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:block">
                  Hi, <strong>{user?.name?.split(' ')[0]}</strong>
                  {user?.role === 'admin' && (
                    <span className="ml-1 badge bg-brand-100 text-brand-700">Admin</span>
                  )}
                </span>
                <button onClick={handleLogout} className="btn-outline text-sm px-4 py-2">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-brand-600 font-medium text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
