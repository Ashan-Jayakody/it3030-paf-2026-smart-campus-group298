import axios from 'axios'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api',
})

const PUBLIC_AUTH_PATHS = [
  '/auth/local/signup',
  '/auth/local/login',
  '/auth/google',
]

const normalizePath = (url = '') => {
  const withoutOrigin = url.replace(/^https?:\/\/[^/]+/i, '')
  const [pathOnly] = withoutOrigin.split('?')
  return pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`
}

const isPublicAuthRequest = (url = '') => {
  const path = normalizePath(url)
  return PUBLIC_AUTH_PATHS.some((publicPath) => path.endsWith(publicPath))
}

const removeAuthorizationHeader = (headers) => {
  if (!headers) {
    return
  }

  if (typeof headers.delete === 'function') {
    headers.delete('Authorization')
    headers.delete('authorization')
    return
  }

  delete headers.Authorization
  delete headers.authorization
}

httpClient.interceptors.request.use((config) => {
  if (isPublicAuthRequest(config.url || '')) {
    removeAuthorizationHeader(config.headers)
    return config
  }

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