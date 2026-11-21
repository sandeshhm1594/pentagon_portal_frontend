import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Menu, 
  X, 
  MessageSquare, 
  Mail, 
  Phone, 
  Building, 
  User as UserIcon, 
  CheckCircle, 
  X as XIcon
} from 'lucide-react'
import axios from 'axios'

const EnquiryManagement = () => {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const { sidebarOpen, setSidebarOpen } = useOutletContext()
  const { logout } = useAuth()

  useEffect(() => {
    fetchEnquiries()
  }, [])

  useEffect(() => {
    fetchEnquiries()
  }, [statusFilter, startDate, endDate])

  const fetchEnquiries = async () => {
    try {
      const token = localStorage.getItem('token')
      let url = '/api/auth/enquiries'
      const params = []
      
      if (statusFilter) {
        params.push(`status=${statusFilter}`)
      }
      if (startDate) {
        params.push(`startDate=${new Date(startDate).toISOString()}`)
      }
      if (endDate) {
        params.push(`endDate=${new Date(endDate + 'T23:59:59').toISOString()}`)
      }
      
      if (params.length > 0) {
        url += '?' + params.join('&')
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEnquiries(response.data)
    } catch (error) {
      console.error('Error fetching enquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value)
  }

  const handleStartDateChange = (e) => {
    const value = e.target.value
    setStartDate(value)
    if (endDate && new Date(value) > new Date(endDate)) {
      setEndDate(value)
    }
  }

  const handleEndDateChange = (e) => {
    const value = e.target.value
    if (startDate && new Date(value) < new Date(startDate)) {
      alert('End date cannot be before start date')
      return
    }
    setEndDate(value)
  }

  const handleFilter = () => {
    fetchEnquiries()
  }

  const handleReset = () => {
    setStatusFilter('')
    setStartDate(new Date().toISOString().split('T')[0])
    setEndDate(new Date().toISOString().split('T')[0])
    fetchEnquiries()
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/auth/enquiries/${id}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchEnquiries()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`/api/auth/enquiries/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchEnquiries()
      } catch (error) {
        console.error('Error deleting enquiry:', error)
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      PENDING: 'badge-warning',
      CONTACTED: 'badge-info',
      CONVERTED: 'badge-success',
      CLOSED: 'badge-danger'
    }
    return statusStyles[status] || 'badge-warning'
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Enquiry Management</h1>
          <p className="text-gray-600">Manage and track all your enquiries in one place.</p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
          {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
        </button>
      </div>

      {/* Filter Section */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 mb-6">
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="relative p-8">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-6 flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-primary-600" />
            Filter Enquiries
          </h2>
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CONVERTED">Converted</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="input-field"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate}
                    className="input-field"
                  />
                </div>
                <button
                  onClick={handleFilter}
                  className="btn-primary"
                >
                  Filter
                </button>
                <button
                  onClick={handleReset}
                  className="btn-secondary"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100">
            <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
            <div className="relative p-8">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading enquiries...</p>
                </div>
              ) : enquiries.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-primary-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No enquiries found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-primary-50 border-b-2 border-primary-200">
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Name</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Email</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Phone</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">College</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Degree</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Stream</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Status</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Date</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Actions</th>
                      </tr>
                  </thead>
                  <tbody>
                    {enquiries.map((enquiry) => (
                      <tr key={enquiry.id} className="hover:bg-primary-50/50 transition-colors duration-200">
                        <td className="py-4 px-4 font-bold text-primary-700">{enquiry.name}</td>
                        <td className="py-4 px-4 text-gray-700">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary-500" />
                            {enquiry.email}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary-500" />
                            {enquiry.phone}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700">{enquiry.collegeName}</td>
                        <td className="py-4 px-4 text-gray-700">{enquiry.degree}</td>
                        <td className="py-4 px-4 text-gray-700">{enquiry.stream}</td>
                        <td className="py-4 px-4">
                          <span className={`badge ${getStatusBadge(enquiry.status)}`}>
                            {enquiry.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <select
                              value={enquiry.status}
                              onChange={(e) => handleStatusUpdate(enquiry.id, e.target.value)}
                              className="px-3 py-1.5 border border-primary-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 bg-white"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="CONTACTED">Contacted</option>
                              <option value="CONVERTED">Converted</option>
                              <option value="CLOSED">Closed</option>
                            </select>
                            <button
                              onClick={() => handleDelete(enquiry.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
    </div>
  )
}

export default EnquiryManagement
