import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchAuthors,
  fetchByAuthor,
  fetchBlueprint,
  selectTop5ByPoints,
} from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'

export default function BlueprintsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { byAuthor, current, status } = useSelector((s) => s.blueprints)
  const loading = useSelector((s) => s.blueprints.loading)
  const errors = useSelector((s) => s.blueprints.errors)
  const top5Blueprints = useSelector(selectTop5ByPoints)
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
    dispatch(fetchBlueprint({ author: bp.author, name: bp.name }))
  }

  const editBlueprint = (bp) => {
    navigate(`/edit/${bp.author}/${bp.name}`)
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
                      <th style={{ padding: '8px', borderBottom: '1px solid #334155' }}>Actions</th>
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
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn small" onClick={() => openBlueprint(bp)}>
                              Open
                            </button>
                            <button 
                              className="btn small secondary" 
                              onClick={() => editBlueprint(bp)}
                            >
                              Edit
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

        <div className="card">
          <h3 style={{ marginTop: 0 }}>🏆 Top 5 Blueprints by Points</h3>
          {top5Blueprints.length === 0 ? (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
              No hay blueprints disponibles. Busca algunos autores para ver el ranking.
            </p>
          ) : (
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
                        Rank
                      </th>
                      <th
                        style={{
                          textAlign: 'left',
                          padding: '8px',
                          borderBottom: '1px solid #334155',
                        }}
                      >
                        Author
                      </th>
                      <th
                        style={{
                          textAlign: 'left',
                          padding: '8px',
                          borderBottom: '1px solid #334155',
                        }}
                      >
                        Blueprint
                      </th>
                      <th
                        style={{
                          textAlign: 'right',
                          padding: '8px',
                          borderBottom: '1px solid #334155',
                        }}
                      >
                        Points
                      </th>
                      <th style={{ padding: '8px', borderBottom: '1px solid #334155' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {top5Blueprints.map((bp, index) => (
                      <tr key={`${bp.author}-${bp.name}`}>
                        <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>
                          <span
                            style={{
                              fontWeight: 'bold',
                              color: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7c0f' : '#6b7280'
                            }}
                          >
                            #{index + 1}
                          </span>
                        </td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>
                          {bp.author}
                        </td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>
                          {bp.name}
                        </td>
                        <td
                          style={{
                            padding: '8px',
                            textAlign: 'right',
                            borderBottom: '1px solid #1f2937',
                            fontWeight: 'bold',
                          }}
                        >
                          {bp.points?.length || 0}
                        </td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>
                          <button className="btn small" onClick={() => openBlueprint(bp)}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
                if (current?.author && current?.name)
                  dispatch(fetchBlueprint({ author: current.author, name: current.name }))
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
