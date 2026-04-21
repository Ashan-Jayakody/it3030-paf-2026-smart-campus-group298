import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'

export default function RequireAuth({ children }) {
  const location = useLocation()
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-slate-500">
        Checking session...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}