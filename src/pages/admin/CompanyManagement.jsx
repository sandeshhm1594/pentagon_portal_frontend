import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Edit, Trash2, Menu, X, Building2, Globe, Mail, Phone, MapPin } from 'lucide-react'
import axios from 'axios'

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [formData, setFormData] = useState({
    companyId: '',
    companyName: '',
    logo: '',
    website: '',
    industry: '',
    location: '',
    hrContactPerson: '',
    hrEmail: '',
    hrMobile: '',
    description: ''
  })
  const { sidebarOpen, setSidebarOpen } = useOutletContext()
  const { logout } = useAuth()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/companies', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCompanies(response.data)
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (editingCompany) {
        await axios.put(`/api/admin/companies/${editingCompany.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('/api/admin/companies', formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowModal(false)
      setEditingCompany(null)
      setFormData({
        companyId: '',
        companyName: '',
        logo: '',
        website: '',
        industry: '',
        location: '',
        hrContactPerson: '',
        hrEmail: '',
        hrMobile: '',
        description: ''
      })
      fetchCompanies()
    } catch (error) {
      console.error('Error saving company:', error)
      alert(error.response?.data?.message || 'Error saving company')
    }
  }

  const handleEdit = (company) => {
    setEditingCompany(company)
    setFormData({
      companyId: company.companyId,
      companyName: company.companyName,
      logo: company.logo || '',
      website: company.website || '',
      industry: company.industry || '',
      location: company.location || '',
      hrContactPerson: company.hrContactPerson || '',
      hrEmail: company.hrEmail || '',
      hrMobile: company.hrMobile || '',
      description: company.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/admin/companies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchCompanies()
    } catch (error) {
      console.error('Error deleting company:', error)
      alert('Error deleting company')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Company Management</h1>
          <p className="text-gray-600">Manage company information for placement drives.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
            {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
          </button>
          <button onClick={() => { setEditingCompany(null); setFormData({ companyId: '', companyName: '', logo: '', website: '', industry: '', location: '', hrContactPerson: '', hrEmail: '', hrMobile: '', description: '' }); setShowModal(true) }} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Company
          </button>
        </div>
      </div>

      <div className="pd-shell relative overflow-hidden rounded-2xl bg-white border border-primary-100">
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="relative p-8">
          {companies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-primary-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No companies found. Click "Add Company" to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="pd-table w-full min-w-[900px]">
                <thead>
                  <tr>
                    <th>Company ID</th>
                    <th>Company Name</th>
                    <th>Industry</th>
                    <th>Location</th>
                    <th>HR Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.id}>
                      <td><span className="pd-id font-mono">{company.companyId}</span></td>
                      <td className="font-semibold text-heading">{company.companyName}</td>
                      <td className="py-4 px-4 text-gray-700">{company.industry || 'N/A'}</td>
                      <td className="py-4 px-4 text-gray-700">{company.location || 'N/A'}</td>
                      <td className="py-4 px-4 text-gray-700">{company.hrContactPerson || 'N/A'}</td>
                      <td className="py-4 px-4">
                        <span className={`badge ${company.status === 'ACTIVE' ? 'st-active' : 'st-inactive'}`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleEdit(company)}
                          className="pd-action-btn p-2 text-blue-500 hover:bg-blue-50 rounded-md"
                          title="Edit Company"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="pd-action-btn p-2 text-red-500 hover:bg-red-50 rounded-md"
                          title="Delete Company"
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

      {/* Company Form Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-heading">
                {editingCompany ? 'Edit Company' : 'Add Company'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingCompany(null) }} className="p-2 hover:bg-light-blue rounded-md transition-colors">
                <X className="w-5 h-5 text-body-text" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Company ID</label>
                  <input
                    type="text"
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="input-field"
                    required
                    disabled={editingCompany}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">HR Contact Person</label>
                  <input
                    type="text"
                    value={formData.hrContactPerson}
                    onChange={(e) => setFormData({ ...formData, hrContactPerson: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">HR Email</label>
                  <input
                    type="email"
                    value={formData.hrEmail}
                    onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">HR Mobile</label>
                  <input
                    type="tel"
                    value={formData.hrMobile}
                    onChange={(e) => setFormData({ ...formData, hrMobile: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                {editingCompany ? 'Update Company' : 'Create Company'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompanyManagement
