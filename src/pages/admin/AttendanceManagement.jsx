import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Menu, X, Check, X as XIcon, Calendar } from 'lucide-react'
import axios from 'axios'

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [batches, setBatches] = useState([])
  const { sidebarOpen, setSidebarOpen } = useOutletContext()
  const { logout } = useAuth()

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    if (selectedBatch) {
      fetchAttendance()
    }
  }, [selectedBatch, selectedDate])

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/batches', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBatches(response.data.filter(b => b.active))
      if (response.data.length > 0) {
        setSelectedBatch(response.data[0].id)
      }
    } catch (error) {
      console.error('Error fetching batches:', error)
    }
  }

  const fetchAttendance = async () => {
    if (!selectedBatch) return
    
    try {
      const token = localStorage.getItem('token')
      const startDate = new Date(selectedDate).toISOString()
      const endDate = new Date(selectedDate + 'T23:59:59').toISOString()
      
      const response = await axios.get(
        `/api/admin/attendance/batch/${selectedBatch}/date-range?startDate=${startDate}&endDate=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAttendance(response.data)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Attendance Management</h1>
          <p className="text-gray-600">View and manage attendance records for all batches.</p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
          {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 mb-6">
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="relative p-8">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Batch</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="input-field"
              >
                <option value="">Select Batch</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batchCode} - {batch.subject}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100">
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="relative p-8">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-6 flex items-center gap-3">
            Attendance Records
          </h2>
              {attendance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-primary-50 border-b-2 border-primary-200">
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Date</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Check In</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Check Out</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Status</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">QR Scanned</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record) => (
                        <tr key={record.id} className="hover:bg-primary-50/50 transition-colors duration-200">
                          <td className="py-4 px-4 font-bold text-primary-700">{new Date(record.attendanceDate).toLocaleString()}</td>
                          <td className="py-4 px-4 text-gray-700">{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : 'N/A'}</td>
                          <td className="py-4 px-4 text-gray-700">{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : 'N/A'}</td>
                          <td className="py-4 px-4">
                            <span className={`badge ${record.present ? 'badge-success' : 'badge-danger'}`}>
                            {record.present ? (
                              <span className="flex items-center gap-1">
                                <Check className="w-4 h-4" /> Present
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <XIcon className="w-4 h-4" /> Absent
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {record.qrCodeScanned ? (
                            <span className="text-green-600 font-medium">Yes</span>
                          ) : (
                            <span className="text-gray-700">No</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-700">{record.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-primary-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No attendance records found for the selected date and batch</p>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default AttendanceManagement
