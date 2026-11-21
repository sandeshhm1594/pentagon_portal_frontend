import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Edit, Trash2, Menu, X, Shield, UserCheck, Crown } from 'lucide-react'
import axios from 'axios'

const PlacementTeamManagement = () => {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    phone: '',
    role: 'PLACEMENT_COORDINATOR'
  })
  const { sidebarOpen, setSidebarOpen } = useOutletContext()
  const { logout } = useAuth()

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/admins', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAdmins(response.data)
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (editingAdmin) {
        await axios.put(`/api/admin/admins/${editingAdmin.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('/api/admin/admins', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowModal(false)
      setEditingAdmin(null)
      setFormData({
        username: '',
        password: '',
        email: '',
        fullName: '',
        phone: '',
        role: 'PLACEMENT_COORDINATOR'
      })
      fetchAdmins()
    } catch (error) {
      console.error('Error saving admin:', error)
      alert(error.response?.data?.message || 'Error saving admin')
    }
  }

  const handleEdit = (admin) => {
    setEditingAdmin(admin)
    setFormData({
      username: admin.username,
      password: '',
      email: admin.email,
      fullName: admin.fullName || '',
      phone: admin.phone || '',
      role: admin.role
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/admin/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchAdmins()
    } catch (error) {
      console.error('Error deleting admin:', error)
      alert('Error deleting admin')
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="w-5 h-5 text-amber-500" />
      case 'PLACEMENT_HEAD':
        return <Shield className="w-5 h-5 text-primary-500" />
      case 'PLACEMENT_COORDINATOR':
        return <UserCheck className="w-5 h-5 text-blue-500" />
      default:
        return <UserCheck className="w-5 h-5 text-gray-500" />
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'badge-warning'
      case 'PLACEMENT_HEAD':
        return 'badge-primary'
      case 'PLACEMENT_COORDINATOR':
        return 'badge-info'
      default:
        return 'badge-secondary'
    }
  }

  const placementTeam = admins.filter(admin => 
    admin.role === 'PLACEMENT_HEAD' || admin.role === 'PLACEMENT_COORDINATOR'
  )

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Placement Team Management</h1>
          <p className="text-gray-600">Manage Placement Head and Placement Coordinator accounts.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
            {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
          </button>
          <button onClick={() => { setEditingAdmin(null); setFormData({ username: '', password: '', email: '', fullName: '', phone: '', role: 'PLACEMENT_COORDINATOR' }); setShowModal(true) }} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Team Member
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-100 rounded-xl">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Placement Heads</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {admins.filter(a => a.role === 'PLACEMENT_HEAD').length}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Placement Coordinators</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {admins.filter(a => a.role === 'PLACEMENT_COORDINATOR').length}
            </p>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="pd-shell relative overflow-hidden rounded-2xl bg-white border border-primary-100">
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="relative p-8">
          {placementTeam.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-primary-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No placement team members found. Click "Add Team Member" to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="pd-table w-full min-w-[800px]">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {placementTeam.map((admin) => (
                    <tr key={admin.id}>
                      <td><span className="pd-id font-mono">{admin.username}</span></td>
                      <td className="py-4 px-4 text-gray-700">{admin.fullName || 'N/A'}</td>
                      <td className="py-4 px-4 text-gray-700">{admin.email}</td>
                      <td className="py-4 px-4 text-gray-700">{admin.phone || 'N/A'}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(admin.role)}
                          <span className={`badge ${getRoleBadge(admin.role)}`}>
                            {admin.role.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="pd-action-btn p-2 text-blue-500 hover:bg-blue-50 rounded-md"
                          title="Edit Admin"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="pd-action-btn p-2 text-red-500 hover:bg-red-50 rounded-md"
                          title="Delete Admin"
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

      {/* Admin Form Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-heading">
                {editingAdmin ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingAdmin(null) }} className="p-2 hover:bg-light-blue rounded-md transition-colors">
                <X className="w-5 h-5 text-body-text" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input-field"
                    required
                    disabled={editingAdmin}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">
                    Password {editingAdmin && '(leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    required={!editingAdmin}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4 col-span-2">
                  <label className="block text-body-text text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4 col-span-2">
                  <label className="block text-body-text text-sm font-medium mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="PLACEMENT_COORDINATOR">Placement Coordinator</option>
                    <option value="PLACEMENT_HEAD">Placement Head</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">
                {editingAdmin ? 'Update Team Member' : 'Create Team Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlacementTeamManagement
