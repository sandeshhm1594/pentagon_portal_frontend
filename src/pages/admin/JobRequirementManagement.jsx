import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Edit, Trash2, Menu, X, Briefcase, Building2, DollarSign, Calendar } from 'lucide-react'
import axios from 'axios'

const JobRequirementManagement = () => {
  const [requirements, setRequirements] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRequirement, setEditingRequirement] = useState(null)
  const [formData, setFormData] = useState({
    requirementId: '',
    companyId: '',
    jobTitle: '',
    jobRole: '',
    jobDescription: '',
    requiredSkills: '',
    technicalSkills: '',
    experienceRequired: '',
    qualification: [],
    passingYear: [],
    jobLocation: '',
    employmentType: '',
    workMode: '',
    minimumSalary: '',
    maximumSalary: '',
    ctc: '',
    numberOfVacancies: '',
    candidatesRequired: '',
    applicationStartDate: '',
    applicationDeadline: '',
    selectionProcess: '',
    additionalInstructions: '',
    eligibleDegrees: [],
    eligibleStreams: [],
    qualificationLevels: [],
    customQualificationLevel: '',
    minimumPercentage: '',
    minimumCgpa: ''
  })
  const { sidebarOpen, setSidebarOpen } = useOutletContext()
  const { logout } = useAuth()

  useEffect(() => {
    fetchRequirements()
    fetchCompanies()
  }, [])

  const fetchRequirements = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/job-requirements', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRequirements(response.data)
    } catch (error) {
      console.error('Error fetching requirements:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/companies/active', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCompanies(response.data)
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const ANY_DEGREE_OPTION = 'Any Degree / Any %'
  const degreeGroups = [
    { label: 'Bachelors', options: ['B.E.', 'B.Tech', 'BCA', 'B.Sc', 'Bachelor'] },
    { label: 'Masters', options: ['M.E.', 'M.Tech', 'MBA', 'Master'] },
    { label: 'Others', options: ['PhD', 'Diploma', ANY_DEGREE_OPTION] }
  ]
  const streamOptions = [
    'Computer Science', 'Artificial Intelligence', 'Data Science', 'Information Technology',
    'Computer Applications', 'Electronics & Communication', 'Electrical', 'Mechanical', 'Civil',
    'Biotechnology', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Commerce'
  ]
  const qualificationLevelOptions = ['10th', '12th / Diploma', 'Degree', 'Throughout', 'Other']
  const qualificationOptions = ['10th', '12th', 'Diploma', 'Bachelors', 'Masters', 'PhD', 'Any']
  const passingYearOptions = ['2024', '2025', '2026', '2027', '2028', '2029', '2030', '2031', 'Any']
  const parseCsvList = (value) => value ? String(value).split(',').map(item => item.trim()).filter(Boolean) : []
  const parseMultiValue = (value) => value ? String(value).split(/[,/]/).map(item => item.trim()).filter(Boolean) : []
  const toggleDegree = (degree) => {
    setFormData(prev => {
      if (degree === ANY_DEGREE_OPTION) {
        const hasAny = prev.eligibleDegrees.includes(ANY_DEGREE_OPTION)
        return {
          ...prev,
          eligibleDegrees: hasAny ? [] : [ANY_DEGREE_OPTION],
          eligibleStreams: [],
          qualificationLevels: [],
          customQualificationLevel: '',
          minimumPercentage: '',
          minimumCgpa: ''
        }
      }
      return {
        ...prev,
        eligibleDegrees: prev.eligibleDegrees.includes(degree)
          ? prev.eligibleDegrees.filter(item => item !== degree)
          : [...prev.eligibleDegrees.filter(item => item !== ANY_DEGREE_OPTION), degree]
      }
    })
  }
  const toggleStream = (stream) => {
    setFormData(prev => ({
      ...prev,
      eligibleStreams: prev.eligibleStreams.includes(stream)
        ? prev.eligibleStreams.filter(item => item !== stream)
        : [...prev.eligibleStreams, stream]
    }))
  }
  const toggleQualificationLevel = (level) => {
    setFormData(prev => ({
      ...prev,
      qualificationLevels: prev.qualificationLevels.includes(level)
        ? prev.qualificationLevels.filter(item => item !== level)
        : [...prev.qualificationLevels, level]
    }))
  }
  const toggleQualificationOption = (option) => {
    setFormData(prev => {
      if (option === 'Any') {
        return { ...prev, qualification: prev.qualification.includes('Any') ? [] : ['Any'] }
      }
      const current = prev.qualification.includes('Any') ? [] : prev.qualification
      return {
        ...prev,
        qualification: current.includes(option) ? current.filter(item => item !== option) : [...current, option]
      }
    })
  }
  const togglePassingYearOption = (year) => {
    setFormData(prev => {
      if (year === 'Any') {
        return { ...prev, passingYear: prev.passingYear.includes('Any') ? [] : ['Any'] }
      }
      const current = prev.passingYear.includes('Any') ? [] : prev.passingYear
      return {
        ...prev,
        passingYear: current.includes(year) ? current.filter(item => item !== year) : [...current, year]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.eligibleDegrees || formData.eligibleDegrees.length === 0) {
      alert('Please select at least one Eligibility Criteria degree.')
      return
    }
    try {
      const token = localStorage.getItem('token')
      const payload = {
        ...formData,
        eligibleDegrees: formData.eligibleDegrees.join(', '),
        eligibleStreams: formData.eligibleStreams.join(', '),
        qualificationLevels: formData.qualificationLevels.join(', '),
        customQualificationLevel: formData.customQualificationLevel,
        qualification: formData.qualification.join(', '),
        passingYear: formData.passingYear.join(', '),
        minimumPercentage: formData.minimumPercentage === '' ? null : Number(formData.minimumPercentage),
        minimumCgpa: formData.minimumCgpa === '' ? null : Number(formData.minimumCgpa),
        candidatesRequired: formData.candidatesRequired === '' ? null : Number(formData.candidatesRequired),
      }
      if (editingRequirement) {
        await axios.put(`/api/admin/job-requirements/${editingRequirement.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('/api/admin/job-requirements', payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowModal(false)
      setEditingRequirement(null)
      resetFormData()
      fetchRequirements()
    } catch (error) {
      console.error('Error saving requirement:', error)
      alert(error.response?.data?.message || 'Error saving requirement')
    }
  }

  const resetFormData = () => {
    setFormData({
      requirementId: '',
      companyId: '',
      jobTitle: '',
      jobRole: '',
      jobDescription: '',
      requiredSkills: '',
      technicalSkills: '',
      experienceRequired: '',
      qualification: [],
      passingYear: [],
      jobLocation: '',
      employmentType: '',
      workMode: '',
      minimumSalary: '',
      maximumSalary: '',
      ctc: '',
      numberOfVacancies: '',
      candidatesRequired: '',
      applicationStartDate: '',
      applicationDeadline: '',
      selectionProcess: '',
      additionalInstructions: '',
      eligibleDegrees: [],
      eligibleStreams: [],
      qualificationLevels: [],
      customQualificationLevel: '',
      minimumPercentage: '',
      minimumCgpa: ''
    })
  }

  const handleEdit = (requirement) => {
    setEditingRequirement(requirement)
    setFormData({
      requirementId: requirement.requirementId,
      companyId: requirement.companyId,
      jobTitle: requirement.jobTitle,
      jobRole: requirement.jobRole || '',
      jobDescription: requirement.jobDescription || '',
      requiredSkills: requirement.requiredSkills || '',
      technicalSkills: requirement.technicalSkills || '',
      experienceRequired: requirement.experienceRequired || '',
      qualification: parseMultiValue(requirement.qualification),
      passingYear: parseMultiValue(requirement.passingYear),
      jobLocation: requirement.jobLocation || '',
      employmentType: requirement.employmentType || '',
      workMode: requirement.workMode || '',
      minimumSalary: requirement.minimumSalary || '',
      maximumSalary: requirement.maximumSalary || '',
      ctc: requirement.ctc || '',
      numberOfVacancies: requirement.numberOfVacancies || '',
      candidatesRequired: requirement.candidatesRequired || '',
      applicationStartDate: requirement.applicationStartDate || '',
      applicationDeadline: requirement.applicationDeadline || '',
      selectionProcess: requirement.selectionProcess || '',
      additionalInstructions: requirement.additionalInstructions || '',
      eligibleDegrees: parseCsvList(requirement.eligibleDegrees),
      eligibleStreams: parseCsvList(requirement.eligibleStreams),
      qualificationLevels: parseCsvList(requirement.qualificationLevels),
      customQualificationLevel: requirement.customQualificationLevel || '',
      minimumPercentage: requirement.minimumPercentage ?? '',
      minimumCgpa: requirement.minimumCgpa ?? ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this requirement?')) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/admin/job-requirements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchRequirements()
    } catch (error) {
      console.error('Error deleting requirement:', error)
      alert('Error deleting requirement')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Job Requirement Management</h1>
          <p className="text-gray-600">Manage job requirements for placement drives.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
            {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
          </button>
          <button onClick={() => { setEditingRequirement(null); resetFormData(); setShowModal(true) }} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Requirement
          </button>
        </div>
      </div>

      <div className="pd-shell relative overflow-hidden rounded-2xl bg-white border border-primary-100">
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="relative p-8">
          {requirements.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-primary-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No job requirements found. Click "Add Requirement" to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="pd-table w-full min-w-[900px]">
                <thead>
                  <tr>
                    <th>Requirement ID</th>
                    <th>Company</th>
                    <th>Job Title</th>
                    <th>Location</th>
                    <th>Vacancies</th>
                    <th>Candidates Req.</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.map((requirement) => (
                    <tr key={requirement.id}>
                      <td><span className="pd-id font-mono">{requirement.requirementId}</span></td>
                      <td className="font-semibold text-heading">{requirement.companyName}</td>
                      <td className="font-semibold text-heading">{requirement.jobTitle}</td>
                      <td className="py-4 px-4 text-gray-700">{requirement.jobLocation || 'N/A'}</td>
                      <td className="py-4 px-4 text-gray-700">{requirement.numberOfVacancies || 'N/A'}</td>
                      <td className="py-4 px-4 text-gray-700">{requirement.candidatesRequired || 'N/A'}</td>
                      <td className="py-4 px-4">
                        <span className={`badge ${requirement.status === 'ACTIVE' ? 'st-active' : 'st-closed'}`}>
                          {requirement.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleEdit(requirement)}
                          className="pd-action-btn p-2 text-blue-500 hover:bg-blue-50 rounded-md"
                          title="Edit Requirement"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(requirement.id)}
                          className="pd-action-btn p-2 text-red-500 hover:bg-red-50 rounded-md"
                          title="Delete Requirement"
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

      {/* Job Requirement Form Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-heading">
                {editingRequirement ? 'Edit Job Requirement' : 'Add Job Requirement'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingRequirement(null) }} className="p-2 hover:bg-light-blue rounded-md transition-colors">
                <X className="w-5 h-5 text-body-text" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Requirement ID</label>
                  <input
                    type="text"
                    value={formData.requirementId}
                    onChange={(e) => setFormData({ ...formData, requirementId: e.target.value })}
                    className="input-field"
                    required
                    disabled={editingRequirement}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Company</label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Job Role</label>
                  <input
                    type="text"
                    value={formData.jobRole}
                    onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4 col-span-2">
                  <label className="block text-body-text text-sm font-medium mb-2">Qualification</label>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-light-blue rounded-lg">
                    {qualificationOptions.map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.qualification.includes(option)}
                          onChange={() => toggleQualificationOption(option)}
                          className="w-4 h-4 text-primary rounded"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-4 col-span-2">
                  <label className="block text-body-text text-sm font-medium mb-2">Passing Year</label>
                  <div className="grid grid-cols-4 gap-2 p-3 bg-light-blue rounded-lg">
                    {passingYearOptions.map((year) => (
                      <label key={year} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.passingYear.includes(year)}
                          onChange={() => togglePassingYearOption(year)}
                          className="w-4 h-4 text-primary rounded"
                        />
                        <span className="text-sm">{year}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Job Location</label>
                  <input
                    type="text"
                    value={formData.jobLocation}
                    onChange={(e) => setFormData({ ...formData, jobLocation: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Employment Type</label>
                  <input
                    type="text"
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Work Mode</label>
                  <input
                    type="text"
                    value={formData.workMode}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Number of Vacancies</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfVacancies}
                    onChange={(e) => setFormData({ ...formData, numberOfVacancies: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Number of Candidates Required</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.candidatesRequired}
                    onChange={(e) => setFormData({ ...formData, candidatesRequired: e.target.value })}
                    className="input-field"
                    placeholder="Auto-close drive when filled"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Minimum Salary</label>
                  <input
                    type="number"
                    value={formData.minimumSalary}
                    onChange={(e) => setFormData({ ...formData, minimumSalary: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Maximum Salary</label>
                  <input
                    type="number"
                    value={formData.maximumSalary}
                    onChange={(e) => setFormData({ ...formData, maximumSalary: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">CTC</label>
                  <input
                    type="number"
                    value={formData.ctc}
                    onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Application Start Date</label>
                  <input
                    type="date"
                    value={formData.applicationStartDate}
                    onChange={(e) => setFormData({ ...formData, applicationStartDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Application Deadline</label>
                  <input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Job Description</label>
                <textarea
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Required Skills</label>
                <textarea
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  className="input-field"
                  rows="2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Technical Skills</label>
                <textarea
                  value={formData.technicalSkills}
                  onChange={(e) => setFormData({ ...formData, technicalSkills: e.target.value })}
                  className="input-field"
                  rows="2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Experience Required</label>
                <input
                  type="text"
                  value={formData.experienceRequired}
                  onChange={(e) => setFormData({ ...formData, experienceRequired: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Eligibility Criteria <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-light-blue rounded-lg">
                  {degreeGroups.map((group) => (
                    <div key={group.label} className="col-span-2">
                      <p className="text-xs font-semibold text-gray-500 mb-1">{group.label}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {group.options.map((degree) => (
                          <label key={degree} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.eligibleDegrees.includes(degree)}
                              onChange={() => toggleDegree(degree)}
                              className="w-4 h-4 text-primary rounded"
                            />
                            <span className="text-sm">{degree}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {formData.eligibleDegrees.some(degree => degree !== ANY_DEGREE_OPTION) && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-body-text mb-2">Streams</p>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-light-blue rounded-lg max-h-40 overflow-y-auto">
                      {streamOptions.map((stream) => (
                        <label key={stream} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.eligibleStreams.includes(stream)}
                            onChange={() => toggleStream(stream)}
                            className="w-4 h-4 text-primary rounded"
                          />
                          <span className="text-sm">{stream}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3">
                  <p className="text-sm font-medium text-body-text mb-2">Qualification Level (% / CGPA)</p>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-light-blue rounded-lg">
                    {qualificationLevelOptions.map((level) => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.qualificationLevels.includes(level)}
                          onChange={() => toggleQualificationLevel(level)}
                          className="w-4 h-4 text-primary rounded"
                        />
                        <span className="text-sm">{level}</span>
                      </label>
                    ))}
                  </div>
                  {formData.qualificationLevels.includes('Other') && (
                    <input
                      type="text"
                      value={formData.customQualificationLevel}
                      onChange={(e) => setFormData({ ...formData, customQualificationLevel: e.target.value })}
                      className="input-field mt-2"
                      placeholder="Specify qualification level"
                    />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-body-text text-sm font-medium mb-1">Minimum Percentage</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.minimumPercentage}
                      onChange={(e) => setFormData({ ...formData, minimumPercentage: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-body-text text-sm font-medium mb-1">Minimum CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={formData.minimumCgpa}
                      onChange={(e) => setFormData({ ...formData, minimumCgpa: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Selection Process</label>
                <textarea
                  value={formData.selectionProcess}
                  onChange={(e) => setFormData({ ...formData, selectionProcess: e.target.value })}
                  className="input-field"
                  rows="2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Additional Instructions</label>
                <textarea
                  value={formData.additionalInstructions}
                  onChange={(e) => setFormData({ ...formData, additionalInstructions: e.target.value })}
                  className="input-field"
                  rows="2"
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                {editingRequirement ? 'Update Requirement' : 'Create Requirement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobRequirementManagement
