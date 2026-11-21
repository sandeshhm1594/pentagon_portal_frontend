import React, { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Star,
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Menu,
  X,
  User,
  RefreshCw, CheckCircle2, AlertCircle
} from 'lucide-react'
import axios from 'axios'
import { apiFile } from '../../api'

const PlacementDrives = () => {
  const [drives, setDrives] = useState([])
  const [student, setStudent] = useState(null)
  const [appliedDriveIds, setAppliedDriveIds] = useState([])
  const [resumeFile, setResumeFile] = useState(null)
  const [selectedDriveForTracking, setSelectedDriveForTracking] = useState(null)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }
  const outletContext = useOutletContext()
  const sidebarOpen = outletContext?.sidebarOpen ?? true
  const setSidebarOpen = outletContext?.setSidebarOpen ?? (() => {})
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchDrives()
    fetchStudent()
    fetchAppliedDrives()
  }, [])

  const fetchDrives = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/student/placement-drives', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDrives(response.data)
    } catch (error) {
      console.error('Error fetching drives:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudent = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/student/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudent(response.data)
    } catch (error) {
      console.error('Error fetching student:', error)
    }
  }

  const fetchAppliedDrives = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/student/placement-applications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const appliedIds = response.data.map(app => app.placementDriveId)
      setAppliedDriveIds(appliedIds)
      console.log('Applied drive IDs:', appliedIds)
    } catch (error) {
      console.error('Error fetching applied drives:', error)
    }
  }

  const handleApply = async (driveId) => {
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      if (resumeFile) {
        formData.append('resume', resumeFile)
      }
      
      await axios.post(`/api/student/placement-drives/${driveId}/apply`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      showToast('Applied successfully! The placement team will contact you soon.')
      setResumeFile(null)
      fetchAppliedDrives()
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to apply', 'error')
    }
  }

  const checkEligibility = (drive) => {
    const mockRating = student?.overallMockRating || 0
    const minRating = drive.minimumMockRating
    
    if (!minRating) {
      return true
    }
    
    return mockRating >= minRating
  }

  const handleTrackStatus = async (driveId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/student/placement-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const application = response.data.find(app => app.placementDriveId === driveId)
      if (application) {
        setSelectedDriveForTracking(application)
        setShowTrackingModal(true)
      }
    } catch (error) {
      console.error('Error fetching application status:', error)
    }
  }

  const getStatusPipeline = (currentStatus) => {
    if (!currentStatus) {
      currentStatus = 'PENDING'
    }
    
    const pipeline = [
      { status: 'PENDING', label: 'Application Submitted', description: 'Your application has been received and is pending review.' },
      { status: 'UNDER_REVIEW', label: 'Under Review', description: 'Your application is being reviewed by the placement team.' },
      { status: 'SHORTLISTED', label: 'Shortlisted', description: 'Congratulations! You have been shortlisted for the drive.' },
      { status: 'IN_PROGRESS', label: 'Interview Process', description: 'Interview rounds are in progress.' },
      { status: 'SELECTED', label: 'Selected', description: 'You have been selected for the position.' },
      { status: 'PLACED', label: 'Placed', description: 'Congratulations! You have been placed.' },
      { status: 'REJECTED', label: 'Rejected', description: 'Unfortunately, your application was not selected.' },
      { status: 'WITHDRAWN', label: 'Withdrawn', description: 'You have withdrawn your application.' }
    ]

    const statusOrder = ['PENDING', 'UNDER_REVIEW', 'SHORTLISTED', 'IN_PROGRESS', 'SELECTED', 'PLACED']
    const currentIndex = statusOrder.indexOf(currentStatus)
    
    // If status is PLACED, filter out REJECTED and WITHDRAWN
    if (currentStatus === 'PLACED') {
      return pipeline.filter(s => s.status !== 'REJECTED' && s.status !== 'WITHDRAWN').map(stage => {
        const stageIndex = statusOrder.indexOf(stage.status)
        const isCompleted = stageIndex < currentIndex && stageIndex !== -1
        const isCurrent = stage.status === currentStatus
        
        return {
          ...stage,
          completed: isCompleted,
          current: isCurrent
        }
      })
    }
    
    // If status is REJECTED or WITHDRAWN, only show stages up to and including that status
    if (currentStatus === 'REJECTED' || currentStatus === 'WITHDRAWN') {
      const rejectedIndex = pipeline.findIndex(s => s.status === currentStatus)
      return pipeline.slice(0, rejectedIndex + 1).map(stage => {
        const stageIndex = statusOrder.indexOf(stage.status)
        const isCompleted = stageIndex < currentIndex && stageIndex !== -1
        const isCurrent = stage.status === currentStatus
        
        return {
          ...stage,
          completed: isCompleted,
          current: isCurrent
        }
      })
    }
    
    // Default behavior for other statuses
    return pipeline.map(stage => {
      const stageIndex = statusOrder.indexOf(stage.status)
      const isCompleted = stageIndex < currentIndex && stageIndex !== -1
      const isCurrent = stage.status === currentStatus
      
      return {
        ...stage,
        completed: isCompleted,
        current: isCurrent
      }
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Placement Drives</h1>
          <p className="text-gray-600">View and apply to placement drives</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { fetchDrives(); fetchAppliedDrives(); }}
            className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1"
            title="Refresh Drives"
          >
            <RefreshCw className="w-5 h-5 text-heading" />
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
            {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
          </button>
        </div>
      </div>

      {/* Your Mock Rating */}
      <div className="card mb-6 bg-gradient-to-r from-primary-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-text text-sm mb-1">Your Mock Interview Rating</p>
            <p className="text-3xl font-bold text-heading">
              {student?.overallMockRating || 'N/A'} / 10
            </p>
          </div>
          <div className="p-4 rounded-xl bg-primary">
            <Star className="w-10 h-10 text-white" />
          </div>
        </div>
      </div>

      {/* Drives List */}
      {drives.length === 0 ? (
        <div className="card">
          <p className="text-body-text text-center py-8">No placement drives available at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {drives.map((drive) => {
                const isEligible = checkEligibility(drive)
                const hasApplied = appliedDriveIds.includes(drive.id)
                return (
                  <div key={drive.id} className="relative group">
                    <div className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-r from-primary-500/15 via-blue-500/10 to-emerald-500/15 blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-500" aria-hidden="true" />
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-400/20 blur-3xl" aria-hidden="true" />
                    <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-blue-400/15 blur-3xl" aria-hidden="true" />
                    <div className="card relative overflow-hidden border border-primary-200 shadow-[0_24px_70px_-30px_rgba(53,6,62,0.45)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_32px_90px_-30px_rgba(53,6,62,0.55)]">
                      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary-500 via-blue-500 to-emerald-500" aria-hidden="true" />
                      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary-200/30 blur-3xl pointer-events-none" aria-hidden="true" />
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {drive.companyLogo && (
                          <img 
                            src={apiFile(drive.companyLogo)} 
                            alt={drive.companyName}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-heading mb-1">{drive.driveTitle}</h3>
                          <p className="text-body-text flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {drive.companyName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEligible ? (
                          <span className="badge badge-success flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Eligible
                          </span>
                        ) : (
                          <span className="badge badge-danger flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            Not Eligible
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-body-text">
                        <MapPin className="w-4 h-4" />
                        <span>{drive.interviewLocation || 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-body-text">
                        <Calendar className="w-4 h-4" />
                        <span>Drive Date: {drive.driveDate ? new Date(drive.driveDate).toLocaleDateString() : 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-body-text">
                        <Clock className="w-4 h-4" />
                        <span>Application Deadline: {drive.applicationEndDate ? new Date(drive.applicationEndDate).toLocaleDateString() : 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-body-text">
                        <span className="font-semibold">Status:</span>
                        <span className={`badge ${
                          drive.status === 'APPLICATION_OPEN' ? 'badge-success' :
                          drive.status === 'PUBLISHED' ? 'badge-warning' :
                          'badge-secondary'
                        }`}>
                          {drive.status?.replace('_', ' ') || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-semibold text-heading mb-2">Job Position</p>
                      <p className="text-body-text">{drive.jobPosition || drive.jobTitle || 'N/A'}</p>
                    </div>

                    {drive.requiredSkills && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-heading mb-2">Required Skills</p>
                        <p className="text-body-text">{drive.requiredSkills}</p>
                      </div>
                    )}

                    {drive.minimumMockRating !== null && drive.minimumMockRating !== undefined && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-heading mb-2">Minimum Mock Rating Required</p>
                        <p className="text-body-text">{drive.minimumMockRating} / 10</p>
                      </div>
                    )}

                    {drive.eligibilityCriteria && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-heading mb-2">Eligibility Criteria</p>
                        <p className="text-body-text">{drive.eligibilityCriteria}</p>
                      </div>
                    )}

                    {!hasApplied && isEligible && drive.status === 'APPLICATION_OPEN' && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-heading mb-2">Upload Resume (PDF/DOCX)</p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setResumeFile(e.target.files[0])}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {resumeFile && (
                          <p className="text-sm text-body-text mt-1">Selected: {resumeFile.name}</p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      {hasApplied ? (
                        <>
                          <button
                            onClick={() => handleTrackStatus(drive.id)}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-500/30 hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Track Status
                          </button>
                          <button
                            disabled
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold shadow-md opacity-60 cursor-not-allowed"
                          >
                            Applied
                          </button>
                        </>
                      ) : isEligible && drive.status === 'APPLICATION_OPEN' ? (
                        <button
                          onClick={() => handleApply(drive.id)}
                          className="btn-primary font-['Aptos',sans-serif]"
                        >
                          Apply Now
                        </button>
                      ) : (
                        <button
                          disabled
                          className="btn-secondary opacity-50 cursor-not-allowed font-['Aptos',sans-serif]"
                        >
                          {!isEligible ? 'Not Eligible to Apply' : 'Applications Not Open'}
                        </button>
                      )}
                    </div>
                  </div>
                  </div>
                )
              })}
            </div>
          )}

      {/* Status Tracking Modal */}
      {showTrackingModal && selectedDriveForTracking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowTrackingModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-primary-100">
              <h2 className="text-xl font-bold text-heading">Application Status</h2>
              <button
                onClick={() => setShowTrackingModal(false)}
                className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-heading mb-2">
                {selectedDriveForTracking.placementDriveTitle}
              </h3>
              <p className="text-body-text">Applied on: {selectedDriveForTracking.appliedAt ? new Date(selectedDriveForTracking.appliedAt).toLocaleDateString() : 'N/A'}</p>
            </div>

            {/* Status Pipeline */}
            <div className="mt-6">
              <div className="relative">
                {/* Progress Line Background - Hide if PLACED */}
                {selectedDriveForTracking.status !== 'PLACED' && (
                  <>
                    <div className="absolute top-6 left-0 right-0 h-2 bg-gray-200 rounded-full"></div>
                    
                    {/* Progress Line Fill */}
                    <div 
                      className="absolute top-6 left-0 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(getStatusPipeline(selectedDriveForTracking.status).filter(s => s.completed).length / (getStatusPipeline(selectedDriveForTracking.status).length - 1)) * 100}%` 
                      }}
                    ></div>
                  </>
                )}
                
                {/* Stages */}
                <div className="flex items-center justify-between relative">
                  {getStatusPipeline(selectedDriveForTracking.status).map((stage, index) => (
                    <div key={stage.status} className="flex flex-col items-center flex-1 relative z-10">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-lg transition-all duration-300 ${
                        stage.completed ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white transform scale-110' : 
                        stage.current && selectedDriveForTracking.status === 'REJECTED' ? 'bg-gradient-to-br from-red-300 to-red-500 border-red-400 text-white transform scale-110' :
                        stage.current && selectedDriveForTracking.status === 'WITHDRAWN' ? 'bg-gradient-to-br from-orange-300 to-orange-500 border-orange-400 text-white transform scale-110' :
                        stage.current && selectedDriveForTracking.status !== 'PLACED' ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-500 text-white transform scale-110 animate-pulse' : 
                        stage.current && selectedDriveForTracking.status === 'PLACED' ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white transform scale-110' :
                        'bg-white border-gray-300 text-gray-400'
                      }`}>
                        {stage.completed ? <CheckCircle className="w-7 h-7" /> : 
                         stage.current ? <CheckCircle className="w-7 h-7" /> : 
                         <span className="text-lg font-bold">{index + 1}</span>}
                      </div>
                      <div className="mt-3 text-center max-w-[120px]">
                        <p className={`text-xs font-bold mb-1 ${
                          stage.current && selectedDriveForTracking.status === 'REJECTED' ? 'text-red-600' :
                          stage.current && selectedDriveForTracking.status === 'WITHDRAWN' ? 'text-orange-600' :
                          stage.current ? 'text-green-600' : 
                          stage.completed ? 'text-green-600' : 
                          'text-gray-400'
                        }`}>
                          {stage.label}
                        </p>
                        {stage.current && (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            selectedDriveForTracking.status === 'PLACED' ? 'bg-green-100 text-green-700' :
                            selectedDriveForTracking.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            selectedDriveForTracking.status === 'WITHDRAWN' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {selectedDriveForTracking.status === 'PLACED' ? 'Completed' : 
                             selectedDriveForTracking.status === 'REJECTED' ? 'Rejected' :
                             selectedDriveForTracking.status === 'WITHDRAWN' ? 'Withdrawn' :
                             'Current'}
                          </span>
                        )}
                        {stage.completed && !stage.current && (
                          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold">
                            Done
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Current Stage Description */}
              <div className={`mt-8 p-5 rounded-xl border-2 shadow-sm ${
                selectedDriveForTracking.status === 'PLACED' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                selectedDriveForTracking.status === 'REJECTED' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200' :
                selectedDriveForTracking.status === 'WITHDRAWN' ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200' :
                'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedDriveForTracking.status === 'PLACED' ? 'bg-green-100' :
                    selectedDriveForTracking.status === 'REJECTED' ? 'bg-red-100' :
                    selectedDriveForTracking.status === 'WITHDRAWN' ? 'bg-orange-100' :
                    'bg-blue-100'
                  }`}>
                    {selectedDriveForTracking.status === 'PLACED' ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> : 
                      selectedDriveForTracking.status === 'REJECTED' ?
                      <XCircle className="w-5 h-5 text-red-600" /> :
                      selectedDriveForTracking.status === 'WITHDRAWN' ?
                      <Clock className="w-5 h-5 text-orange-600" /> :
                      <Clock className="w-5 h-5 text-blue-600" />
                    }
                  </div>
                  <div>
                    <h4 className={`font-bold mb-1 ${
                      selectedDriveForTracking.status === 'PLACED' ? 'text-green-800' :
                      selectedDriveForTracking.status === 'REJECTED' ? 'text-red-800' :
                      selectedDriveForTracking.status === 'WITHDRAWN' ? 'text-orange-800' :
                      'text-blue-800'
                    }`}>
                      {selectedDriveForTracking.status === 'PLACED' ? 'Final Status' : 
                       selectedDriveForTracking.status === 'REJECTED' ? 'Application Status' :
                       selectedDriveForTracking.status === 'WITHDRAWN' ? 'Application Status' :
                       'Current Status'}
                    </h4>
                    <p className={`text-sm ${
                      selectedDriveForTracking.status === 'PLACED' ? 'text-green-700' :
                      selectedDriveForTracking.status === 'REJECTED' ? 'text-red-700' :
                      selectedDriveForTracking.status === 'WITHDRAWN' ? 'text-orange-700' :
                      'text-blue-700'
                    }`}>
                      {getStatusPipeline(selectedDriveForTracking.status).find(s => s.current)?.description || 
                       getStatusPipeline(selectedDriveForTracking.status).find(s => s.completed)?.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[400] animate-in slide-in-from-right fade-in duration-300">
          <div className={`flex items-center gap-3 min-w-[300px] max-w-sm rounded-xl border-l-4 shadow-xl p-4 ${toast.type === 'success' ? 'bg-white border-emerald-500' : 'bg-white border-red-500'}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-50' : 'bg-red-50'}`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
            </div>
            <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-gray-800' : 'text-red-700'}`}>{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlacementDrives
