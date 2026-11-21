import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Trash2, Menu, X, CheckCircle, BookOpen, Users } from 'lucide-react'
import axios from 'axios'

const BatchEnrollmentManagement = () => {
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [courseEnrolledStudents, setCourseEnrolledStudents] = useState([])
  const [batchStudents, setBatchStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const { sidebarOpen, setSidebarOpen } = useOutletContext()
  const { logout } = useAuth()

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    if (selectedBatch) {
      fetchCourseEnrolledStudents()
      fetchBatchStudents()
    }
  }, [selectedBatch])

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/batches', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBatches(response.data.filter(b => b.active))
    } catch (error) {
      console.error('Error fetching batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourseEnrolledStudents = async () => {
    if (!selectedBatch) return
    
    try {
      const token = localStorage.getItem('token')
      // Get course enrollments for the batch's course
      const response = await axios.get('/api/admin/course-enrollments', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Get students already in this batch from the new enrollment system
      const batchEnrollmentsResponse = await axios.get(`/api/admin/student-batch-enrollments/batch/${selectedBatch.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const batchStudentIds = batchEnrollmentsResponse.data.map(e => e.studentId)
      
      // Filter by batch's course if it has one
      let availableStudents = response.data
      if (selectedBatch.courseId) {
        availableStudents = response.data.filter(e => e.courseId === selectedBatch.courseId)
      }
      
      // Filter out students already in the batch
      availableStudents = availableStudents.filter(
        e => !batchStudentIds.includes(e.studentId)
      )
      
      setCourseEnrolledStudents(availableStudents)
    } catch (error) {
      console.error('Error fetching course enrolled students:', error)
    }
  }

  const fetchBatchStudents = async () => {
    if (!selectedBatch) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/admin/student-batch-enrollments/batch/${selectedBatch.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBatchStudents(response.data)
    } catch (error) {
      console.error('Error fetching batch students:', error)
    }
  }

  const handleEnrollToBatch = async (studentId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/admin/student-batch-enrollments', null, {
        params: { studentId, batchId: selectedBatch.id },
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setSuccessMessage('Student enrolled to batch successfully!')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
      // Refresh data
      fetchCourseEnrolledStudents()
      fetchBatchStudents()
    } catch (error) {
      console.error('Error enrolling student to batch:', error)
      alert(error.response?.data?.message || 'Error enrolling student to batch')
    }
  }

  const handleRemoveFromBatch = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student from the batch?')) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.delete('/api/admin/student-batch-enrollments', {
        params: { studentId, batchId: selectedBatch.id },
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setSuccessMessage('Student removed from batch successfully!')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
      // Refresh data
      fetchCourseEnrolledStudents()
      fetchBatchStudents()
    } catch (error) {
      console.error('Error removing student from batch:', error)
      alert('Error removing student from batch')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right fade-in duration-300">
          <div className="bg-white border-l-4 border-success rounded-lg shadow-xl p-4 flex items-center gap-3 min-w-[300px]">
            <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Success</p>
              <p className="text-gray-700 text-xs">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Batch Enrollments</h1>
          <p className="text-gray-600">Manage student enrollments in batches.</p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
          {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
        </button>
      </div>

      {/* Batch Selection */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 mb-6">
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
            <div className="relative p-8">
              <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-6 flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-primary-600" />
                Select Batch
              </h2>
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
          </div>

          {selectedBatch && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Course Enrolled Students (Available to Enroll) */}
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100">
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
                <div className="relative p-8">
                  <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-6 flex items-center gap-3">
                    <Users className="w-7 h-7 text-primary-600" />
                    Available Students (Course Enrolled)
                  </h2>
                  {courseEnrolledStudents.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-primary-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No students available to enroll.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-primary-50 border-b-2 border-primary-200">
                            <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Student Code</th>
                            <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Name</th>
                            <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Course</th>
                            <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courseEnrolledStudents.map((enrollment) => (
                            <tr key={enrollment.id} className="hover:bg-primary-50/50 transition-colors duration-200">
                              <td className="py-4 px-4 font-bold text-primary-700">{enrollment.studentCode}</td>
                              <td className="py-4 px-4 text-gray-700">{enrollment.studentName}</td>
                              <td className="py-4 px-4 text-gray-700">{enrollment.courseCode}</td>
                              <td className="py-4 px-4">
                                <button
                                  onClick={() => handleEnrollToBatch(enrollment.studentId)}
                                  className="btn-primary text-sm py-1 px-3"
                                >
                                  <Plus className="w-4 h-4 inline mr-1" />
                                  Enroll
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Batch Students (Currently Enrolled) */}
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100">
                <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
                <div className="relative p-8">
                  <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-6 flex items-center gap-3">
                    <BookOpen className="w-7 h-7 text-primary-600" />
                    Batch Students ({batchStudents.length})
                  </h2>
                  {batchStudents.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-primary-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No students enrolled in this batch yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-primary-50 border-b-2 border-primary-200">
                            <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Student Code</th>
                            <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Name</th>
                            <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Batch Code</th>
                            <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {batchStudents.map((enrollment) => (
                            <tr key={enrollment.id} className="hover:bg-primary-50/50 transition-colors duration-200">
                              <td className="py-4 px-4 font-bold text-primary-700">{enrollment.studentCode}</td>
                              <td className="py-4 px-4 text-gray-700">{enrollment.studentName}</td>
                              <td className="py-4 px-4 text-gray-700">{enrollment.batchCode}</td>
                              <td className="py-4 px-4">
                                <button
                                  onClick={() => handleRemoveFromBatch(enrollment.studentId)}
                                  className="bg-red-50 text-red-600 hover:bg-red-100 text-sm py-1 px-3 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 inline mr-1" />
                                  Remove
                                </button>
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
          )}
    </div>
  )
}

export default BatchEnrollmentManagement
