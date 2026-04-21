import httpClient from './httpClient'

export const loginWithGoogle = (credential) => {
  return httpClient.post('/auth/google', { credential })
}

export const loginWithEmail = ({ email, password }) => {
  return httpClient.post('/auth/local/login', { email, password })
}

export const signupWithEmail = ({ name, email, password, role }) => {
  return httpClient.post('/auth/local/signup', { name, email, password, role })
}

export const getCurrentUser = () => {
  return httpClient.get('/auth/me')
}