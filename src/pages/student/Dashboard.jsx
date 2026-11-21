import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Calendar, 
  Check,
  QrCode,
  Menu,
  X,
  User
} from 'lucide-react'
import axios from 'axios'
import LoginSuccessToast from '../../components/LoginSuccessToast'
import { apiFile } from '../../api'

const StudentDashboard = () => {
  const [student, setStudent] = useState(null)
  const [batches, setBatches] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [showQRCode, setShowQRCode] = useState(false)
  const outletContext = useOutletContext()
  const sidebarOpen = outletContext?.sidebarOpen ?? true
  const setSidebarOpen = outletContext?.setSidebarOpen ?? (() => {})
  const { user } = useAuth()

  useEffect(() => {
    fetchProfile()
    fetchBatches()
    fetchAttendance()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/student/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudent(response.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/student/batches', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBatches(response.data)
    } catch (error) {
      console.error('Error fetching batches:', error)
    }
  }

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/student/attendance', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAttendance(response.data)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <>
      <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Student Dashboard</h1>
            <p className="text-gray-600">Welcome back, {student?.firstName} {student?.lastName}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
              {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
            </button>
            <button 
              onClick={() => setShowQRCode(true)}
              className="btn-primary flex items-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              My QR Code
            </button>
          </div>
        </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card card-hover relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-body-text text-sm font-medium">Student Code</p>
                  <p className="text-2xl font-bold text-heading mt-2">{student?.studentCode}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/30 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  <User className="w-7 h-7" />
                </div>
              </div>
            </div>
            <div className="card card-hover relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-full blur-3xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-body-text text-sm font-medium">Total Attendance</p>
                  <p className="text-3xl font-bold text-heading mt-2">{attendance.length}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  <Calendar className="w-7 h-7" />
                </div>
              </div>
            </div>
            <div className="card card-hover relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-violet-600/10 rounded-full blur-3xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-body-text text-sm font-medium">Present Days</p>
                  <p className="text-3xl font-bold text-heading mt-2">
                    {attendance.filter(a => a.present).length}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg shadow-violet-500/30 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  <Check className="w-7 h-7" />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6 mb-6">
            <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-4">My Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-body-text text-sm">Full Name</p>
                <p className="font-semibold text-heading">{student?.firstName} {student?.lastName}</p>
              </div>
              <div>
                <p className="text-body-text text-sm">Email</p>
                <p className="font-semibold text-heading">{student?.email}</p>
              </div>
              <div>
                <p className="text-body-text text-sm">Phone</p>
                <p className="font-semibold text-heading">{student?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-body-text text-sm">Status</p>
                <span className={`badge ${student?.active ? 'badge-success' : 'badge-danger'}`}>
                  {student?.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Batch Cards */}
          {batches.length > 0 ? (
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6 mb-6">
              <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-4">My Batches</h2>
              <div className="flex flex-wrap gap-4">
                {batches.map((batch) => (
                  <div key={batch.id} className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-white border border-primary-200 rounded-2xl p-5 min-w-[200px] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute -right-6 -top-6 w-20 h-20 bg-primary-200/40 rounded-full blur-xl" />
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-500 mb-1">Batch Code</p>
                    <p className="font-bold text-heading text-lg mb-3">{batch.batchCode}</p>
                    <div className="space-y-1.5 text-sm">
                      <p className="text-body-text"><span className="font-medium text-heading">Subject:</span> {batch.subject}</p>
                      <p className="text-body-text"><span className="font-medium text-heading">Schedule:</span> {batch.scheduleTime || 'N/A'}</p>
                      <p className="text-body-text"><span className="font-medium text-heading">Start:</span> {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6 mb-6">
              <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-4">My Batches</h2>
              <p className="text-body-text">You are not currently enrolled in any batch.</p>
            </div>
          )}

          {/* Attendance History */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6">
            <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-4">Attendance History</h2>
            {attendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="pd-table w-full min-w-[700px]">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                      <th>QR Scanned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record) => (
                      <tr key={record.id}>
                        <td className="font-medium text-heading">{new Date(record.attendanceDate).toLocaleString()}</td>
                        <td>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : 'N/A'}</td>
                        <td>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : 'N/A'}</td>
                        <td>
                          <span className={`badge ${record.present ? 'badge-success' : 'badge-danger'}`}>
                            {record.present ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td>
                          {record.qrCodeScanned ? (
                            <span className="text-success font-medium">Yes</span>
                          ) : (
                            <span className="text-body-text">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-body-text">No attendance records found</p>
            )}
          </div>
        </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowQRCode(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-primary-600 to-violet-600 px-6 py-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Your QR Code</h2>
              <button onClick={() => setShowQRCode(false)} className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="bg-gradient-to-br from-primary-50 to-violet-50 rounded-2xl p-6 mb-4 border border-primary-100 inline-block">
                <img
                  src={apiFile(`/api/qr/generate/student/${student?.studentCode}`)}
                  alt="Student QR Code"
                  className="w-56 h-56 mx-auto rounded-xl"
                />
              </div>
              <p className="text-body-text mb-1">Show this QR code to mark your attendance</p>
              <p className="text-sm font-semibold text-primary-600 mb-5">Student Code: {student?.studentCode}</p>
              <button onClick={() => setShowQRCode(false)} className="btn-secondary w-full">Close</button>
            </div>
          </div>
        </div>
      )}
      <LoginSuccessToast />
    </>
  )
}

export default StudentDashboard
