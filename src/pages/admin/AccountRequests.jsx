import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { UserPlus, CheckCircle, XCircle, Mail, Phone, BookOpen, MessageSquare, Loader2, Menu, X } from 'lucide-react'
import axios from 'axios'

const AccountRequests = () => {
  const [requests, setRequests] = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [approveTarget, setApproveTarget] = useState(null)
  const [approveForm, setApproveForm] = useState({ studentCode: '', batchId: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const { sidebarOpen, setSidebarOpen } = useOutletContext()

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    fetchRequests()
    fetchBatches()
  }, [])

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/account-requests', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRequests(response.data || [])
    } catch (error) {
      console.error('Error fetching account requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/batches', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBatches(response.data || [])
    } catch (error) {
      console.error('Error fetching batches:', error)
    }
  }

  const openApprove = (req) => {
    setApproveTarget(req)
    setApproveForm({
      studentCode: `STD-${String(req.id).padStart(3, '0')}`,
      batchId: '',
      password: ''
    })
    setError('')
  }

  const handleApprove = async () => {
    if (!approveForm.studentCode.trim()) {
      setError('Student ID (code) is required')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      await axios.post(`/api/admin/account-requests/${approveTarget.id}/approve`, {
        studentCode: approveForm.studentCode.trim(),
        batchId: approveForm.batchId || null,
        password: approveForm.password || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setApproveTarget(null)
      showToast(`Account created for ${approveTarget.fullName} — Student ID: ${approveForm.studentCode}`)
      await fetchRequests()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async (req) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(`/api/admin/account-requests/${req.id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast(`Request from ${req.fullName} rejected`, 'error')
      await fetchRequests()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject request', 'error')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Account Requests</h1>
          <p className="text-gray-600">Student account creation requests from the login page. Approve to create the account.</p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
          {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-12 text-center">
          <UserPlus className="w-16 h-16 text-primary-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No pending account requests</p>
          <p className="text-sm text-gray-400 mt-1">New requests from the login page will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div key={req.id} className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-violet-500/20 to-primary-600/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-primary-500 to-violet-600 rounded-xl text-white shadow-md">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{req.fullName}</h3>
                    <p className="text-xs text-gray-500">{req.createdAt ? new Date(req.createdAt).toLocaleString() : ''}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <p className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-primary-500 shrink-0" />
                    <span className="truncate">{req.email}</span>
                  </p>
                  {req.phone && (
                    <p className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-primary-500 shrink-0" /> {req.phone}
                    </p>
                  )}
                  {req.courseInterest && (
                    <p className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="w-4 h-4 text-primary-500 shrink-0" /> {req.courseInterest}
                    </p>
                  )}
                  {req.message && (
                    <p className="flex items-start gap-2 text-gray-600">
                      <MessageSquare className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                      <span>{req.message}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => openApprove(req)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(req)}
                    className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-500/30 hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      {approveTarget && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setApproveTarget(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-primary-100">
              <h3 className="text-lg font-bold text-heading">Approve Account — {approveTarget.fullName}</h3>
              <p className="text-xs text-body-text mt-0.5">{approveTarget.email} • Set the student ID and batch for the new account.</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Student ID / Code *</label>
                <input
                  type="text"
                  value={approveForm.studentCode}
                  onChange={(e) => setApproveForm({ ...approveForm, studentCode: e.target.value })}
                  className="input-field"
                  placeholder="e.g., PENTAGON2024001"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Batch (optional)</label>
                <select
                  value={approveForm.batchId}
                  onChange={(e) => setApproveForm({ ...approveForm, batchId: e.target.value })}
                  className="input-field"
                >
                  <option value="">No batch</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.batchCode}{b.subject ? ` — ${b.subject}` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Initial Password (optional)</label>
                <input
                  type="text"
                  value={approveForm.password}
                  onChange={(e) => setApproveForm({ ...approveForm, password: e.target.value })}
                  className="input-field"
                  placeholder="Defaults to student code"
                />
              </div>
              {error && (
                <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setApproveTarget(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleApprove} disabled={submitting} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[400] animate-in slide-in-from-right fade-in duration-300">
          <div className={`flex items-center gap-3 min-w-[300px] max-w-sm rounded-xl border-l-4 shadow-xl p-4 ${toast.type === 'success' ? 'bg-white border-emerald-500' : 'bg-white border-red-500'}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-50' : 'bg-red-50'}`}>
              {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
            </div>
            <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-gray-800' : 'text-red-700'}`}>{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountRequests
