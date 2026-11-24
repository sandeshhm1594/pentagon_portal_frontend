import { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Clock, CheckCircle, XCircle, Menu, X, FileText } from 'lucide-react'
import axios from 'axios'

const MyNotesRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const navigate = useNavigate()
  const { logout } = useAuth()
  const outletContext = useOutletContext()
  const sidebarOpen = outletContext?.sidebarOpen ?? true
  const setSidebarOpen = outletContext?.setSidebarOpen ?? (() => {})

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/student/notes/my-requests', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRequests(response.data)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      case 'APPROVED':
        return 'bg-green-100 text-green-700'
      case 'REJECTED':
        return 'bg-red-100 text-red-700'
      case 'REVOKED':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'REVOKED':
        return <XCircle className="w-5 h-5 text-gray-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const filteredRequests = filter === 'ALL' 
    ? requests 
    : requests.filter(r => r.requestStatus === filter)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">My Notes Requests</h1>
          <p className="text-gray-600">View the status of your notes access requests.</p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
          {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-5 py-2 rounded-full text-sm font-semibold shadow-sm transition-all duration-200 ${
              filter === status
                ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-md shadow-primary-500/30'
                : 'bg-white text-gray-700 border border-primary-200 hover:bg-primary-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100">
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="relative overflow-x-auto">
          <table className="pd-table w-full min-w-[900px]">
            <thead>
              <tr>
                <th>Notes Title</th>
                <th>Chapter</th>
                <th>Subject</th>
                <th>Batch</th>
                <th>Request Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    No requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <FileText className="w-5 h-5 text-primary-600" />
                        </div>
                        <span className="font-medium text-gray-900">{request.notesTitle}</span>
                      </div>
                    </td>
                    <td className="text-gray-700">{request.chapterName}</td>
                    <td className="text-gray-700">{request.subjectName || 'N/A'}</td>
                    <td className="text-gray-700">{request.batchCode}</td>
                    <td className="text-gray-700">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.requestStatus)}
                        <span className={`badge ${getStatusBadge(request.requestStatus)}`}>
                          {request.requestStatus}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Reason Display */}
      {filteredRequests.some(r => r.requestStatus === 'REJECTED' && r.rejectionReason) && (
        <div className="mt-6 space-y-4">
          {filteredRequests
            .filter(r => r.requestStatus === 'REJECTED' && r.rejectionReason)
            .map((request) => (
              <div key={request.id} className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">
                  <span className="font-medium">Rejection Reason for "{request.notesTitle}":</span> {request.rejectionReason}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default MyNotesRequests
