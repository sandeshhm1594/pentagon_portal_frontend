import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Menu, X, Building2, Users, Briefcase, TrendingUp, CheckCircle, Clock, AlertCircle, Calendar, Inbox } from 'lucide-react'
import axios from 'axios'
import LoginSuccessToast from '../../components/LoginSuccessToast'

const PlacementDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    eligibleStudents: 0,
    totalDrives: 0,
    activeDrives: 0,
    totalApplications: 0,
    applicationsUnderReview: 0,
    shortlistedStudents: 0,
    selectedStudents: 0,
    rejectedStudents: 0,
    placedStudents: 0,
    totalPositions: 0,
    yetToPlace: 0,
    placementPercentage: 0
  })
  const [loading, setLoading] = useState(true)
  const [updateRequests, setUpdateRequests] = useState([])
  const [requestActionId, setRequestActionId] = useState(null)
  const { sidebarOpen, setSidebarOpen } = useOutletContext()
  const { logout } = useAuth()

  useEffect(() => {
    fetchDashboardStats()
    fetchUpdateRequests()
  }, [])

  const fetchUpdateRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/update-requests', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUpdateRequests(response.data || [])
    } catch (error) {
      console.error('Error fetching update requests:', error)
    }
  }

  const handleRequestStatus = async (id, status) => {
    setRequestActionId(id)
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/admin/update-requests/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchUpdateRequests()
    } catch (error) {
      console.error('Error updating request status:', error)
      alert('Failed to update request status')
    } finally {
      setRequestActionId(null)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/placement-dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
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
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Placement Dashboard</h1>
          <p className="text-gray-600">Overview of placement activities and statistics.</p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
          {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="pd-dash-card p-6">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="pd-dash-icon p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Total Students</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
            <p className="text-sm text-gray-600 mt-1">{stats.eligibleStudents} Eligible</p>
          </div>
        </div>

        <div className="pd-dash-card p-6">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="pd-dash-icon p-3 bg-green-100 rounded-xl">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Placement Drives</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalDrives}</p>
            <p className="text-sm text-gray-600 mt-1">{stats.activeDrives} Active</p>
          </div>
        </div>

        <div className="pd-dash-card p-6">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="pd-dash-icon p-3 bg-primary-100 rounded-xl">
                <Building2 className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Applications</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
            <p className="text-sm text-gray-600 mt-1">{stats.applicationsUnderReview} Under Review</p>
          </div>
        </div>

        <div className="pd-dash-card p-6">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="pd-dash-icon p-3 bg-amber-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Placement %</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.placementPercentage}%</p>
            <p className="text-sm text-gray-600 mt-1">{stats.placedStudents}/{stats.totalPositions || '—'} Positions Filled</p>
          </div>
        </div>
      </div>

      {/* Application Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="pd-dash-card p-6">
          <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-6">Application Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-700">Pending</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{stats.totalApplications - stats.applicationsUnderReview - stats.shortlistedStudents - stats.selectedStudents - stats.rejectedStudents}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-gray-700">Under Review</span>
                </div>
                <span className="text-2xl font-bold text-amber-600">{stats.applicationsUnderReview}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-gray-700">Shortlisted</span>
                </div>
                <span className="text-2xl font-bold text-primary-600">{stats.shortlistedStudents}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pd-dash-card p-6">
          <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800 mb-6">Placement Results</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-700">Selected</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{stats.selectedStudents}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium text-gray-700">Placed</span>
                </div>
                <span className="text-2xl font-bold text-emerald-600">{stats.placedStudents}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-700">Rejected</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{stats.rejectedStudents}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Yet to Place</span>
                </div>
                <span className="text-2xl font-bold text-gray-600">{stats.yetToPlace}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Update Requests */}
      <div className="pd-dash-card p-6 mb-8">
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-violet-500/10 to-violet-600/10 rounded-full blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-violet-800 mb-6 flex items-center gap-3">
            <Inbox className="w-7 h-7 text-violet-600" />
            Student Update Requests
            {updateRequests.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-violet-600 text-white text-sm font-bold">{updateRequests.length}</span>
            )}
          </h2>
          {updateRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 font-medium">No pending update requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {updateRequests.map(req => (
                <div key={req.id} className="p-4 bg-violet-50/60 border border-violet-100 rounded-xl flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-bold text-heading">{req.studentName || 'Student'}</p>
                      <span className="rounded-md bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">{req.studentCode}</span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">{req.requestType?.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{req.createdAt ? new Date(req.createdAt).toLocaleString() : ''}</p>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-white/70 rounded-lg p-3 border border-violet-100">{req.details}</pre>
                  </div>
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleRequestStatus(req.id, 'APPROVED')}
                      disabled={requestActionId === req.id}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                    >
                      {requestActionId === req.id ? '...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleRequestStatus(req.id, 'REJECTED')}
                      disabled={requestActionId === req.id}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="pd-dash-card p-6">
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-6 flex items-center gap-3">
            <Calendar className="w-7 h-7 text-primary-600" />
            Recent Placement Activities
          </h2>
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium">No recent activities to display.</p>
          </div>
        </div>
      </div>
      <LoginSuccessToast />
    </div>
  )
}

export default PlacementDashboard
