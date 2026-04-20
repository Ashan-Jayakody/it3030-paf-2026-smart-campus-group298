import axios from 'axios'

const BASE = '/api/resources'

export const getAllResources  = ()         => axios.get(BASE)
export const getResourceById  = (id)       => axios.get(`${BASE}/${id}`)
export const createResource   = (data)     => axios.post(BASE, data)
export const updateResource   = (id, data) => axios.put(`${BASE}/${id}`, data)
export const deleteResource   = (id)       => axios.delete(`${BASE}/${id}`)
export const searchResources  = (params)   => axios.get(`${BASE}/search`, { params })
export const getResourceCatalog = ()       => axios.get(`${BASE}/catalog`)