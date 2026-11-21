import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { BookOpen, FileText, Clock, CheckCircle, XCircle, Menu, X } from 'lucide-react'
import axios from 'axios'

const TrainerNotesDashboard = () => {
  const [stats, setStats] = useState({
    totalNotes: 0,
    activeNotes: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  })
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/trainer/notes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const notes = response.data
      setStats({
        totalNotes: notes.length,
        activeNotes: notes.filter(n => n.status === 'ACTIVE').length,
        pendingRequests: 0, // Will be fetched from requests endpoint
        approvedRequests: 0,
        rejectedRequests: 0
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Notes Dashboard</h1>
          <p className="text-gray-600">Manage your study materials and student requests.</p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
          {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Total Notes</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalNotes}</p>
            <p className="text-sm text-gray-600 mt-1">{stats.activeNotes} Active</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Pending Requests</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Approved</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.approvedRequests}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Rejected</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.rejectedRequests}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => window.location.href = '/trainer/notes/upload'}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
        >
          <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
          <div className="relative flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-xl">
              <FileText className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold mb-1">Upload Notes</h3>
              <p className="text-white/80 text-sm">Add new study materials</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => window.location.href = '/trainer/notes/my-notes'}
          className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-200 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
        >
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="p-4 bg-primary-100 rounded-xl">
              <BookOpen className="w-8 h-8 text-primary-600" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-900 mb-1">My Notes</h3>
              <p className="text-gray-600 text-sm">View uploaded materials</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => window.location.href = '/trainer/notes/requests'}
          className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-200 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
        >
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="p-4 bg-primary-100 rounded-xl">
              <Clock className="w-8 h-8 text-primary-600" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Requests</h3>
              <p className="text-gray-600 text-sm">Manage access requests</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

export default TrainerNotesDashboard
