import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createBlueprint } from '../features/blueprints/blueprintsSlice.js'
import BlueprintForm from '../components/BlueprintForm.jsx'

export default function CreateBlueprintPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading = useSelector((s) => s.blueprints.loading.create)
  const error = useSelector((s) => s.blueprints.errors.create)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (blueprintData) => {
    try {
      setSuccess(false)
      const result = await dispatch(createBlueprint(blueprintData))
      
      if (createBlueprint.fulfilled.match(result)) {
        setSuccess(true)
        // Show success message for 2 seconds, then redirect
        setTimeout(() => {
          navigate('/')
        }, 2000)
      }
    } catch (err) {
      console.error('Error creating blueprint:', err)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Create New Blueprint</h2>
        
        {error && (
          <div style={{ padding: '12px', backgroundColor: '#7f1d1d', borderRadius: '6px', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: '#f87171' }}>Error: {error}</p>
          </div>
        )}
        
        {success && (
          <div style={{ padding: '12px', backgroundColor: '#14532d', borderRadius: '6px', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: '#4ade80' }}>
              ✅ Blueprint created successfully! Redirecting to blueprints page...
            </p>
          </div>
        )}
        
        <BlueprintForm onSubmit={handleSubmit} />
        
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button 
            type="button" 
            className="btn" 
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
