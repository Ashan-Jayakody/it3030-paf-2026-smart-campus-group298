import httpClient from './httpClient'

const BASE = '/resources'

export const getAllResources = () => httpClient.get(BASE)
export const getResourceById = (id) => httpClient.get(`${BASE}/${id}`)
export const createResource = (data) => httpClient.post(BASE, data)
export const updateResource = (id, data) => httpClient.put(`${BASE}/${id}`, data)
export const deleteResource = (id) => httpClient.delete(`${BASE}/${id}`)
export const searchResources = (params) => httpClient.get(`${BASE}/search`, { params })
export const getResourceCatalog = () => httpClient.get(`${BASE}/catalog`)