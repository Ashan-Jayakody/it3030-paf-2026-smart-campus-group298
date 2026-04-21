import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'

const NAV_ITEMS = [
  { label: 'Resources', path: '/resources' },
  { label: 'Bookings', path: '/bookings' },
  { label: 'Tickets', path: '/tickets' },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAdmin, isManager, isTechnician, logout } = useAuth()

  const roleLabel = isAdmin
    ? 'ADMIN'
    : isManager
      ? 'MANAGER'
      : isTechnician
        ? 'TECHNICIAN'
        : 'USER'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="bg-linear-to-r from-slate-900 to-slate-800 px-8 h-16 flex items-center justify-between shadow-lg sticky top-0 z-50">
      <Link to="/resources" className="flex items-center gap-3 no-underline">
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
          S
        </div>
        <span className="text-white text-xl font-bold tracking-tight">Smart Campus</span>
      </Link>

      <div className="flex items-center gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
              >
                {item.label}
              </button>
            </Link>
          )
        })}

        {user ? (
          <div className="flex items-center gap-3 ml-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-white text-sm font-semibold">{user.name}</span>
              <span className="text-slate-400 text-xs">{roleLabel}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none' }} className="ml-3">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-all">
              Login
            </button>
          </Link>
        )}
      </div>
    </nav>
  )
}