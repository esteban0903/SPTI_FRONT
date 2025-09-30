import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children }) {
  // Minimal auth check: token in localStorage
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return <Navigate to="/login" replace />
  return children
}
