import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Edit, Trash2, Menu, X, CheckCircle } from 'lucide-react'
import axios from 'axios'

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const { sidebarOpen, setSidebarOpen } = useOutletContext()
  const { logout } = useAuth()

  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectName: '',
    description: '',
    courseId: ''
  })

  useEffect(() => {
    fetchSubjects()
    fetchCourses()
  }, [])

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSubjects(response.data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCourses(response.data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      
      if (editingSubject) {
        await axios.put(`/api/subjects/${editingSubject.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSuccessMessage('Subject updated successfully!')
      } else {
        await axios.post('/api/subjects', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSuccessMessage('Subject created successfully!')
      }
      
      setShowForm(false)
      setEditingSubject(null)
      setFormData({ subjectCode: '', subjectName: '', description: '', courseId: '' })
      fetchSubjects()
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving subject:', error)
      alert(error.response?.data?.message || 'Error saving subject')
    }
  }

  const handleEdit = (subject) => {
    setEditingSubject(subject)
    setFormData({
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      description: subject.description || '',
      courseId: subject.courseId || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/subjects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchSubjects()
      alert('Subject deleted successfully!')
    } catch (error) {
      console.error('Error deleting subject:', error)
      alert('Error deleting subject')
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
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Subject Management</h1>
          <p className="text-gray-600">Manage all subjects and their courses.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
          </button>
          <button
            onClick={() => {
              setEditingSubject(null)
              setFormData({ subjectCode: '', subjectName: '', description: '', courseId: '' })
              setShowForm(true)
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Subject
          </button>
        </div>
      </div>

      {/* Subject Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-heading">
                {editingSubject ? 'Edit Subject' : 'Add Subject'}
              </h2>
              <button onClick={() => {
                setShowForm(false)
                setEditingSubject(null)
                setFormData({ subjectCode: '', subjectName: '', description: '', courseId: '' })
              }} className="p-2 hover:bg-light-blue rounded-md transition-colors">
                <X className="w-5 h-5 text-body-text" />
              </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Subject Code</label>
                  <input
                    type="text"
                    value={formData.subjectCode}
                    onChange={(e) => setFormData({...formData, subjectCode: e.target.value})}
                    className="input-field"
                    placeholder="e.g., CORE_JAVA"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Subject Name</label>
                  <input
                    type="text"
                    value={formData.subjectName}
                    onChange={(e) => setFormData({...formData, subjectName: e.target.value})}
                    className="input-field"
                    placeholder="e.g., Core Java"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Course</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Select Course (Optional)</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.courseCode} - {course.courseName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="input-field"
                    rows="3"
                    placeholder="Subject description..."
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  {editingSubject ? 'Update Subject' : 'Create Subject'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Subjects Table */}
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100">
          <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
          <div className="relative p-8">
            {subjects.length === 0 ? (
              <div className="text-center py-12">
                <Library className="w-16 h-16 text-primary-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No subjects found. Click "Add Subject" to create one.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-primary-50 border-b-2 border-primary-200">
                      <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Subject Code</th>
                      <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Subject Name</th>
                      <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Course</th>
                      <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Description</th>
                      <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(subject => (
                      <tr key={subject.id} className="hover:bg-primary-50/50 transition-colors duration-200">
                        <td className="py-4 px-4 font-mono font-bold text-primary-700">{subject.subjectCode}</td>
                        <td className="py-4 px-4 font-medium text-gray-700">{subject.subjectName}</td>
                        <td className="py-4 px-4 text-gray-700">{subject.courseName || '-'}</td>
                        <td className="py-4 px-4 text-gray-700">{subject.description || '-'}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(subject)}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(subject.id)}
                            className="p-2 text-danger hover:bg-danger-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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

export default SubjectManagement
