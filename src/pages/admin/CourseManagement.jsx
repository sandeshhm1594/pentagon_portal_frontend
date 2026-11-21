import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Edit, Trash2, Menu, X, CheckCircle, Upload, ImageIcon } from 'lucide-react'
import axios from 'axios'
import { apiFile } from '../../api'

const CourseManagement = () => {
  const [courses, setCourses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageMode, setImageMode] = useState('upload')
  const fileInputRef = useRef(null)
  const { sidebarOpen, setSidebarOpen } = useOutletContext()
  const { user, logout } = useAuth()

  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    description: '',
    imageUrl: '',
    active: true
  })

  useEffect(() => {
    fetchCourses()
    fetchSubjects()
  }, [])

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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const token = localStorage.getItem('token')
      const uploadData = new FormData()
      uploadData.append('file', file)
      const response = await axios.post('/api/courses/upload-image', uploadData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFormData(prev => ({ ...prev, imageUrl: response.data.url }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const getSubjectsForCourse = (courseId) => {
    return subjects.filter(subject => subject.courseId === courseId)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (editingCourse) {
        await axios.put(`/api/courses/${editingCourse.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSuccessMessage('Course updated successfully!')
      } else {
        await axios.post('/api/courses', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSuccessMessage('Course created successfully!')
      }
      setShowForm(false)
      setEditingCourse(null)
      setImageMode('upload')
      setFormData({ courseCode: '', courseName: '', description: '', imageUrl: '', active: true })
      fetchCourses()
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving course:', error)
      alert('Error saving course')
    }
  }

  const handleEdit = (course) => {
    setEditingCourse(course)
    setImageMode(course.imageUrl && course.imageUrl.startsWith('/api/public/course-images/') ? 'upload' : 'url')
    setFormData({
      courseCode: course.courseCode,
      courseName: course.courseName,
      description: course.description,
      imageUrl: course.imageUrl || '',
      active: course.active
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchCourses()
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Error deleting course')
    }
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
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Course Management</h1>
          <p className="text-gray-600">Manage all courses and their subjects.</p>
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
              setEditingCourse(null)
              setImageMode('upload')
              setFormData({ courseCode: '', courseName: '', description: '', imageUrl: '', active: true })
              setShowForm(true)
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Course
          </button>
        </div>
      </div>

      {/* Course Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-heading">
                {editingCourse ? 'Edit Course' : 'Add Course'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-primary-50 rounded-md transition-colors">
                <X className="w-5 h-5 text-body-text" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Course Code</label>
                <input
                  type="text"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Course Name</label>
                  <input
                    type="text"
                    value={formData.courseName}
                    onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="input-field"
                    rows="3"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Course Image</label>
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${imageMode === 'upload' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-transparent shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
                    >
                      <Upload className="w-4 h-4" /> Upload Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${imageMode === 'url' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-transparent shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
                    >
                      <ImageIcon className="w-4 h-4" /> Image URL
                    </button>
                  </div>
                  {imageMode === 'upload' ? (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-primary-300 hover:border-primary-500 text-primary-700 text-sm font-medium rounded-xl transition-all disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        {uploadingImage ? 'Uploading...' : (formData.imageUrl ? 'Change Image' : 'Choose Image File')}
                      </button>
                    </>
                  ) : (
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="input-field"
                      placeholder="https://example.com/course-image.jpg"
                    />
                  )}
                  {formData.imageUrl && (
                    <div className="mt-3 flex items-center gap-3 p-2 rounded-lg border border-primary-100 bg-primary-50/50">
                      <img src={apiFile(formData.imageUrl)} alt="Course preview" className="w-14 h-14 object-cover rounded-lg border border-primary-200" onError={(e) => { e.target.style.display = 'none' }} />
                      <span className="text-xs text-gray-600 truncate flex-1">{formData.imageUrl}</span>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))} className="text-danger hover:text-danger/80 text-xs font-medium">Remove</button>
                    </div>
                  )}
                  <p className="text-xs text-body-text mt-1">This image will be shown on the Home page programs carousel.</p>
                </div>
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-body-text text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.checked})}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span>Active</span>
                  </label>
                </div>
                <button type="submit" className="btn-primary w-full">
                  {editingCourse ? 'Update' : 'Create'} Course
                </button>
              </form>
            </div>
          </div>
        )}

      {/* Courses Cards */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100">
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="relative p-8">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">No courses found. Click "Add Course" to create one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => {
                const courseSubjects = getSubjectsForCourse(course.id)
                return (
                  <div key={course.id} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-primary-50/50 p-6 shadow-lg hover:shadow-2xl hover:shadow-primary-500/20 transition-all duration-500 hover:-translate-y-1 border border-primary-100">
                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                      {course.imageUrl && (
                        <img src={apiFile(course.imageUrl)} alt={course.courseName} className="w-full h-32 object-cover rounded-xl mb-4 border border-primary-100" onError={(e) => { e.target.style.display = 'none' }} />
                      )}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-primary-900 mb-1">{course.courseName}</h3>
                          <p className="text-sm text-gray-600">{course.courseCode}</p>
                        </div>
                        <span className={`badge ${course.active ? 'badge-success' : 'badge-danger'}`}>
                          {course.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{course.description || 'No description'}</p>
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Subjects:</p>
                        {courseSubjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {courseSubjects.map(subject => (
                                <span key={subject.id} className="text-xs bg-primary-100 text-primary-900 px-2 py-1 rounded">
                                  {subject.subjectName}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-600 text-sm">No subjects</span>
                          )}
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-primary-200">
                          <button
                            onClick={() => handleEdit(course)}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-danger-50 text-danger border-2 border-danger/20 hover:border-danger/40 px-4 py-2.5 rounded-lg font-medium transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseManagement
