import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Edit, Trash2, Menu, X, CheckCircle } from 'lucide-react'
import axios from 'axios'

const CourseEnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const { sidebarOpen, setSidebarOpen } = useOutletContext()
  const { logout } = useAuth()

  const [formData, setFormData] = useState({
    studentId: '',
    courseId: ''
  })

  useEffect(() => {
    fetchEnrollments()
    fetchStudents()
    fetchCourses()
  }, [])

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/course-enrollments', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEnrollments(response.data)
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudents(response.data.filter(s => s.active))
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCourses(response.data.filter(c => c.active))
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/admin/course-enrollments', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowForm(false)
      setFormData({ studentId: '', courseId: '' })
      fetchEnrollments()
      setSuccessMessage('Student enrolled to course successfully!')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error enrolling student:', error)
      alert(error.response?.data?.message || 'Error enrolling student')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this enrollment?')) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/admin/course-enrollments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchEnrollments()
      setSuccessMessage('Enrollment removed successfully!')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error removing enrollment:', error)
      alert('Error removing enrollment')
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
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Course Enrollments</h1>
          <p className="text-gray-600">Manage student enrollments in courses.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
            {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Enroll Student
          </button>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100">
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="relative p-8">
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">No enrollments found. Click "Enroll Student" to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                    <thead>
                      <tr className="bg-primary-50 border-b-2 border-primary-200">
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Student</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Student Code</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Course</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Course Code</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Enrolled Date</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Status</th>
                        <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((enrollment) => (
                        <tr key={enrollment.id} className="hover:bg-primary-50/50 transition-colors duration-200">
                          <td className="py-4 px-4 font-medium text-gray-700">{enrollment.studentName}</td>
                          <td className="py-4 px-4 text-gray-700">{enrollment.studentCode}</td>
                          <td className="py-4 px-4 text-gray-700">{enrollment.courseName}</td>
                          <td className="py-4 px-4 text-gray-700">{enrollment.courseCode}</td>
                          <td className="py-4 px-4 text-gray-700">{enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}</td>
                          <td className="py-4 px-4">
                            <span className={`badge ${enrollment.active ? 'badge-success' : 'badge-danger'}`}>
                              {enrollment.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleDelete(enrollment.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="Remove Enrollment"
                            >
                              <Trash2 className="w-4 h-4" />
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

        {/* Enrollment Form Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-heading">Enroll Student to Course</h2>
                <button onClick={() => {
                  setShowForm(false)
                  setFormData({ studentId: '', courseId: '' })
                }} className="p-2 hover:bg-light-blue rounded-md transition-colors">
                  <X className="w-5 h-5 text-body-text" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Student</label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.studentCode} - {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Course</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.courseCode} - {course.courseName}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full">
                  Enroll Student
                </button>
              </form>
            </div>
          </div>
        )}
    </div>
  )
}

export default CourseEnrollmentManagement
