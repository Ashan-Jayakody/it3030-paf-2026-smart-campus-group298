import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Resources',  path: '/resources' },
  { label: 'Bookings',   path: '/bookings'  },
  { label: 'Tickets',    path: '/tickets'   },
  { label: 'Login',      path: '/login'     },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 h-16 flex items-center justify-between shadow-lg sticky top-0 z-50">
      <Link to="/resources" className="flex items-center gap-3 no-underline">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
          S
        </div>
        <span className="text-white text-xl font-bold tracking-tight">Smart Campus</span>
      </Link>

      <div className="flex gap-2">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
                }`}>
                {item.label}
              </button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}