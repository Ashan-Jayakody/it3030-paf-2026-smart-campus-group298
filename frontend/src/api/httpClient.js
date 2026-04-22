import axios from 'axios'

const httpClient = axios.create({
  baseURL: '/api',
})

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('smart-campus-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smart-campus-token')
      localStorage.removeItem('smart-campus-user')
    }
    return Promise.reject(error)
  }
)

export default httpClient