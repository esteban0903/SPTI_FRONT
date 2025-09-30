import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children }) {
  // Allow access in mock mode for development convenience
  const raw = import.meta.env.VITE_USE_MOCK
  const useMock = raw === 'true' || raw === true || raw === undefined
  if (useMock) return children

  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}
