import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { CheckCircle, XCircle, Clock, Menu, X, User, FileText } from 'lucide-react'
import axios from 'axios'

const NotesRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectingRequestId, setRejectingRequestId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    fetchRequests()
  }, [filter])

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/trainer/notes/requests/pending', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRequests(response.data)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/trainer/notes/requests/${requestId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Request approved successfully')
      fetchRequests()
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Error approving request')
    }
  }

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/trainer/notes/requests/${requestId}/reject`, {
        requestId,
        rejectionReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Request rejected successfully')
      setRejectionReason('')
      setRejectingRequestId(null)
      fetchRequests()
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Error rejecting request')
    }
  }

  const handleRevoke = async (requestId) => {
    if (!window.confirm('Are you sure you want to revoke access for this student?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/trainer/notes/requests/${requestId}/revoke`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Access revoked successfully')
      fetchRequests()
    } catch (error) {
      console.error('Error revoking access:', error)
      alert('Error revoking access')
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Notes Access Requests</h1>
          <p className="text-gray-600">Approve or reject student access requests.</p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
          {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
        {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
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
          <table className="w-full">
            <thead>
              <tr className="bg-primary-50 border-b-2 border-primary-200">
                <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Student</th>
                <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Notes Title</th>
                <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Chapter</th>
                <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Batch</th>
                <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Request Date</th>
                <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Status</th>
                <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    No requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-primary-50/50 transition-colors duration-200 border-b border-primary-100">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{request.studentName}</p>
                          <p className="text-sm text-gray-600">{request.studentCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{request.notesTitle}</td>
                    <td className="py-4 px-4 text-gray-700">{request.chapterName}</td>
                    <td className="py-4 px-4 text-gray-700">{request.batchCode}</td>
                    <td className="py-4 px-4 text-gray-700">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`badge ${getStatusBadge(request.requestStatus)}`}>
                        {request.requestStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {request.requestStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setRejectingRequestId(request.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {request.requestStatus === 'APPROVED' && (
                          <button
                            onClick={() => handleRevoke(request.id)}
                            className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Revoke Access"
                          >
                            <Clock className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Dialog */}
      {rejectingRequestId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Request</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this request:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors mb-4"
              rows="3"
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  handleReject(rejectingRequestId)
                }}
                className="flex-1 bg-red-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setRejectionReason('')
                  setRejectingRequestId(null)
                }}
                className="flex-1 border border-primary-200 text-gray-700 px-6 py-2 rounded-xl font-medium hover:bg-primary-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotesRequests
