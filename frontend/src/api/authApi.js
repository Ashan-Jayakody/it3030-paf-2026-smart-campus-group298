import httpClient from './httpClient'

export const loginWithFirebase = (credential) => {
  return httpClient.post('/auth/google', { idToken: credential })
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