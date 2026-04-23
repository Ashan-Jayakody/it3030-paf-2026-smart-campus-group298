import httpClient from './httpClient'

const BASE = '/tickets'

export const createTicket = (data) => httpClient.post(BASE, data)
export const getAllTickets = (params) => httpClient.get(BASE, { params })
export const getTicketById = (id) => httpClient.get(`${BASE}/${id}`)
export const updateTicketStatus = (id, status, reason) => 
    httpClient.put(`${BASE}/${id}/status`, null, { params: { status, reason } })
export const assignTechnician = (id, technicianId) => 
    httpClient.put(`${BASE}/${id}/assign`, null, { params: { technicianId } })

// Comment APIs
export const getCommentsByTicket = (ticketId) => httpClient.get(`${BASE}/${ticketId}/comments`)
export const addComment = (ticketId, comment) => httpClient.post(`${BASE}/${ticketId}/comments`, comment)
export const updateComment = (commentId, comment) => httpClient.put(`${BASE}/comments/${commentId}`, comment)
export const deleteComment = (commentId) => httpClient.delete(`${BASE}/comments/${commentId}`)
