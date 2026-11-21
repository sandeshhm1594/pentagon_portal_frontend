import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GraduationCap, User, Lock, Eye, EyeOff, AlertCircle, Loader2, UserPlus, Send, X } from 'lucide-react'
import axios from 'axios'
import loginImage from '../Login.avif'

const fontStack = "Aptos, 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif"

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestForm, setRequestForm] = useState({ fullName: '', email: '', phone: '', courseInterest: '', message: '' })
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [requestSuccess, setRequestSuccess] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(username, password)

      if (result.success) {
        sessionStorage.setItem('pentagon_login_success', localStorage.getItem('role') || '')
        const role = localStorage.getItem('role')
        if (role === 'ADMIN') {
          navigate('/admin')
        } else if (role === 'TRAINER') {
          navigate('/trainer')
        } else if (role === 'STUDENT') {
          navigate('/student')
        } else if (role === 'PLACEMENT_HEAD' || role === 'PLACEMENT_COORDINATOR') {
          navigate('/placement')
        }
      } else {
        setError(result.error)
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'input-field pl-10'

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-12" style={{ fontFamily: fontStack }}>
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${loginImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/70 to-white/85" />
      </div>
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary-400/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" aria-hidden="true" />

      <div className="relative w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-primary-200 bg-white/85 p-8 shadow-[0_45px_100px_-35px_rgba(53,6,62,0.6)] backdrop-blur-xl sm:p-10">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary-600 via-secondary to-primary-400" aria-hidden="true" />
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-xl">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">Welcome Back</span>
              <p className="text-sm text-gray-700">Sign in to continue to Pentagon Portal</p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border-2 border-danger/20 bg-danger-50 px-4 py-3 text-sm text-danger shadow-sm"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-semibold text-gray-900">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-secondary opacity-0 transition-opacity group-focus-within:opacity-100 blur-sm" />
                <div className="relative flex items-center rounded-xl bg-white shadow-sm transition-shadow group-focus-within:shadow-md">
                  <div className="pl-4">
                    <User className="h-5 w-5 text-primary transition-colors group-focus-within:text-secondary" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-900">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-secondary opacity-0 transition-opacity group-focus-within:opacity-100 blur-sm" />
                <div className="relative flex items-center rounded-xl bg-white shadow-sm transition-shadow group-focus-within:shadow-md">
                  <div className="pl-4">
                    <Lock className="h-5 w-5 text-primary transition-colors group-focus-within:text-secondary" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="pr-4 text-gray-700 transition hover:text-primary focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {loading ? 'Signing in...' : 'Sign in'}
              </div>
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white px-5 py-4 shadow-sm text-center">
            <p className="text-sm text-gray-700 mb-3">
              <span className="font-semibold text-gray-900">New student?</span> Request an account — the admin will review and activate it.
            </p>
            <button
              type="button"
              onClick={() => { setShowRequestModal(true); setRequestError(''); setRequestSuccess(false) }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/30 hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              <UserPlus className="h-4 w-4" />
              Request Account
            </button>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Pentagon Space. All rights reserved.
        </p>
      </div>

      {/* Request Account Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowRequestModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-heading">Request Account</h3>
                  <p className="text-xs text-body-text">Fill the form — admin will approve and share your student ID.</p>
                </div>
              </div>
              <button onClick={() => setShowRequestModal(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {requestSuccess ? (
              <div className="px-6 py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-7 h-7 text-emerald-500" />
                </div>
                <h4 className="text-lg font-bold text-heading mb-2">Request Submitted</h4>
                <p className="text-sm text-body-text mb-6">Your account request is pending admin approval. You'll be able to sign in once it's approved.</p>
                <button onClick={() => setShowRequestModal(false)} className="btn-primary">Close</button>
              </div>
            ) : (
              <form
                className="px-6 py-5 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault()
                  setRequestLoading(true)
                  setRequestError('')
                  try {
                    await axios.post('/api/public/account-requests', requestForm)
                    setRequestSuccess(true)
                  } catch (err) {
                    setRequestError(err.response?.data?.message || 'Failed to submit request. Please try again.')
                  } finally {
                    setRequestLoading(false)
                  }
                }}
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Full Name *</label>
                  <input type="text" required value={requestForm.fullName} onChange={(e) => setRequestForm({ ...requestForm, fullName: e.target.value })} className="input-field" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email *</label>
                  <input type="email" required value={requestForm.email} onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })} className="input-field" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Phone</label>
                  <input type="tel" value={requestForm.phone} onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })} className="input-field" placeholder="Contact number" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Course / Program Interested In</label>
                  <input type="text" value={requestForm.courseInterest} onChange={(e) => setRequestForm({ ...requestForm, courseInterest: e.target.value })} className="input-field" placeholder="e.g., Java Full Stack, Python" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Message (optional)</label>
                  <textarea rows={3} value={requestForm.message} onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })} className="input-field" placeholder="Anything the admin should know..." />
                </div>
                {requestError && (
                  <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{requestError}</p>
                )}
                <button type="submit" disabled={requestLoading} className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {requestLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  {requestLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Login