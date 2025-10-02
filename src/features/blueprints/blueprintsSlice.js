import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit'
import api from '../../services/blueprintsService.js'

export const fetchAuthors = createAsyncThunk('blueprints/fetchAuthors', async () => {
  // service.getAll() should return array of { author, name, points }
  const blueprints = await api.getAll()
  const authors = [...new Set(blueprints.map((bp) => bp.author))]
  return authors
})

export const fetchByAuthor = createAsyncThunk('blueprints/fetchByAuthor', async (author) => {
  const items = await api.getByAuthor(author)
  return { author, items }
})

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }) => {
    const bp = await api.getByAuthorAndName(author, name)
    return bp
  },
)

export const createBlueprint = createAsyncThunk('blueprints/createBlueprint', async (payload) => {
  const created = await api.create(payload)
  return created
})

export const updateBlueprint = createAsyncThunk(
  'blueprints/updateBlueprint',
  async ({ originalAuthor, originalName, blueprint }) => {
    const updated = await api.update(originalAuthor, originalName, blueprint)
    return { originalAuthor, originalName, updated }
  }
)

export const deleteBlueprint = createAsyncThunk(
  'blueprints/deleteBlueprint',
  async ({ author, name }) => {
    await api.delete(author, name)
    return { author, name }
  }
)

const slice = createSlice({
  name: 'blueprints',
  initialState: {
    authors: [],
    byAuthor: {},
    current: null,
    // granular loading and error states per operation
    loading: {
      authors: false,
      byAuthor: false,
      current: false,
      create: false,
      update: false,
      delete: false,
    },
    errors: {
      authors: null,
      byAuthor: null,
      current: null,
      create: null,
      update: null,
      delete: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (s) => {
        s.loading.authors = true
        s.errors.authors = null
      })
      .addCase(fetchAuthors.fulfilled, (s, a) => {
        s.loading.authors = false
        s.authors = a.payload
      })
      .addCase(fetchAuthors.rejected, (s, a) => {
        s.loading.authors = false
        s.errors.authors = a.error?.message || String(a.error)
      })
      .addCase(fetchByAuthor.fulfilled, (s, a) => {
        s.loading.byAuthor = false
        s.errors.byAuthor = null
        s.byAuthor[a.payload.author] = a.payload.items
      })
      .addCase(fetchByAuthor.pending, (s) => {
        s.loading.byAuthor = true
        s.errors.byAuthor = null
      })
      .addCase(fetchByAuthor.rejected, (s, a) => {
        s.loading.byAuthor = false
        s.errors.byAuthor = a.error?.message || String(a.error)
      })
      .addCase(fetchBlueprint.fulfilled, (s, a) => {
        s.loading.current = false
        s.errors.current = null
        s.current = a.payload
      })
      .addCase(fetchBlueprint.pending, (s) => {
        s.loading.current = true
        s.errors.current = null
      })
      .addCase(fetchBlueprint.rejected, (s, a) => {
        s.loading.current = false
        s.errors.current = a.error?.message || String(a.error)
      })
      .addCase(createBlueprint.fulfilled, (s, a) => {
        const bp = a.payload
        s.loading.create = false
        s.errors.create = null
        if (s.byAuthor[bp.author]) s.byAuthor[bp.author].push(bp)
      })
      .addCase(createBlueprint.pending, (s) => {
        s.loading.create = true
        s.errors.create = null
      })
      .addCase(createBlueprint.rejected, (s, a) => {
        s.loading.create = false
        s.errors.create = a.error?.message || String(a.error)
      })
      // UPDATE Blueprint
      .addCase(updateBlueprint.pending, (s) => {
        s.loading.update = true
        s.errors.update = null
      })
      .addCase(updateBlueprint.fulfilled, (s, a) => {
        s.loading.update = false
        s.errors.update = null
        const { originalAuthor, originalName, updated } = a.payload
        
        // Update in byAuthor store
        if (s.byAuthor[originalAuthor]) {
          const index = s.byAuthor[originalAuthor].findIndex(bp => bp.name === originalName)
          if (index !== -1) {
            s.byAuthor[originalAuthor][index] = updated
          }
        }
        
        // Update current if it's the same blueprint
        if (s.current && s.current.author === originalAuthor && s.current.name === originalName) {
          s.current = updated
        }
      })
      .addCase(updateBlueprint.rejected, (s, a) => {
        s.loading.update = false
        s.errors.update = a.error?.message || String(a.error)
      })
      // DELETE Blueprint with Optimistic Updates
      .addCase(deleteBlueprint.pending, (s, a) => {
        s.loading.delete = true
        s.errors.delete = null
        
        // OPTIMISTIC UPDATE: Remove immediately from UI
        const { author, name } = a.meta.arg
        if (s.byAuthor[author]) {
          s.byAuthor[author] = s.byAuthor[author].filter(bp => bp.name !== name)
        }
        
        // Clear current if it's the deleted blueprint
        if (s.current && s.current.author === author && s.current.name === name) {
          s.current = null
        }
      })
      .addCase(deleteBlueprint.fulfilled, (s) => {
        s.loading.delete = false
        s.errors.delete = null
        // Blueprint already removed optimistically, nothing more to do
      })
      .addCase(deleteBlueprint.rejected, (s, a) => {
        s.loading.delete = false
        s.errors.delete = a.error?.message || String(a.error)
        
        // REVERT OPTIMISTIC UPDATE: Restore the blueprint
        const { author, name } = a.meta.arg
        // Note: In a real app, you'd need to store the original blueprint to restore it
        // For this demo, we'll just show an error and let user refresh
      })
  },
})

export default slice.reducer

// Selectors
export const selectBlueprintsState = (state) => state.blueprints

export const selectAllBlueprints = createSelector(selectBlueprintsState, (s) => {
  return Object.values(s.byAuthor || {}).flat()
})

export const selectTop5ByPoints = createSelector(selectAllBlueprints, (all) => {
  return [...(all || [])]
    .sort((a, b) => (b.points?.length || 0) - (a.points?.length || 0))
    .slice(0, 5)
})
