import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAuthors,
  fetchByAuthor,
  fetchBlueprint,
} from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'
import { useNavigate } from 'react-router-dom'
import { deleteBlueprint } from '../features/blueprints/blueprintsSlice.js'

export default function BlueprintsPage() {
  const dispatch = useDispatch()
  const { byAuthor, current, status } = useSelector((s) => s.blueprints)
  const loading = useSelector((s) => s.blueprints.loading)
  const errors = useSelector((s) => s.blueprints.errors)
  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const items = byAuthor[selectedAuthor] || []

  // ...existing code...

  useEffect(() => {
    dispatch(fetchAuthors())
  }, [dispatch])

  const totalPoints = useMemo(
    () => items.reduce((acc, bp) => acc + (bp.points?.length || 0), 0),
    [items],
  )

  const getBlueprints = () => {
    if (!authorInput) return
    setSelectedAuthor(authorInput)
    dispatch(fetchByAuthor(authorInput))
  }

  const openBlueprint = (bp) => {
    // prefer navigation to protected detail route
    navigate(`/blueprints/${encodeURIComponent(bp.author)}/${encodeURIComponent(bp.name)}`)
  }

  const navigate = useNavigate()
  const handleDeleteRow = (bp) => {
    if (!confirm('Eliminar este blueprint?')) return
    dispatch(deleteBlueprint({ author: bp.author, name: bp.name }))
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.1fr 1.4fr', gap: 24 }}>
      <section className="grid" style={{ gap: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Blueprints</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              className="input"
              placeholder="Author"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
            />
            <button className="btn primary" onClick={getBlueprints}>
              Get blueprints
            </button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>
            {selectedAuthor ? `${selectedAuthor}'s blueprints:` : 'Results'}
          </h3>
          {loading.byAuthor && <p>Cargando planos del autor...</p>}
          {errors.byAuthor && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ color: '#f87171' }}>Error: {errors.byAuthor}</p>
              <button className="btn small" onClick={() => getBlueprints()}>
                Reintentar
              </button>
            </div>
          )}
          {!items.length && status !== 'loading' && <p>Sin resultados.</p>}
          {!!items.length && (
            <div style={{ overflowX: 'auto' }}>
              <div className="table-wrapper">
                <table className="blueprints">
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '8px',
                        borderBottom: '1px solid #334155',
                      }}
                    >
                      Blueprint name
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '8px',
                        borderBottom: '1px solid #334155',
                      }}
                    >
                      Number of points
                    </th>
                    <th style={{ padding: '8px', borderBottom: '1px solid #334155' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((bp) => (
                    <tr key={bp.name}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>
                        {bp.name}
                      </td>
                      <td
                        style={{
                          padding: '8px',
                          textAlign: 'right',
                          borderBottom: '1px solid #1f2937',
                        }}
                      >
                        {bp.points?.length || 0}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button className="btn" onClick={() => openBlueprint(bp)}>
                            Open
                          </button>
                          <button className="btn" onClick={() => handleDeleteRow(bp)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>
          )}
          <p style={{ marginTop: 12, fontWeight: 700 }}>Total user points: {totalPoints}</p>
        </div>
      </section>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Current blueprint: {current?.name || '—'}</h3>
        {loading.current && <p>Cargando blueprint...</p>}
        {errors.current && (
          <div style={{ marginBottom: 8 }}>
            <p style={{ color: '#f87171' }}>Error: {errors.current}</p>
            <button
              className="btn small"
              onClick={() => {
                if (current?.author && current?.name) dispatch(fetchBlueprint({ author: current.author, name: current.name }))
              }}
            >
              Reintentar
            </button>
          </div>
        )}
        <div className="blueprint-container">
          <BlueprintCanvas points={current?.points || []} />
        </div>
      </section>
    </div>
  )
}
