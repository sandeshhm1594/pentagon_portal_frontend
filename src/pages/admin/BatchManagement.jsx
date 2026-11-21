import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Edit, Trash2, Menu, X } from 'lucide-react'
import axios from 'axios'
import { apiFile } from '../../api'

const BatchManagement = () => {
  const [batches, setBatches] = useState([])
  const [trainers, setTrainers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBatch, setEditingBatch] = useState(null)
  const { sidebarOpen, setSidebarOpen } = useOutletContext()
  const { logout } = useAuth()

  const [formData, setFormData] = useState({
    batchCode: '',
    subject: '',
    courseId: '',
    description: '',
    trainerId: '',
    startDate: '',
    endDate: '',
    scheduleStartTime: '',
    scheduleEndTime: '',
    maxStudents: ''
  })

  const today = new Date().toISOString().slice(0, 16)

  useEffect(() => {
    fetchBatches()
    fetchTrainers()
    fetchSubjects()
    fetchCourses()
  }, [])

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/batches', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBatches(response.data)
    } catch (error) {
      console.error('Error fetching batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrainers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/trainers', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTrainers(response.data.filter(t => t.active))
    } catch (error) {
      console.error('Error fetching trainers:', error)
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
      
      // Validate schedule times
      if (formData.scheduleStartTime && formData.scheduleEndTime) {
        if (formData.scheduleStartTime >= formData.scheduleEndTime) {
          alert('Start time must be earlier than end time')
          return
        }
      }
      
      // Combine start and end times into scheduleTime format
      const scheduleTime = formData.scheduleStartTime && formData.scheduleEndTime
        ? `${formatTime(formData.scheduleStartTime)} - ${formatTime(formData.scheduleEndTime)}`
        : ''
      
      const payload = {
        ...formData,
        courseId: formData.courseId ? Number(formData.courseId) : null,
        scheduleTime,
        scheduleStartTime: formData.scheduleStartTime,
        scheduleEndTime: formData.scheduleEndTime
      }
      
      console.log('Submitting batch payload:', payload)
      
      if (editingBatch) {
        await axios.put(`/api/admin/batches/${editingBatch.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('/api/admin/batches', payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowModal(false)
      setEditingBatch(null)
      setFormData({
        batchCode: '',
        subject: '',
        courseId: '',
        description: '',
        trainerId: '',
        startDate: '',
        endDate: '',
        scheduleStartTime: '',
        scheduleEndTime: '',
        maxStudents: ''
      })
      fetchBatches()
    } catch (error) {
      console.error('Error saving batch:', error)
      alert(error.response?.data?.message || 'Error saving batch')
    }
  }

  const formatTime = (time24) => {
    if (!time24) return ''
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const handleEdit = (batch) => {
    setEditingBatch(batch)
    setFormData({
      batchCode: batch.batchCode,
      subject: batch.subject,
      courseId: batch.courseId || '',
      description: batch.description || '',
      trainerId: batch.trainerId,
      startDate: batch.startDate ? batch.startDate.slice(0, 10) : '',
      endDate: batch.endDate ? batch.endDate.slice(0, 10) : '',
      scheduleStartTime: batch.scheduleStartTime || '',
      scheduleEndTime: batch.scheduleEndTime || '',
      maxStudents: batch.maxStudents || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`/api/admin/batches/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchBatches()
      } catch (error) {
        console.error('Error deleting batch:', error)
        alert('Error deleting batch')
      }
    }
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      await currentStatus
        ? axios.patch(`/api/admin/batches/${id}/deactivate`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
        : axios.patch(`/api/admin/batches/${id}/activate`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
      fetchBatches()
    } catch (error) {
      console.error('Error toggling batch status:', error)
    }
  }

  const generateQRCode = (batchCode) => {
    window.open(apiFile(`/api/qr/generate/${batchCode}`), '_blank')
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Batch Management</h1>
          <p className="text-gray-600">Manage all training batches and schedules.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
            {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Batch
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100">
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="relative p-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary-50 border-b-2 border-primary-200">
                  <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Batch Code</th>
                  <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Subject</th>
                  <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Trainer</th>
                  <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Start Date</th>
                  <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">End Date</th>
                  <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Schedule</th>
                  <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Status</th>
                  <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-primary-50/50 transition-colors duration-200">
                    <td className="py-4 px-4 font-bold text-primary-700">{batch.batchCode}</td>
                    <td className="py-4 px-4 text-gray-700">{batch.subject}</td>
                    <td className="py-4 px-4 text-gray-700">{trainers.find(t => t.id === batch.trainerId)?.fullName || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-700">{batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-700">{batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-700">
                      {batch.scheduleStartTime && batch.scheduleEndTime 
                        ? `${formatTime(batch.scheduleStartTime)} - ${formatTime(batch.scheduleEndTime)}`
                        : batch.scheduleTime || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`badge ${batch.active ? 'badge-success' : 'badge-danger'}`}>
                        {batch.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(batch)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => generateQRCode(batch.batchCode)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Generate QR Code">
                          QR
                        </button>
                        <button onClick={() => handleToggleActive(batch.id, batch.active)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-md transition-colors text-xs font-medium" title={batch.active ? 'Deactivate' : 'Activate'}>
                          {batch.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(batch.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <h2 className="text-2xl font-bold text-heading mb-6">
              {editingBatch ? 'Edit Batch' : 'Add New Batch'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Batch Code</label>
                  <input
                    type="text"
                    value={formData.batchCode}
                    onChange={(e) => setFormData({ ...formData, batchCode: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.subjectName}>
                        {subject.subjectCode} - {subject.subjectName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Course</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Course (Optional)</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.courseCode} - {course.courseName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-body-text text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Trainer</label>
                  <select
                    value={formData.trainerId}
                    onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select Trainer</option>
                    {trainers.map((trainer) => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.fullName || trainer.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Max Students</label>
                  <input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field"
                    min={today.slice(0, 10)}
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field"
                    min={formData.startDate || today.slice(0, 10)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-body-text text-sm font-medium mb-2">Schedule Time</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-body-text text-xs mb-1">Start Time</label>
                      <input
                        type="time"
                        value={formData.scheduleStartTime}
                        onChange={(e) => setFormData({ ...formData, scheduleStartTime: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-body-text text-xs mb-1">End Time</label>
                      <input
                        type="time"
                        value={formData.scheduleEndTime}
                        onChange={(e) => setFormData({ ...formData, scheduleEndTime: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingBatch ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BatchManagement
