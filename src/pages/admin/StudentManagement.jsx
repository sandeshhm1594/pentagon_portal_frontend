import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Edit, Trash2, Menu, X } from 'lucide-react'
import axios from 'axios'

const StudentManagement = () => {
  const [students, setStudents] = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const { sidebarOpen, setSidebarOpen } = useOutletContext()
  const { logout } = useAuth()

  const [formData, setFormData] = useState({
    studentCode: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: ''
  })

  useEffect(() => {
    fetchStudents()
    fetchBatches()
  }, [])

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/batches', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBatches(response.data.filter(b => b.active))
    } catch (error) {
      console.error('Error fetching batches:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (editingStudent) {
        await axios.put(`/api/admin/students/${editingStudent.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('/api/admin/students', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowModal(false)
      setEditingStudent(null)
      setFormData({
        studentCode: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: ''
      })
      fetchStudents()
    } catch (error) {
      console.error('Error saving student:', error)
      alert('Error saving student')
    }
  }

  const handleEdit = (student) => {
    setEditingStudent(student)
    setFormData({
      studentCode: student.studentCode,
      password: '',
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth || '',
      address: student.address || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`/api/admin/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchStudents()
      } catch (error) {
        console.error('Error deleting student:', error)
        alert('Error deleting student')
      }
    }
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      await currentStatus
        ? axios.patch(`/api/admin/students/${id}/deactivate`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
        : axios.patch(`/api/admin/students/${id}/activate`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
      fetchStudents()
    } catch (error) {
      console.error('Error toggling student status:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Student Management</h1>
          <p className="text-gray-600">Manage all student records and information.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
            {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Student
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
                  <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Student Code</th>
                  <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Name</th>
                  <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Email</th>
                  <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Phone</th>
                  <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Batch</th>
                  <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Status</th>
                  <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-primary-50/50 transition-colors duration-200">
                    <td className="py-4 px-4 font-bold text-primary-700">{student.studentCode}</td>
                    <td className="py-4 px-4 text-gray-700">{student.firstName} {student.lastName}</td>
                    <td className="py-4 px-4 text-gray-700">{student.email}</td>
                    <td className="py-4 px-4 text-gray-700">{student.phone || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-700">{batches.find(b => b.id === student.batchId)?.subject || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <span className={`badge ${student.active ? 'badge-success' : 'badge-danger'}`}>
                        {student.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(student)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggleActive(student.id, student.active)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-md transition-colors text-xs font-medium" title={student.active ? 'Deactivate' : 'Activate'}>
                          {student.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(student.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
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
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Student Code</label>
                  <input
                    type="text"
                    value={formData.studentCode}
                    onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    required={!editingStudent}
                    placeholder={editingStudent ? "Leave blank to keep current" : ""}
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-body-text text-sm font-medium mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-field"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingStudent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentManagement
