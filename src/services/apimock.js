// apimock.js
// Simple in-memory mock for blueprints service used during development or tests.
// Exports an object with the methods: getAll, getByAuthor, getByAuthorAndName, create
// Each method returns a Promise and simulates a small network delay.

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

const initialData = [
  {
    author: 'alice',
    name: 'house',
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ],
  },
  {
    author: 'bob',
    name: 'tower',
    points: [
      { x: 10, y: 10 },
      { x: 20, y: 40 },
      { x: 60, y: 80 },
    ],
  },
]

// Mutable in-memory store for created/updated blueprints during the session
let store = initialData.map((bp) => ({ ...bp }))

export default {
  // Returns all blueprints (array)
  async getAll() {
    await delay(120)
    // Return a copy to avoid accidental external mutation
    return store.map((bp) => ({ ...bp, points: bp.points.map((p) => ({ ...p })) }))
  },

  // Returns all blueprints for a given author (array)
  async getByAuthor(author) {
    await delay(100)
    return store
      .filter((bp) => bp.author === author)
      .map((bp) => ({ ...bp, points: bp.points.map((p) => ({ ...p })) }))
  },

  // Returns a single blueprint object or null
  async getByAuthorAndName(author, name) {
    await delay(80)
    const found = store.find((bp) => bp.author === author && bp.name === name)
    if (!found) return null
    return { ...found, points: found.points.map((p) => ({ ...p })) }
  },

  // Create a new blueprint. Expects payload: { author, name, points }
  async create(payload) {
    await delay(150)
    const exists = store.some((bp) => bp.author === payload.author && bp.name === payload.name)
    if (exists) {
      const err = new Error('Blueprint already exists')
      err.code = 'ALREADY_EXISTS'
      throw err
    }
    const bp = { author: payload.author, name: payload.name, points: payload.points || [] }
    store.push(bp)
    return { ...bp }
  },

  // Update an existing blueprint
  async update(author, name, payload) {
    await delay(120)
    const index = store.findIndex((bp) => bp.author === author && bp.name === name)
    if (index === -1) {
      const err = new Error('Blueprint not found')
      err.code = 'NOT_FOUND'
      throw err
    }
    // Update the blueprint with new data
    store[index] = { 
      author: payload.author || author, 
      name: payload.name || name, 
      points: payload.points || store[index].points 
    }
    return { ...store[index] }
  },

  // Delete a blueprint
  async delete(author, name) {
    await delay(100)
    const index = store.findIndex((bp) => bp.author === author && bp.name === name)
    if (index === -1) {
      const err = new Error('Blueprint not found')
      err.code = 'NOT_FOUND'
      throw err
    }
    
    // Simulate occasional server failures for optimistic update testing
    if (Math.random() < 0.2) {
      const err = new Error('Server error: could not delete blueprint')
      err.code = 'SERVER_ERROR'
      throw err
    }
    
    const deleted = store.splice(index, 1)[0]
    return { success: true, deleted: { ...deleted } }
  },
}






