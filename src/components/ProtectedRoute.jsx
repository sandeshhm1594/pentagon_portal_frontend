import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />
    } else if (user.role === 'PLACEMENT_HEAD' || user.role === 'PLACEMENT_COORDINATOR') {
      return <Navigate to="/placement" replace />
    } else if (user.role === 'TRAINER') {
      return <Navigate to="/trainer" replace />
    } else if (user.role === 'STUDENT') {
      return <Navigate to="/student" replace />
    }
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
