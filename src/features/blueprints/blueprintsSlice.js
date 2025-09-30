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
    },
    errors: {
      authors: null,
      byAuthor: null,
      current: null,
      create: null,
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
