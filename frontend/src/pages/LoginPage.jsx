import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { loginWithEmail, loginWithFirebase, signupWithEmail } from '../api/authApi'
import { useAuth } from '../auth/useAuth'
import { auth, googleProvider, isFirebaseConfigured } from '../firebase'

function getErrorMessage(error, fallbackMessage) {
  const data = error?.response?.data

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (data && typeof data === 'object' && typeof data.message === 'string' && data.message.trim()) {
    return data.message
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message
  }

  return fallbackMessage
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login } = useAuth()
  const [googleMessage, setGoogleMessage] = useState(
    isFirebaseConfigured
      ? ''
      : 'Missing Firebase config in frontend/.env. Add the VITE_FIREBASE_* values from your Firebase web app settings.'
  )
  const [localMessage, setLocalMessage] = useState('')
  const [localMode, setLocalMode] = useState('signup')
  const [localForm, setLocalForm] = useState({ name: '', email: '', password: '', role: 'USER' })

  const from = location.state?.from?.pathname || '/resources'

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, from, navigate])

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      setGoogleMessage('Firebase is not configured. Add the VITE_FIREBASE_* values in frontend/.env and restart Vite.')
      return
    }

    try {
      setGoogleMessage('')
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      const { data } = await loginWithFirebase(idToken)
      login(data)
      navigate(from, { replace: true })
    } catch (error) {
      setGoogleMessage(getErrorMessage(error, 'Google login via Firebase failed. Check Firebase config and backend Firebase credentials.'))
    }
  }

  const handleLocalChange = (event) => {
    const { name, value } = event.target
    setLocalForm((current) => ({ ...current, [name]: value }))
  }

  const handleLocalSubmit = async (event) => {
    event.preventDefault()
    setLocalMessage('')

    try {
      const payload = localMode === 'signup'
        ? await signupWithEmail(localForm)
        : await loginWithEmail(localForm)

      login(payload.data)
      navigate(from, { replace: true })
    } catch (error) {
      setLocalMessage(getErrorMessage(error, 'Email sign-in failed. Please check your details.'))
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-500">Authentication</p>
        <h1 className="mt-3 text-4xl font-extrabold text-slate-900">Sign in or create an account</h1>
        <p className="mt-3 text-slate-500">
          Use Google if you already have a Google account. If not, create a normal account with email and password. First-time login creates the account automatically for both flows.
        </p>

        <div className="mt-8 flex flex-col gap-8">
          <section className="order-2 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Continue with Google</h2>
                <p className="text-sm text-slate-500">Best for users who already have a Google account.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="mt-4 w-full px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors"
            >
              Continue with Google
            </button>
            {googleMessage && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {googleMessage}
              </div>
            )}
          </section>

          <section className="order-1 rounded-3xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {localMode === 'signup' ? 'Create email account' : 'Sign in with email'}
                </h2>
                <p className="text-sm text-slate-500">
                  {localMode === 'signup'
                    ? 'Use this if you do not have a Google account.'
                    : 'Use this if you already created an email account.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLocalMessage('')
                  setLocalMode((current) => (current === 'signup' ? 'login' : 'signup'))
                  setLocalForm((current) => ({ ...current, role: 'USER' }))
                }}
                className="text-sm font-semibold text-violet-600 hover:text-violet-700"
              >
                {localMode === 'signup' ? 'Already have an account?' : 'Need an account?'}
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleLocalSubmit}>
              {localMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full name</label>
                  <input
                    name="name"
                    value={localForm.name}
                    onChange={handleLocalChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:border-violet-500"
                    placeholder="Your name"
                    required
                  />
                </div>
              )}

              {localMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Register as</label>
                  <select
                    name="role"
                    value={localForm.role}
                    onChange={handleLocalChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:border-violet-500 bg-white"
                    required
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="TECHNICIAN">TECHNICIAN</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  value={localForm.email}
                  onChange={handleLocalChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:border-violet-500"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  value={localForm.password}
                  onChange={handleLocalChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:border-violet-500"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full px-5 py-3 rounded-xl bg-linear-to-r from-violet-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity"
              >
                {localMode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            </form>

            {localMessage && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {localMessage}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}