import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Users, 
  BookOpen, 
  Calendar, 
  LogOut,
  Menu,
  X,
  Check,
  QrCode,
  Camera,
  CameraOff,
  Star,
  FileText
} from 'lucide-react'
import axios from 'axios'
import LoginSuccessToast from '../../components/LoginSuccessToast'
import { Html5Qrcode } from 'html5-qrcode'
import pentagonLogo from '../../pentagon-log.png'
import { apiFile } from '../../api'

const TrainerDashboard = () => {
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState([])
  const [todayAttendance, setTodayAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scannedResult, setScannedResult] = useState(null)
  const [manualQRInput, setManualQRInput] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const html5QrCodeRef = useRef(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    if (selectedBatch) {
      fetchStudents()
      // Set default date range to batch start and end dates
      if (selectedBatch.startDate) {
        setStartDate(selectedBatch.startDate.split('T')[0])
      }
      if (selectedBatch.endDate) {
        setEndDate(selectedBatch.endDate.split('T')[0])
      } else {
        setEndDate(new Date().toISOString().split('T')[0])
      }
      fetchTodayAttendance()
      fetchTodayAttendanceForButtons()
    }
  }, [selectedBatch])

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/trainer/batches', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBatches(response.data)
      if (response.data.length > 0) {
        setSelectedBatch(response.data[0])
      }
    } catch (error) {
      console.error('Error fetching batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    if (!selectedBatch) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/trainer/students/${selectedBatch.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const fetchTodayAttendance = async () => {
    if (!selectedBatch) return
    
    try {
      const token = localStorage.getItem('token')
      let startDateParam, endDateParam
      
      if (startDate && endDate) {
        startDateParam = new Date(startDate).toISOString()
        endDateParam = new Date(endDate + 'T23:59:59').toISOString()
      } else {
        const today = new Date().toISOString().split('T')[0]
        startDateParam = new Date(today).toISOString()
        endDateParam = new Date(today + 'T23:59:59').toISOString()
      }
      
      const response = await axios.get(
        `/api/trainer/attendance/${selectedBatch.id}/date-range?startDate=${startDateParam}&endDate=${endDateParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAttendance(response.data)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }

  const fetchTodayAttendanceForButtons = async () => {
    if (!selectedBatch) return
    
    try {
      const token = localStorage.getItem('token')
      const today = new Date().toISOString().split('T')[0]
      const startDateParam = new Date(today).toISOString()
      const endDateParam = new Date(today + 'T23:59:59').toISOString()
      
      const response = await axios.get(
        `/api/trainer/attendance/${selectedBatch.id}/date-range?startDate=${startDateParam}&endDate=${endDateParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTodayAttendance(response.data)
    } catch (error) {
      console.error('Error fetching today attendance:', error)
    }
  }

  const handleEndDateChange = (value) => {
    setEndDate(value)
    if (startDate && value && new Date(startDate) > new Date(value)) {
      alert('End date cannot be before start date')
      setEndDate('')
    }
  }

  const handleDateFilter = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      alert('End date cannot be before start date')
      return
    }
    fetchTodayAttendance()
  }

  const handleResetFilter = () => {
    setStartDate('')
    setEndDate('')
    fetchTodayAttendance()
  }

  const getStudentAttendanceCount = (studentId) => {
    return attendance.filter(a => a.studentId === studentId && a.present).length
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleMarkAttendance = async (studentId, present) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/trainer/attendance', {
        studentId,
        batchId: selectedBatch.id,
        present,
        attendanceDate: new Date().toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchTodayAttendance()
      fetchTodayAttendanceForButtons()
    } catch (error) {
      console.error('Error marking attendance:', error)
      alert('Error marking attendance')
    }
  }

  const handleScan = async (qrData) => {
    setScanning(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/api/qr/scan', null, {
        params: {
          qrData: qrData,
          batchId: selectedBatch.id
        },
        headers: { Authorization: `Bearer ${token}` }
      })
      setScannedResult({ success: true, data: response.data })
      stopCamera()
      fetchTodayAttendance()
    } catch (error) {
      setScannedResult({ 
        success: false, 
        error: error.response?.data?.message || error.message || 'Scanning failed' 
      })
      stopCamera()
    } finally {
      setScanning(false)
    }
  }

  const startCamera = async () => {
    try {
      const element = document.getElementById("trainer-reader")
      if (!element) {
        throw new Error("Camera element not found")
      }
      
      console.log('Starting camera...')
      const html5QrCode = new Html5Qrcode("trainer-reader")
      html5QrCodeRef.current = html5QrCode
      
      // Try to get available cameras first
      try {
        const devices = await Html5Qrcode.getCameras()
        console.log('Available cameras:', devices)
      } catch (err) {
        console.log('Could not get camera list:', err)
      }
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } }
      console.log('Requesting camera access with environment facing mode...')
      
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            console.log('QR code scanned:', decodedText)
            handleScan(decodedText)
          },
          (errorMessage) => {
            console.log('Camera scan error:', errorMessage)
          }
        )
      } catch (envError) {
        console.log('Environment camera failed, trying user camera...', envError)
        // Try with user facing mode as fallback
        await html5QrCode.start(
          { facingMode: "user" },
          config,
          (decodedText) => {
            console.log('QR code scanned:', decodedText)
            handleScan(decodedText)
          },
          (errorMessage) => {
            console.log('Camera scan error:', errorMessage)
          }
        )
      }
      
      console.log('Camera started successfully')
      setCameraActive(true)
    } catch (error) {
      console.error('Error starting camera:', error)
      alert(`Failed to start camera: ${error.message || error}. \n\nTroubleshooting:\n1. Close all other apps using camera (Zoom, Teams, etc.)\n2. Check if camera works in other apps\n3. Try a different browser\n4. Restart your computer\n\nFor now, please use manual QR code entry below.`)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualQRInput.trim()) {
      alert('Please enter QR code data')
      return
    }
    handleScan(manualQRInput.trim())
    setManualQRInput('')
  }

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
        setCameraActive(false)
      } catch (error) {
        console.error('Error stopping camera:', error)
      }
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="p-6 border-b border-primary-200">
          <div className="flex items-center gap-3">
            <img src={pentagonLogo} alt="Pentagon Space Logo" className="w-10 h-10 object-contain flex-shrink-0" />
            <h2 className={`text-lg font-bold text-gold-600 ${!sidebarOpen && 'hidden'}`}>PentagonSpace</h2>
          </div>
        </div>
        <nav className="mt-6 px-3">
          <button
            onClick={() => navigate('/trainer')}
            className="sidebar-link sidebar-link-active mb-1"
          >
            <BookOpen className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/trainer/notes')}
            className="sidebar-link mb-1"
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Notes</span>
          </button>
          <button
            onClick={() => navigate('/trainer/mock-ratings')}
            className="sidebar-link mb-1"
          >
            <Star className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Mock Ratings</span>
          </button>
        </nav>
        <div className="absolute bottom-0 w-full p-3 border-t border-border">
          <button onClick={handleLogout} className="sidebar-link text-danger hover:text-danger-600 hover:bg-danger-50">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-heading">Trainer Dashboard</h1>
              <p className="text-body-text">Welcome, {user?.username}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 bg-card-bg rounded-lg shadow-card border border-primary-200 hover:bg-primary-50 transition-colors">
                {sidebarOpen ? <X className="w-5 h-5 text-heading" /> : <Menu className="w-5 h-5 text-heading" />}
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
            <div className="card card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-text text-sm">Assigned Batches</p>
                  <p className="text-3xl font-bold text-heading mt-2">{batches.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <div className="card card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-text text-sm">Total Students</p>
                  <p className="text-3xl font-bold text-heading mt-2">{students.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-success">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <div className="card card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-text text-sm">Today's Attendance</p>
                  <p className="text-3xl font-bold text-heading mt-2">
                    {attendance.filter(a => a.present).length}/{attendance.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Batch Selection */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-heading mb-4">Select Batch</h2>
            <select
              value={selectedBatch?.id || ''}
              onChange={(e) => setSelectedBatch(batches.find(b => b.id === parseInt(e.target.value)))}
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

          {selectedBatch && (
            <>
              {/* Students List */}
              <div className="card mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-heading">Students</h2>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search by Student ID..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="input-field"
                    />
                    <button 
                      onClick={() => setShowQRScanner(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <QrCode className="w-5 h-5" />
                      Scan QR Code
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student Code</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Attendance Count</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .filter((student) => 
                          studentSearch === '' || 
                          student.studentCode.toLowerCase().includes(studentSearch.toLowerCase())
                        )
                        .map((student) => {
                        const todayRecord = todayAttendance.find(a => a.studentId === student.id)
                        const attendanceCount = getStudentAttendanceCount(student.id)
                        return (
                          <tr key={student.id}>
                            <td className="font-medium text-heading">{student.studentCode}</td>
                            <td>{student.firstName} {student.lastName}</td>
                            <td>{student.email}</td>
                            <td>
                              <span className="font-semibold text-heading">{attendanceCount}</span>
                            </td>
                            <td>
                              {todayRecord ? (
                                <span className={`badge ${todayRecord.present ? 'badge-success' : 'badge-danger'}`}>
                                  {todayRecord.present ? 'Present' : 'Absent'}
                                </span>
                              ) : (
                                <span className="badge" style={{backgroundColor: '#E3EDF6', color: '#526477'}}>
                                  Not Marked
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleMarkAttendance(student.id, true)}
                                  disabled={!!todayRecord}
                                  className={`p-2 text-success hover:bg-success-50 rounded-md transition-colors ${todayRecord ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  title="Mark Present"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleMarkAttendance(student.id, false)}
                                  disabled={!!todayRecord}
                                  className={`p-2 text-danger hover:bg-danger-50 rounded-md transition-colors ${todayRecord ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  title="Mark Absent"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Date Filter */}
              <div className="card mb-6">
                <h2 className="text-xl font-bold text-heading mb-4">Filter Attendance by Date</h2>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-body-text mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-body-text mb-2">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <button
                    onClick={handleDateFilter}
                    className="btn-primary"
                  >
                    Filter
                  </button>
                  <button
                    onClick={handleResetFilter}
                    className="btn-secondary"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Today's Attendance */}
              <div className="card">
                <h2 className="text-xl font-bold text-heading mb-4">Today's Attendance Summary</h2>
                {attendance.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Check In</th>
                          <th>Check Out</th>
                          <th>Status</th>
                          <th>QR Scanned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map((record) => {
                          const student = students.find(s => s.id === record.studentId)
                          return (
                            <tr key={record.id}>
                              <td>{student ? `${student.firstName} ${student.lastName}` : 'Unknown'}</td>
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
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-body-text">No attendance records for today</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <h2 className="text-2xl font-bold text-heading mb-4">Scan QR Code</h2>
            <p className="text-body-text mb-4">Scan student QR code to mark attendance</p>
            <div className="bg-light-blue p-8 rounded-xl text-center mb-4">
              <div id="trainer-reader" className={`w-full max-w-md mx-auto ${!cameraActive ? 'hidden' : ''}`}></div>
              {!cameraActive ? (
                <>
                  <QrCode className="w-24 h-24 mx-auto text-primary mb-4" />
                  <p className="text-body-text mb-2 font-medium">QR Scanner</p>
                  <p className="text-sm text-body-text mb-4">Click below to start camera</p>
                  <button
                    onClick={startCamera}
                    className="btn-primary flex items-center gap-2 mx-auto mb-4"
                  >
                    <Camera className="w-5 h-5" />
                    Start Camera
                  </button>
                  <p className="text-xs text-body-text mb-2">Or manually enter QR code data:</p>
                  <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={manualQRInput}
                      onChange={(e) => setManualQRInput(e.target.value)}
                      placeholder="e.g., STUDENT:STU001"
                      className="input-field flex-1"
                    />
                    <button
                      type="submit"
                      disabled={!manualQRInput.trim()}
                      className="btn-primary"
                    >
                      Submit
                    </button>
                  </form>
                </>
              ) : (
                <button
                  onClick={stopCamera}
                  className="btn-secondary flex items-center gap-2 mx-auto mt-4"
                >
                  <CameraOff className="w-5 h-5" />
                  Stop Camera
                </button>
              )}
            </div>
            {scannedResult && (
              <div className={`p-4 rounded-lg mb-4 ${scannedResult.success ? 'bg-success-50' : 'bg-danger-50'}`}>
                <p className="font-bold text-heading">
                  {scannedResult.success ? 'Attendance Marked!' : 'Scanning Failed'}
                </p>
                {scannedResult.success ? (
                  <p className="text-sm text-body-text">Student: {scannedResult.data.studentId}</p>
                ) : (
                  <p className="text-sm text-danger">{scannedResult.error}</p>
                )}
              </div>
            )}
            <button 
              onClick={() => {
                setShowQRScanner(false)
                stopCamera()
                setScannedResult(null)
                setManualQRInput('')
              }} 
              className="btn-secondary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md text-center">
            <h2 className="text-2xl font-bold text-heading mb-4">Your QR Code</h2>
            <div className="bg-light-blue p-6 rounded-xl mb-4">
              <img 
                src={apiFile(`/api/qr/generate/trainer/${user?.username}`)}
                alt="Trainer QR Code"
                className="w-64 h-64 mx-auto"
              />
            </div>
            <p className="text-body-text mb-4">
              Show this QR code to mark your attendance
            </p>
            <p className="text-sm text-body-text mb-6">
              Username: {user?.username}
            </p>
            <button onClick={() => setShowQRCode(false)} className="btn-secondary w-full">
              Close
            </button>
          </div>
        </div>
      )}
      <LoginSuccessToast />
    </div>
  )
}

export default TrainerDashboard
