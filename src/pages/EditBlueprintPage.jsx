import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchBlueprint, updateBlueprint } from '../features/blueprints/blueprintsSlice.js'
import BlueprintForm from '../components/BlueprintForm.jsx'

export default function EditBlueprintPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { author, name } = useParams()
  
  const current = useSelector((s) => s.blueprints.current)
  const loading = useSelector((s) => s.blueprints.loading)
  const errors = useSelector((s) => s.blueprints.errors)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (author && name) {
      dispatch(fetchBlueprint({ author, name }))
    }
  }, [dispatch, author, name])

  const handleSubmit = async (blueprintData) => {
    try {
      setSuccess(false)
      // Use updateBlueprint thunk with original and new data
      const result = await dispatch(updateBlueprint({
        originalAuthor: author,
        originalName: name,
        blueprint: blueprintData
      }))
      
      if (updateBlueprint.fulfilled.match(result)) {
        setSuccess(true)
        // Redirect to blueprints page after 2 seconds
        setTimeout(() => {
          navigate('/')
        }, 2000)
      }
    } catch (err) {
      console.error('Error updating blueprint:', err)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  if (loading.current) {
    return (
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <p>Loading blueprint for editing...</p>
        </div>
      </div>
    )
  }

  if (errors.current) {
    return (
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Error Loading Blueprint</h2>
          <p style={{ color: '#f87171' }}>Error: {errors.current}</p>
          <button className="btn" onClick={() => navigate('/')}>
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Blueprint Not Found</h2>
          <p>The blueprint "{name}" by "{author}" could not be found.</p>
          <button className="btn" onClick={() => navigate('/')}>
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Edit Blueprint</h2>
        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
          Editing: <strong>{current.name}</strong> by <strong>{current.author}</strong>
        </p>
        
        {loading.update && (
          <div style={{ padding: '12px', backgroundColor: '#1e293b', borderRadius: '6px', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: '#94a3b8' }}>Updating blueprint...</p>
          </div>
        )}
        
        {errors.update && (
          <div style={{ padding: '12px', backgroundColor: '#7f1d1d', borderRadius: '6px', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: '#f87171' }}>Error: {errors.update}</p>
          </div>
        )}
        
        {success && (
          <div style={{ padding: '12px', backgroundColor: '#14532d', borderRadius: '6px', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: '#4ade80' }}>
              ✅ Blueprint updated successfully! Redirecting to blueprints...
            </p>
          </div>
        )}
        
        <EditableBlueprintForm 
          initialData={current} 
          onSubmit={handleSubmit} 
        />
        
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button 
            type="button" 
            className="btn" 
            onClick={handleCancel}
            disabled={loading.update}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// Form component pre-filled with existing data
function EditableBlueprintForm({ initialData, onSubmit }) {
  const [author, setAuthor] = useState(initialData?.author || '')
  const [name, setName] = useState(initialData?.name || '')
  const [pointsJSON, setPointsJSON] = useState(
    JSON.stringify(initialData?.points || [], null, 2)
  )

  const handle = (e) => {
    e.preventDefault()
    try {
      const points = JSON.parse(pointsJSON)
      onSubmit({ author, name, points })
    } catch (e) {
      alert('JSON de puntos inválido')
    }
  }

  return (
    <form onSubmit={handle} className="blueprint-form">
      <div className="grid cols-2">
        <div>
          <label htmlFor="author">Author</label>
          <input
            id="author"
            className="input"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="juan.perez"
            required
          />
        </div>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mi-dibujo"
            required
          />
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <label htmlFor="points">Points (JSON)</label>
        <textarea
          id="points"
          className="input"
          rows="8"
          value={pointsJSON}
          onChange={(e) => setPointsJSON(e.target.value)}
          placeholder='[{"x":10,"y":10},{"x":40,"y":60}]'
          required
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <button type="submit" className="btn primary">
          Update Blueprint
        </button>
      </div>
    </form>
  )
}