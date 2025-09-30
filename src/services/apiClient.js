import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 8000,
})

api.interceptors.request.use((config) => {
  // Don't attach token for auth endpoints (login) to avoid sending stale/invalid token
  const isAuthRoute = config.url && (config.url.endsWith('/auth/login') || config.url.includes('/auth'))
  const token = localStorage.getItem('token')
  if (token && !isAuthRoute) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use((res) => res, (err) => Promise.reject(err))

export default api
