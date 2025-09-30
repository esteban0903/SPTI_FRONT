// apiClientWrapper.js
// Wrapper around the axios instance exported from apiClient.js.
// Exposes the same interface as apimock (getAll, getByAuthor, getByAuthorAndName, create)

import api from './apiClient.js'

export default {
  async getAll() {
    const res = await api.get('/api/v1/blueprints')
    return res.data.data || res.data
  },

  async getByAuthor(author) {
    const res = await api.get(`/api/v1/blueprints/${encodeURIComponent(author)}`)
    return res.data.data || res.data
  },

  async getByAuthorAndName(author, name) {
    const res = await api.get(
      `/api/v1/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`,
    )
    return res.data.data || res.data
  },

  async create(payload) {
    const res = await api.post('/api/v1/blueprints', payload)
    return res.data.data || res.data
  },
  async update(author, name, payload) {
    const res = await api.put(`/api/v1/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`, payload)
    return res.data.data || res.data
  },
  async remove(author, name) {
    const res = await api.delete(`/api/v1/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`)
    return res.data.data || res.data
  },
}

