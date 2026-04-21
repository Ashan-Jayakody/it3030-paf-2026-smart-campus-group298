import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loginWithEmail, loginWithGoogle, signupWithEmail } from '../api/authApi'
import { useAuth } from '../auth/useAuth'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_SCRIPT_ID = 'google-signin-client'

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Google script failed')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google script failed'))
    document.body.appendChild(script)
  })
}

export default function LoginPage() {
  const buttonRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login } = useAuth()
  const [googleMessage, setGoogleMessage] = useState('')
  const [localMessage, setLocalMessage] = useState('')
  const [localMode, setLocalMode] = useState('signup')
  const [localForm, setLocalForm] = useState({ name: '', email: '', password: '', role: 'USER' })

  const from = location.state?.from?.pathname || '/resources'

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, from, navigate])

  useEffect(() => {
    let cancelled = false

    const renderButton = async () => {
      if (!GOOGLE_CLIENT_ID) {
        setGoogleMessage('Missing VITE_GOOGLE_CLIENT_ID in frontend/.env. Create the file and add your Google OAuth client ID.')
        return
      }

      try {
        await loadGoogleScript()
        if (cancelled || !buttonRef.current) return

        buttonRef.current.innerHTML = ''

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              setGoogleMessage('')
              const { data } = await loginWithGoogle(response.credential)
              login(data)
              navigate(from, { replace: true })
            } catch {
              setGoogleMessage('Google login failed. Check the client ID and backend settings.')
            }
          },
        })

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          width: 320,
        })
      } catch {
        setGoogleMessage('Unable to load Google Sign-In.')
      }
    }

    renderButton()

    return () => {
      cancelled = true
    }
  }, [from, login, navigate])

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
      setLocalMessage(error.response?.data || 'Email sign-in failed. Please check your details.')
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
            <div className="mt-4" ref={buttonRef} />
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