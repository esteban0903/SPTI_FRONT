import { useState } from 'react'
import api from '../services/apiClient.js'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const response = await api.post('/auth/login', { username, password })

      // Normalize response and extract token safely. Backend may return:
      // - a plain string (the JWT)
      // - an object with keys like access_token, accessToken, token, jwt, etc.
      const payload = response && response.data
      let token = null

      if (!payload) {
        token = null
      } else if (typeof payload === 'string') {
        token = payload
      } else if (typeof payload === 'object') {
        // common keys
        token = payload.access_token || payload.accessToken || payload.token || payload.jwt || null
        // nested under data
        if (!token && payload.data && typeof payload.data === 'object') {
          token =
            payload.data.access_token ||
            payload.data.accessToken ||
            payload.data.token ||
            payload.data.jwt ||
            null
        }
        // fallback: look for any string value that looks like a JWT
        if (!token) {
          for (const value of Object.values(payload)) {
            if (typeof value === 'string' && value.split('.').length === 3) {
              token = value
              break
            }
          }
        }
      }

      if (token && typeof token === 'string') {
        localStorage.setItem('token', token)
        alert('Login exitoso')
      } else {
        setError('No se pudo extraer token del servidor. Revisa la respuesta del backend.')
      }
    } catch (e) {
      setError('Credenciales inválidas o servidor no disponible')
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2 style={{ marginTop: 0 }}>Login</h2>
      <div className="grid cols-2">
        <div>
          <label>Usuario</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      <button className="btn primary" style={{ marginTop: 12 }}>
        Ingresar
      </button>
    </form>
  )
}
