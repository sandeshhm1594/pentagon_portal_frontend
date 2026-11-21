import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Menu, 
  X, 
  LogOut, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  Search,
  ChevronDown,
  Download,
  FileText
} from 'lucide-react'
import axios from 'axios'
import { apiFile } from '../../api'

const Applications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [summaryStudentId, setSummaryStudentId] = useState('')
  const [summaryStudentSearch, setSummaryStudentSearch] = useState('')
  const [summaryFromDate, setSummaryFromDate] = useState('')
  const [summaryToDate, setSummaryToDate] = useState('')
  const [requirementsPopupStudent, setRequirementsPopupStudent] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  const buildEducationLines = (s) => {
    if (!s) return []
    const lines = []
    if (s.tenthPercentage) lines.push(`10th: ${s.tenthPercentage}`)
    if (s.twelfthDiplomaPercentage) lines.push(`12th/Diploma: ${s.twelfthDiplomaPercentage}`)
    if (s.bachelorsDegree) {
      lines.push(`Bachelors: ${[s.bachelorsDegree, s.bachelorsStream, s.bachelorsPercentage, s.bachelorsCgpa ? `CGPA ${s.bachelorsCgpa}` : ''].filter(Boolean).join(' | ')}`)
    }
    if (s.mastersDegree) {
      lines.push(`Masters: ${[s.mastersDegree, s.mastersStream, s.mastersPercentage, s.mastersCgpa ? `CGPA ${s.mastersCgpa}` : ''].filter(Boolean).join(' | ')}`)
    }
    if (!s.bachelorsDegree && !s.mastersDegree && s.degree) {
      lines.push(`Education: ${[s.degree, s.stream].filter(Boolean).join(' - ')}`)
    }
    if (s.collegeName) lines.push(`College: ${s.collegeName}`)
    return lines
  }

  const [openDropdown, setOpenDropdown] = useState(null)
  const { sidebarOpen, setSidebarOpen } = useOutletContext()
  const { logout } = useAuth()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/placement-applications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Applications data:', response.data)
      setApplications(response.data)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/admin/placement-applications/${applicationId}/status`, null, {
        params: { status: newStatus },
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchApplications()
      setOpenDropdown(null)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const handleDownloadResume = async (applicationId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/admin/placement-applications/${applicationId}/resume`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition']
      let filename = `resume_${applicationId}`
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }
      
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading resume:', error)
      alert('Failed to download resume')
    }
  }

  const handleViewResume = async (applicationId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/admin/placement-applications/${applicationId}/resume`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error viewing resume:', error)
      alert('Failed to view resume')
    }
  }

  const getNextStatuses = (currentStatus) => {
    const allStatuses = ['PENDING', 'UNDER_REVIEW', 'SHORTLISTED', 'IN_PROGRESS', 'SELECTED', 'PLACED', 'REJECTED', 'WITHDRAWN']
    return allStatuses.filter(status => status !== currentStatus)
  }

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'ALL' || app.status === filter
    const matchesSearch = app.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const studentOptions = Array.from(
    applications.reduce((map, app) => {
      if (app.studentId != null && !map.has(app.studentId)) {
        map.set(app.studentId, {
          id: app.studentId,
          name: app.studentName || 'Unknown Student',
          code: app.studentCode || ''
        })
      }
      return map
    }, new Map()).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  const matchesSummaryDateRange = (dateValue) => {
    if (!summaryFromDate && !summaryToDate) return true
    if (!dateValue) return false

    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return false

    if (summaryFromDate) {
      const fromDate = new Date(`${summaryFromDate}T00:00:00`)
      if (date < fromDate) return false
    }

    if (summaryToDate) {
      const toDate = new Date(`${summaryToDate}T23:59:59.999`)
      if (date > toDate) return false
    }

    return true
  }

  const summaryApplications = applications.filter(app => matchesSummaryDateRange(app.appliedAt))
  const selectedStudentApplications = summaryStudentId
    ? summaryApplications.filter(app => String(app.studentId) === String(summaryStudentId))
    : []

  const studentRequirementCounts = summaryStudentId
    ? []
    : Array.from(
        summaryApplications.reduce((map, app) => {
          if (app.studentId == null) return map
          if (!map.has(app.studentId)) {
            map.set(app.studentId, {
              id: app.studentId,
              name: app.studentName || 'Unknown Student',
              code: app.studentCode || '',
              count: 0
            })
          }
          map.get(app.studentId).count += 1
          return map
        }, new Map()).values()
      ).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  const normalizedSummaryStudentSearch = summaryStudentSearch.trim().toLowerCase()
  const matchesSummaryStudentSearch = (student) => {
    if (!normalizedSummaryStudentSearch) return true
    return [student.id, student.code, student.name]
      .some(value => String(value || '').toLowerCase().includes(normalizedSummaryStudentSearch))
  }
  const filteredStudentOptions = studentOptions.filter(matchesSummaryStudentSearch)
  const filteredStudentRequirementCounts = studentRequirementCounts.filter(matchesSummaryStudentSearch)
  const popupStudentApplications = requirementsPopupStudent
    ? summaryApplications.filter(app => String(app.studentId) === String(requirementsPopupStudent.id))
    : []

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'UNDER_REVIEW': return 'bg-primary-100 text-primary-800'
      case 'SHORTLISTED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800'
      case 'SELECTED': return 'bg-green-100 text-green-800'
      case 'PLACED': return 'bg-emerald-100 text-emerald-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-heading">Placement Applications</h1>
          <p className="text-body-text">Manage student applications for placement drives</p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 bg-card-bg rounded-lg shadow-card border border-primary-200 hover:bg-primary-50 transition-colors">
          {sidebarOpen ? <X className="w-5 h-5 text-heading" /> : <Menu className="w-5 h-5 text-heading" />}
        </button>
      </div>

      {/* Student Requirement Summary */}
      <div className="card mb-6">
        <div className="flex flex-col xl:flex-row xl:items-end gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-heading flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Student Requirement Summary
            </h2>
            <p className="text-sm text-body-text mt-1">
              See how many placement requirements each student has applied to within a date range.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 w-full xl:w-auto">
            <div>
              <label className="block text-sm font-medium text-body-text mb-1">Student</label>
              <select
                value={summaryStudentId}
                onChange={(e) => setSummaryStudentId(e.target.value)}
                className="input-field"
              >
                <option value="">All Students</option>
                {filteredStudentOptions.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}{student.code ? ` (${student.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-body-text mb-1">Search Student</label>
              <input
                type="text"
                value={summaryStudentSearch}
                onChange={(e) => setSummaryStudentSearch(e.target.value)}
                placeholder="Search by student ID..."
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body-text mb-1">From Date</label>
              <input
                type="date"
                value={summaryFromDate}
                onChange={(e) => setSummaryFromDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body-text mb-1">To Date</label>
              <input
                type="date"
                value={summaryToDate}
                onChange={(e) => setSummaryToDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {summaryStudentId ? (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm text-body-text">Requirements given:</span>
              <span className="text-3xl font-bold text-primary">{selectedStudentApplications.length}</span>
            </div>
            {selectedStudentApplications.length === 0 ? (
              <p className="text-sm text-body-text">No requirements found for this student in the selected date range.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedStudentApplications.map(app => (
                  <div key={app.id} className="rounded-xl border border-primary-100 bg-primary-50/40 p-4">
                    <p className="font-semibold text-heading">{app.driveTitle || 'Placement Drive'}</p>
                    <p className="text-sm text-body-text">{app.companyName || 'Company not specified'}</p>
                    <p className="text-xs text-body-text mt-1">
                      Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {filteredStudentRequirementCounts.length === 0 ? (
              <p className="text-sm text-body-text">No student requirement data found for the selected search and date range.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="pd-table w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="border-b border-primary-100 text-left text-body-text">
                      <th className="py-2 pr-4 font-semibold">Student</th>
                      <th className="py-2 pr-4 font-semibold">Code</th>
                      <th className="py-2 font-semibold">Requirements Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudentRequirementCounts.map(student => (
                      <tr key={student.id} className="border-b border-primary-50">
                        <td className="py-2 pr-4 text-heading">{student.name}</td>
                        <td className="py-2 pr-4 text-body-text">{student.code || 'N/A'}</td>
                        <td className="py-2">
                          <button
                            onClick={() => setRequirementsPopupStudent(student)}
                            className="inline-flex items-center justify-center min-w-[2rem] rounded-full bg-primary-100 px-2 py-1 text-sm font-bold text-primary-700 hover:bg-primary-200 transition-colors"
                            title="View requirements"
                          >
                            {student.count}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by student or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['ALL', 'PENDING', 'UNDER_REVIEW', 'SHORTLISTED', 'IN_PROGRESS', 'SELECTED', 'REJECTED', 'PLACED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="card">
          <p className="text-body-text text-center py-8">Loading applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="card">
          <p className="text-body-text text-center py-8">No applications found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApplications.map((app) => (
            <div key={app.id} className={`pa-card p-6 ${openDropdown === app.id ? 'z-30' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="flex items-start gap-4 flex-1 min-w-[260px]">
                  {app.profileImage ? (
                    <img src={apiFile(app.profileImage)} alt={app.studentName} onClick={() => setPhotoPreview({
              src: app.profileImage,
              name: app.studentName,
              details: [
                { label: 'Student Code', value: app.studentCode },
                { label: 'Company', value: app.companyName },
                { label: 'Drive', value: app.driveTitle },
                { label: 'Status', value: app.status?.replace(/_/g, ' ') },
                { label: 'Applied On', value: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '-' }
              ],
              education: buildEducationLines(app)
            })} className="w-14 h-14 rounded-2xl object-cover shadow-lg shadow-primary-500/30 shrink-0 border border-primary-100 cursor-zoom-in hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-violet-500 flex items-center justify-center shadow-lg shadow-primary-500/30 shrink-0">
                      <span className="text-white font-extrabold text-lg">
                        {(app.studentName || 'S').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-lg font-extrabold text-heading truncate">{app.studentName}</h3>
                    <p className="text-xs font-bold text-primary-600 tracking-wide mt-0.5">{app.studentCode || 'No code'}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`badge ${getStatusColor(app.status)} !font-extrabold tracking-wide border border-white/30 shadow-md`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-body-text">
                        Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 min-w-[280px]">
                  <div className="rounded-xl bg-white/70 border border-primary-100 px-3 py-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-body-text/70">Company</p>
                    <p className="text-sm font-bold text-heading truncate">{app.companyName}</p>
                  </div>
                  <div className="rounded-xl bg-white/70 border border-primary-100 px-3 py-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-body-text/70">Drive</p>
                    <p className="text-sm font-bold text-heading truncate">{app.driveTitle}</p>
                  </div>
                  <div className="rounded-xl bg-white/70 border border-primary-100 px-3 py-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-body-text/70">Applied On</p>
                    <p className="text-sm font-bold text-heading">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-primary-100/70">
                {app.resumeUrl && (
                  <>
                    {app.resumeUrl?.toLowerCase().endsWith('.pdf') && (
                      <button
                        onClick={() => handleViewResume(app.id)}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold shadow-md shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                        title="View Resume"
                      >
                        <FileText className="w-4 h-4" />
                        View Resume
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadResume(app.id)}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 text-white text-sm font-bold shadow-md shadow-sky-500/30 hover:shadow-lg hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                      title="Download Resume"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </>
                )}
                {getNextStatuses(app.status).length > 0 && (
                  <div className="relative ml-auto">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === app.id ? null : app.id)}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-400 text-white text-sm font-bold shadow-md shadow-primary-500/30 hover:shadow-lg hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                    >
                      Change Status
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {openDropdown === app.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-primary-200 z-20 overflow-hidden">
                        {getNextStatuses(app.status).map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(app.id, status)}
                            className="w-full px-4 py-2.5 text-left text-sm font-semibold text-heading hover:bg-primary-50 border-b border-primary-50 last:border-0 transition-colors"
                          >
                            {status.replace(/_/g, ' ')}
                          </button>
                        ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {requirementsPopupStudent && (
        <div className="ps-overlay fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="pa-card ps-pop w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-violet-500 flex items-center justify-center shadow-lg shadow-primary-500/30 shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-heading">Requirements for {requirementsPopupStudent.name}</h2>
                  <p className="text-sm font-bold text-primary-600">{requirementsPopupStudent.code || 'No code'}</p>
                </div>
              </div>
              <button onClick={() => setRequirementsPopupStudent(null)} className="p-2 rounded-full bg-gradient-to-br from-primary-600 to-violet-500 text-white shadow-md shadow-primary-500/30 hover:scale-110 hover:rotate-90 transition-all duration-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 pb-6">
              {popupStudentApplications.length === 0 ? (
                <p className="text-sm text-body-text text-center py-6">No requirements found for this student in the selected date range.</p>
              ) : (
                <div className="space-y-3">
                  {popupStudentApplications.map(app => (
                    <div key={app.id} className="rounded-xl bg-white/80 border border-primary-100 px-4 py-3 flex items-start justify-between gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                      <div>
                        <p className="font-bold text-heading">{app.driveTitle || 'Placement Drive'}</p>
                        <p className="text-sm text-body-text">{app.companyName || 'Company not specified'}</p>
                        <p className="text-xs text-body-text mt-1">
                          Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <span className={`badge ${getStatusColor(app.status)} !font-bold border border-primary-100 shadow-sm shrink-0`}>
                        {app.status?.replace(/_/g, ' ') || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Photo Preview Lightbox */}
      {photoPreview && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPhotoPreview(null)}>
          <div className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPhotoPreview(null)} className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white shadow-lg text-gray-600 hover:text-red-500 flex items-center justify-center transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-2/5 shrink-0">
                <img src={photoPreview.src} alt={photoPreview.name} className="w-full rounded-xl object-cover max-h-[60vh] mx-auto" />
              </div>
              <div className="sm:w-3/5 min-w-0">
                <p className="text-center sm:text-left font-bold text-heading text-lg">{photoPreview.name}</p>
                {photoPreview.details && photoPreview.details.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                    {photoPreview.details.map(d => (
                      <div key={d.label} className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-body-text">{d.label}</p>
                        <p className="text-sm font-medium text-heading truncate">{d.value || '-'}</p>
                      </div>
                    ))}
                  </div>
                )}
                {photoPreview.education && photoPreview.education.length > 0 && (
                  <div className="mt-3 border-t border-primary-100 pt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-body-text mb-1.5">Education</p>
                    <div className="space-y-1">
                      {photoPreview.education.map((line, i) => (
                        <p key={i} className="text-sm font-medium text-heading">{line}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}

export default Applications
