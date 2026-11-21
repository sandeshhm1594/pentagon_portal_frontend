import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  BookOpen,
  Star,
  Search,
  Plus,
  Save,
  X,
  Menu,
  LogOut,
  Download
} from 'lucide-react'
import axios from 'axios'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import pentagonLogo from '../../pentagon-log.png'

const MockRatings = () => {
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  
  const [ratingForm, setRatingForm] = useState({
    studentId: '',
    subjectId: '',
    rating: '',
    remarks: '',
    mockDate: new Date().toISOString().split('T')[0]
  })
  
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchBatches(), fetchSubjects()])
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedBatch) {
      fetchStudents()
      fetchRatings()
    }
  }, [selectedBatch])

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/trainer/batches', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBatches(response.data)
    } catch (error) {
      console.error('Error fetching batches:', error)
    }
  }

  const fetchStudents = async () => {
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

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSubjects(response.data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/mock-ratings/batch/${selectedBatch.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRatings(response.data)
    } catch (error) {
      console.error('Error fetching ratings:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/mock-ratings/search?searchTerm=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSearchResults(response.data)
    } catch (error) {
      console.error('Error searching:', error)
    }
  }

  const handleSubmitRating = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const payload = {
        ...ratingForm,
        studentId: parseInt(ratingForm.studentId),
        subjectId: parseInt(ratingForm.subjectId),
        batchId: selectedBatch.id,
        trainerId: user.userId,
        rating: parseInt(ratingForm.rating)
      }
      console.log('Submitting rating:', payload)
      const response = await axios.post('/api/mock-ratings', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Rating saved successfully:', response.data)
      setShowRatingForm(false)
      setRatingForm({
        studentId: '',
        subjectId: '',
        rating: '',
        remarks: '',
        mockDate: new Date().toISOString().split('T')[0]
      })
      fetchRatings()
      alert('Rating saved successfully!')
    } catch (error) {
      console.error('Error saving rating:', error)
      alert('Error saving rating')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleDownloadExcel = async () => {
    if (!selectedBatch || ratings.length === 0) {
      alert('No ratings to download')
      return
    }

    // Create a new workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Mock Ratings')

    // Define columns
    worksheet.columns = [
      { header: 'Student Code', key: 'studentCode', width: 15 },
      { header: 'Student Name', key: 'studentName', width: 25 },
      { header: 'Subject', key: 'subjectName', width: 20 },
      { header: 'Rating', key: 'rating', width: 10 },
      { header: 'Mock Date', key: 'mockDate', width: 15 },
      { header: 'Remarks', key: 'remarks', width: 30 }
    ]

    // Style the header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF91CAED' }
      }
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' }
      }
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }
    })

    // Add data
    ratings.forEach(rating => {
      worksheet.addRow({
        studentCode: rating.studentCode,
        studentName: rating.studentName,
        subjectName: rating.subjectName,
        rating: rating.rating,
        mockDate: rating.mockDate,
        remarks: rating.remarks || '-'
      })
    })

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()
    
    // Download file
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const filename = `Mock_Ratings_${selectedBatch.batchCode}_${new Date().toISOString().split('T')[0]}.xlsx`
    saveAs(blob, filename)
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
            <h2 className={`text-lg font-bold text-gray-900 ${!sidebarOpen && 'hidden'}`}>PentagonSpace</h2>
          </div>
        </div>
        <nav className="mt-6 px-3">
          <button
            onClick={() => navigate('/trainer')}
            className="sidebar-link mb-1"
          >
            <BookOpen className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/trainer/mock-ratings')}
            className="sidebar-link sidebar-link-active mb-1"
          >
            <Star className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Mock Ratings</span>
          </button>
        </nav>
        <div className="absolute bottom-0 w-full p-3 border-t border-primary-200">
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
            <h1 className="text-3xl font-bold text-heading">Mock Ratings Management</h1>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 bg-card-bg rounded-lg shadow-card border border-border hover:bg-light-blue transition-colors">
              {sidebarOpen ? <X className="w-5 h-5 text-heading" /> : <Menu className="w-5 h-5 text-heading" />}
            </button>
          </div>

        {/* Batch Selection */}
        <div className="card mb-6">
          <label className="block text-body-text text-sm font-medium mb-2">Select Batch</label>
          <select
            value={selectedBatch?.id || ''}
            onChange={(e) => setSelectedBatch(batches.find(b => b.id === parseInt(e.target.value)))}
            className="input-field"
          >
            <option value="">Select a batch</option>
            {batches.map(batch => (
              <option key={batch.id} value={batch.id}>
                {batch.batchCode} - {batch.subject}
              </option>
            ))}
          </select>
        </div>

        {selectedBatch && (
          <>
            {/* Search Student */}
            <div className="card mb-6">
              <h2 className="text-xl font-bold text-heading mb-4">Search Student</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter student ID or phone number"
                  className="input-field flex-1"
                />
                <button onClick={handleSearch} className="btn-primary flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-bold text-heading mb-2">Search Results:</h3>
                  {searchResults.map(rating => (
                    <div key={rating.id} className="bg-light-blue p-3 rounded-lg mb-2">
                      <p><strong>Student:</strong> {rating.studentName} ({rating.studentCode})</p>
                      <p><strong>Subject:</strong> {rating.subjectName}</p>
                      <p><strong>Rating:</strong> {rating.rating}/10</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Rating Button */}
            <div className="mb-6 flex gap-3">
              <button
                onClick={() => setShowRatingForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Mock Rating
              </button>
              <button
                onClick={handleDownloadExcel}
                className="btn-secondary flex items-center gap-2"
                disabled={!selectedBatch || ratings.length === 0}
              >
                <Download className="w-5 h-5" />
                Download Excel
              </button>
            </div>

            {/* Rating Form Modal */}
            {showRatingForm && (
              <div className="modal-overlay">
                <div className="modal-content max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-heading">Add Mock Rating</h2>
                    <button onClick={() => setShowRatingForm(false)} className="p-2 hover:bg-light-blue rounded-md transition-colors">
                      <X className="w-5 h-5 text-body-text" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmitRating}>
                    <div className="mb-4">
                      <label className="block text-body-text text-sm font-medium mb-2">Student</label>
                      <select
                        value={ratingForm.studentId}
                        onChange={(e) => setRatingForm({...ratingForm, studentId: e.target.value})}
                        className="input-field"
                        required
                      >
                        <option value="">Select student</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.studentCode} - {student.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-body-text text-sm font-medium mb-2">Subject</label>
                      <select
                        value={ratingForm.subjectId}
                        onChange={(e) => setRatingForm({...ratingForm, subjectId: e.target.value})}
                        className="input-field"
                        required
                      >
                        <option value="">Select subject</option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.subjectCode} - {subject.subjectName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-body-text text-sm font-medium mb-2">Rating (0-10)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={ratingForm.rating}
                        onChange={(e) => setRatingForm({...ratingForm, rating: e.target.value})}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-body-text text-sm font-medium mb-2">Mock Date</label>
                      <input
                        type="date"
                        value={ratingForm.mockDate}
                        onChange={(e) => setRatingForm({...ratingForm, mockDate: e.target.value})}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-body-text text-sm font-medium mb-2">Remarks</label>
                      <textarea
                        value={ratingForm.remarks}
                        onChange={(e) => setRatingForm({...ratingForm, remarks: e.target.value})}
                        className="input-field"
                        rows="3"
                      />
                    </div>
                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                      <Save className="w-5 h-5" />
                      Save Rating
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Ratings Table */}
            <div className="card">
              <h2 className="text-xl font-bold text-heading mb-4">Batch Ratings</h2>
              {ratings.length === 0 ? (
                <p className="text-body-text">No ratings found for this batch</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Subject</th>
                        <th>Rating</th>
                        <th>Date</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ratings.map(rating => (
                        <tr key={rating.id}>
                          <td>{rating.studentName} ({rating.studentCode})</td>
                          <td>{rating.subjectName}</td>
                          <td>
                            <span className={`badge ${rating.rating >= 7 ? 'badge-success' : rating.rating >= 5 ? 'badge-warning' : 'badge-danger'}`}>
                              {rating.rating}/10
                            </span>
                          </td>
                          <td>{rating.mockDate}</td>
                          <td>{rating.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  )
}

export default MockRatings
