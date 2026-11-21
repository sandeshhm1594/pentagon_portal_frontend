import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Edit, Trash2, Menu, X, Calendar, MapPin, Users, CheckCircle, Clock, AlertCircle, AlertTriangle, Play, Square, Flag, Download, UserPlus, Search, Mail, Briefcase } from 'lucide-react'
import axios from 'axios'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { apiFile } from '../../api'

const PlacementDriveManagement = () => {
  const [drives, setDrives] = useState([])
  const [companies, setCompanies] = useState([])
  const [requirements, setRequirements] = useState([])
  const [courses, setCourses] = useState([])
  const [allBatches, setAllBatches] = useState([])
  const [filteredBatches, setFilteredBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [driveFromDate, setDriveFromDate] = useState('')
  const [driveToDate, setDriveToDate] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false)
  const [selectedDriveForStudents, setSelectedDriveForStudents] = useState(null)
  const [studentSearchCode, setStudentSearchCode] = useState('')
  const [studentSearchBatch, setStudentSearchBatch] = useState('')
  const [showBatchDropdown, setShowBatchDropdown] = useState(false)
  const [studentSearchResults, setStudentSearchResults] = useState([])
  const [studentSearchLoading, setStudentSearchLoading] = useState(false)
  const [studentSearchError, setStudentSearchError] = useState('')
  const [manualReason, setManualReason] = useState('')
  const [manualReasonOther, setManualReasonOther] = useState('')
  const [manualReasonError, setManualReasonError] = useState('')
  const [addingStudentId, setAddingStudentId] = useState(null)
  const [showViewStudentsModal, setShowViewStudentsModal] = useState(false)
  const [viewStudentsDrive, setViewStudentsDrive] = useState(null)
  const [viewStudents, setViewStudents] = useState([])
  const [viewStudentsLoading, setViewStudentsLoading] = useState(false)
  const [deletingAppId, setDeletingAppId] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [toast, setToast] = useState(null)
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

  const [showSendResumeModal, setShowSendResumeModal] = useState(false)
  const [sendResumeDrive, setSendResumeDrive] = useState(null)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [sendingResumes, setSendingResumes] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportStatus, setReportStatus] = useState('ALL')
  const [reportCompany, setReportCompany] = useState('ALL')
  const [reportFromDate, setReportFromDate] = useState('')
  const [reportToDate, setReportToDate] = useState('')
  const [reportSearch, setReportSearch] = useState('')
  const [downloadingReport, setDownloadingReport] = useState(false)
  const [editingDrive, setEditingDrive] = useState(null)
  const [selectedCourses, setSelectedCourses] = useState([])
  const [selectedBatches, setSelectedBatches] = useState([])
  const [formData, setFormData] = useState({
    driveId: '',
    companyId: '',
    jobRequirementId: '',
    driveTitle: '',
    jobPosition: '',
    driveDescription: '',
    eligibilityCriteria: '',
    eligibleCourses: '',
    eligibleBatches: '',
    eligiblePassingYears: '',
    eligibleDegrees: [],
    eligibleStreams: [],
    qualificationLevels: [],
    customQualificationLevel: '',
    minimumPercentage: '',
    minimumCgpa: '',
    minimumMockRating: '',
    minimumProfileReviewRating: '',
    requiredSkills: '',
    requiredDocuments: '',
    driveDate: '',
    applicationStartDate: '',
    applicationEndDate: '',
    interviewLocation: '',
    interviewMode: '',
    selectionProcess: '',
    companyFeedback: '',
    studentsGiven: ''
  })
  const { sidebarOpen, setSidebarOpen } = useOutletContext()
  const { user, logout } = useAuth()

  useEffect(() => {
    fetchDrives()
    fetchCompanies()
    fetchCourses()
    fetchBatches()
  }, [])

  const fetchDrives = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/placement-drives', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDrives(response.data)
    } catch (error) {
      console.error('Error fetching drives:', error)
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

  const fetchRequirements = async (companyId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/admin/job-requirements/company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRequirements(response.data)
    } catch (error) {
      console.error('Error fetching requirements:', error)
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

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/batches', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAllBatches(response.data)
    } catch (error) {
      console.error('Error fetching batches:', error)
    }
  }

  const handleCourseToggle = (courseId) => {
    setSelectedCourses(prev => {
      const newSelection = prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
      
      // Filter batches based on selected courses
      if (newSelection.length > 0) {
        const filtered = allBatches.filter(batch => 
          batch.courseId && newSelection.includes(Number(batch.courseId))
        )
        setFilteredBatches(filtered)
      } else {
        setFilteredBatches([])
      }
      
      return newSelection
    })
  }

  const handleBatchToggle = (batchId) => {
    setSelectedBatches(prev => 
      prev.includes(batchId)
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    )
  }

  const formatDateValue = (value) => {
    if (!value) return ''
    if (Array.isArray(value)) {
      const [year, month, day] = value
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
    return String(value).slice(0, 10)
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
  const parseCsvList = (value) => value ? String(value).split(',').map(item => item.trim()).filter(Boolean) : []
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

  const handleRequirementChange = (e) => {
    const requirementId = e.target.value
    setFormData(prev => ({ ...prev, jobRequirementId: requirementId }))
    if (!requirementId) return

    const req = requirements.find(item => String(item.id) === String(requirementId))
    if (!req) return

    const eligibilityCriteria = [
      req.qualification ? `Qualification: ${req.qualification}` : '',
      req.experienceRequired ? `Experience: ${req.experienceRequired} year(s)` : '',
      req.passingYear ? `Passing Year: ${req.passingYear}` : ''
    ].filter(Boolean).join(' | ')

    setFormData(prev => ({
      ...prev,
      driveTitle: req.jobTitle || prev.driveTitle,
      jobPosition: req.jobRole || req.jobTitle || prev.jobPosition,
      driveDescription: req.jobDescription || prev.driveDescription,
      eligibilityCriteria: eligibilityCriteria || prev.eligibilityCriteria,
      eligibleCourses: req.eligibleCourses || prev.eligibleCourses,
      eligibleBatches: req.eligibleBatches || prev.eligibleBatches,
      eligiblePassingYears: req.passingYear || prev.eligiblePassingYears,
      eligibleDegrees: parseCsvList(req.eligibleDegrees),
      eligibleStreams: parseCsvList(req.eligibleStreams),
      qualificationLevels: parseCsvList(req.qualificationLevels),
      customQualificationLevel: req.customQualificationLevel || '',
      minimumPercentage: req.minimumPercentage ?? '',
      minimumCgpa: req.minimumCgpa ?? '',
      minimumMockRating: req.minimumMockRating !== null && req.minimumMockRating !== undefined ? req.minimumMockRating : prev.minimumMockRating,
      requiredSkills: req.requiredSkills || req.technicalSkills || prev.requiredSkills,
      applicationStartDate: formatDateValue(req.applicationStartDate) || prev.applicationStartDate,
      applicationEndDate: formatDateValue(req.applicationDeadline) || prev.applicationEndDate,
      interviewLocation: req.jobLocation || prev.interviewLocation,
      interviewMode: req.workMode || prev.interviewMode,
      selectionProcess: req.selectionProcess || prev.selectionProcess,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      
      // Convert selected courses and batches to comma-separated strings
      const courseNames = courses
        .filter(c => selectedCourses.includes(c.id))
        .map(c => c.courseName)
        .join(', ')
      
      const batchCodes = allBatches
        .filter(b => selectedBatches.includes(b.id))
        .map(b => b.batchCode)
        .join(', ')
      
      // Convert empty strings to null for numeric fields
      const submissionData = {
        ...formData,
        eligibleCourses: courseNames || formData.eligibleCourses,
        eligibleBatches: batchCodes || formData.eligibleBatches,
        minimumMockRating: formData.minimumMockRating !== '' ? parseFloat(formData.minimumMockRating) : null,
        minimumProfileReviewRating: formData.minimumProfileReviewRating !== '' ? parseFloat(formData.minimumProfileReviewRating) : null,
        eligibleDegrees: formData.eligibleDegrees.join(', '),
        eligibleStreams: formData.eligibleStreams.join(', '),
        qualificationLevels: formData.qualificationLevels.join(', '),
        customQualificationLevel: formData.customQualificationLevel,
        minimumPercentage: formData.minimumPercentage === '' ? null : Number(formData.minimumPercentage),
        minimumCgpa: formData.minimumCgpa === '' ? null : Number(formData.minimumCgpa),
        studentsGiven: formData.studentsGiven === '' ? null : Number(formData.studentsGiven)
      }
      
      console.log('Submitting drive data:', submissionData)
      
      if (editingDrive) {
        await axios.put(`/api/admin/placement-drives/${editingDrive.id}`, submissionData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('/api/admin/placement-drives', submissionData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowModal(false)
      setEditingDrive(null)
      setSelectedCourses([])
      setSelectedBatches([])
      resetFormData()
      fetchDrives()
    } catch (error) {
      console.error('Error saving drive:', error)
      alert(error.response?.data?.message || 'Error saving drive')
    }
  }

  const resetFormData = () => {
    setFormData({
      driveId: '',
      companyId: '',
      jobRequirementId: '',
      driveTitle: '',
      jobPosition: '',
      driveDescription: '',
      eligibilityCriteria: '',
      eligibleCourses: '',
      eligibleBatches: '',
      eligiblePassingYears: '',
      eligibleDegrees: [],
      eligibleStreams: [],
      qualificationLevels: [],
      customQualificationLevel: '',
      minimumPercentage: '',
      minimumCgpa: '',
      minimumMockRating: '',
      minimumProfileReviewRating: '',
      requiredSkills: '',
      requiredDocuments: '',
      driveDate: '',
      applicationStartDate: '',
      applicationEndDate: '',
      interviewLocation: '',
      interviewMode: '',
      selectionProcess: '',
      companyFeedback: '',
      studentsGiven: ''
    })
  }

  const handleEdit = (drive) => {
    setEditingDrive(drive)
    setFormData({
      driveId: drive.driveId,
      companyId: drive.companyId,
      jobRequirementId: drive.jobRequirementId,
      driveTitle: drive.driveTitle,
      jobPosition: drive.jobPosition || '',
      driveDescription: drive.driveDescription || '',
      eligibilityCriteria: drive.eligibilityCriteria || '',
      eligibleCourses: drive.eligibleCourses || '',
      eligibleBatches: drive.eligibleBatches || '',
      eligiblePassingYears: drive.eligiblePassingYears || '',
      eligibleDegrees: parseCsvList(drive.eligibleDegrees),
      eligibleStreams: parseCsvList(drive.eligibleStreams),
      qualificationLevels: parseCsvList(drive.qualificationLevels),
      customQualificationLevel: drive.customQualificationLevel || '',
      minimumPercentage: drive.minimumPercentage ?? '',
      minimumCgpa: drive.minimumCgpa ?? '',
      minimumMockRating: drive.minimumMockRating || '',
      minimumProfileReviewRating: drive.minimumProfileReviewRating || '',
      requiredSkills: drive.requiredSkills || '',
      requiredDocuments: drive.requiredDocuments || '',
      driveDate: drive.driveDate || '',
      applicationStartDate: drive.applicationStartDate || '',
      applicationEndDate: drive.applicationEndDate || '',
      interviewLocation: drive.interviewLocation || '',
      interviewMode: drive.interviewMode || '',
      selectionProcess: drive.selectionProcess || '',
      companyFeedback: drive.companyFeedback || '',
      studentsGiven: drive.studentsGiven ?? ''
    })
    setShowModal(true)
    if (drive.companyId) {
      fetchRequirements(drive.companyId)
    }
  }

  const handleDelete = (id) => {
    setConfirmDialog({
      title: 'Delete Drive?',
      message: 'Are you sure you want to delete this placement drive? This action cannot be undone.',
      confirmLabel: 'Delete',
      onConfirm: () => deleteDrive(id)
    })
  }

  const deleteDrive = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/admin/placement-drives/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchDrives()
    } catch (error) {
      console.error('Error deleting drive:', error)
      alert('Error deleting drive')
    }
  }

  const handleConfirmDialog = async () => {
    if (!confirmDialog?.onConfirm) return
    setConfirmLoading(true)
    try {
      await confirmDialog.onConfirm()
    } finally {
      setConfirmLoading(false)
      setConfirmDialog(null)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/admin/placement-drives/${id}/status`, {}, {
        params: { status },
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchDrives()
    } catch (error) {
      console.error('Error updating drive status:', error)
      alert('Error updating drive status')
    }
  }

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  const openAddStudentsModal = (drive) => {
    setSelectedDriveForStudents(drive)
    setStudentSearchCode('')
    setStudentSearchBatch('')
    setShowBatchDropdown(false)
    setStudentSearchResults([])
    setStudentSearchError('')
    setManualReason('')
    setManualReasonOther('')
    setManualReasonError('')
    setShowAddStudentsModal(true)
  }

  const handleBatchSearchChange = (e) => {
    setStudentSearchBatch(e.target.value)
    setStudentSearchError('')
    setShowBatchDropdown(true)
  }

  const selectBatchForSearch = (batch) => {
    setStudentSearchBatch(batch.batchCode)
    setShowBatchDropdown(false)
  }

  const searchStudentsForDrive = async () => {
    if (!studentSearchCode.trim() && !studentSearchBatch.trim()) {
      setStudentSearchError('Enter student ID or batch code')
      return
    }

    setStudentSearchError('')
    setShowBatchDropdown(false)
    setStudentSearchLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/placement-applications/search-students', {
        params: {
          driveId: selectedDriveForStudents?.id,
          studentCode: studentSearchCode || undefined,
          batchCode: studentSearchBatch || undefined
        },
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudentSearchResults(response.data)
    } catch (error) {
      console.error('Error searching students:', error)
      showToast('error', 'Error searching students')
    } finally {
      setStudentSearchLoading(false)
    }
  }

  const handleAddStudentToDrive = async (student) => {
    if (!selectedDriveForStudents) return
    const reasonValue = manualReason === 'Other' ? manualReasonOther.trim() : manualReason
    if (!reasonValue) {
      setManualReasonError('Select a reason for adding this student')
      return
    }
    setManualReasonError('')
    setAddingStudentId(student.id)
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/admin/placement-applications/manual', null, {
        params: {
          driveId: selectedDriveForStudents.id,
          studentId: student.id,
          addedBy: user?.username || user?.email || 'Placement Team',
          manualReason: reasonValue
        },
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('success', `${student.studentName} added to ${selectedDriveForStudents.driveTitle}`)
      setStudentSearchResults(prev => prev.map(item => item.id === student.id ? { ...item, alreadyApplied: true } : item))
      fetchDrives()
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to add student')
    } finally {
      setAddingStudentId(null)
    }
  }

  const openDriveStudentsModal = async (drive) => {
    setViewStudentsDrive(drive)
    setViewStudents([])
    setViewStudentsLoading(true)
    setShowViewStudentsModal(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/admin/placement-applications/drive/${drive.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setViewStudents(response.data)
    } catch (error) {
      console.error('Error fetching drive students:', error)
      showToast('error', 'Error fetching students for this drive')
      setShowViewStudentsModal(false)
    } finally {
      setViewStudentsLoading(false)
    }
  }

  const handleDeleteViewStudent = (app) => {
    setConfirmDialog({
      title: 'Remove Student?',
      message: `Remove ${app.studentName || 'this student'} from ${viewStudentsDrive?.driveTitle || 'this drive'}?`,
      confirmLabel: 'Remove',
      onConfirm: () => removeViewStudent(app)
    })
  }

  const removeViewStudent = async (app) => {
    setDeletingAppId(app.id)
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/admin/placement-applications/${app.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setViewStudents(prev => prev.filter(item => item.id !== app.id))
      fetchDrives()
      showToast('success', `${app.studentName || 'Student'} removed from drive`)
    } catch (error) {
      console.error('Error removing student:', error)
      showToast('error', error.response?.data?.message || 'Failed to remove student')
    } finally {
      setDeletingAppId(null)
    }
  }

  const openSendResumeModal = (drive) => {
    setSendResumeDrive(drive)
    setRecipientEmail('')
    setRecipientName('')
    setShowSendResumeModal(true)
  }

  const handleSendResumes = async (e) => {
    e.preventDefault()
    if (!recipientEmail) {
      alert('Please enter recipient email')
      return
    }
    setSendingResumes(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`/api/admin/placement-drives/${sendResumeDrive.id}/send-resumes`, {
        recipientEmail,
        recipientName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert(response.data?.message || 'Resumes sent successfully')
      setShowSendResumeModal(false)
      setSendResumeDrive(null)
    } catch (error) {
      console.error('Error sending resumes:', error)
      alert(error.response?.data?.message || 'Error sending resumes')
    } finally {
      setSendingResumes(false)
    }
  }

  const openReportModal = () => {
    setReportStatus(statusFilter)
    setReportCompany('ALL')
    setReportFromDate(driveFromDate)
    setReportToDate(driveToDate)
    setReportSearch('')
    setShowReportModal(true)
  }

  const handleDownloadReport = async () => {
    const parseReportDate = (value) => {
      if (!value) return null
      const text = String(value)
      const date = new Date(text.length === 10 ? `${text}T00:00:00` : text)
      return Number.isNaN(date.getTime()) ? null : date
    }

    const search = reportSearch.trim().toLowerCase()
    const reportDrives = drives.filter(drive => {
      if (reportStatus !== 'ALL' && drive.status !== reportStatus) return false
      if (reportCompany !== 'ALL' && drive.companyName !== reportCompany) return false
      if (search) {
        const haystack = [drive.driveId, drive.driveTitle, drive.companyName, drive.jobTitle, drive.jobPosition]
          .filter(Boolean).join(' ').toLowerCase()
        if (!haystack.includes(search)) return false
      }
      if (reportFromDate || reportToDate) {
        const driveDate = parseReportDate(drive.driveDate || drive.applicationStartDate)
        if (!driveDate) return false
        if (reportFromDate && driveDate < new Date(`${reportFromDate}T00:00:00`)) return false
        if (reportToDate && driveDate > new Date(`${reportToDate}T23:59:59.999`)) return false
      }
      return true
    })

    if (reportDrives.length === 0) {
      alert('No drives match the selected report filters')
      return
    }

    setDownloadingReport(true)
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Placement Drives')

    worksheet.columns = [
      { header: 'Drive ID', key: 'driveId', width: 14 },
      { header: 'Drive Title', key: 'driveTitle', width: 28 },
      { header: 'Company', key: 'companyName', width: 24 },
      { header: 'Job Requirement', key: 'jobTitle', width: 24 },
      { header: 'Job Position', key: 'jobPosition', width: 22 },
      { header: 'Drive Date', key: 'driveDate', width: 14 },
      { header: 'Application Start', key: 'applicationStartDate', width: 18 },
      { header: 'Application End', key: 'applicationEndDate', width: 18 },
      { header: 'Interview Location', key: 'interviewLocation', width: 22 },
      { header: 'Interview Mode', key: 'interviewMode', width: 16 },
      { header: 'Status', key: 'status', width: 18 },
      { header: 'Students Given', key: 'studentsGiven', width: 16 },
      { header: 'Company Feedback', key: 'companyFeedback', width: 36 },
      { header: 'Min Mock Rating', key: 'minimumMockRating', width: 16 },
      { header: 'Min Profile Rating', key: 'minimumProfileReviewRating', width: 18 },
      { header: 'Eligible Courses', key: 'eligibleCourses', width: 28 },
      { header: 'Eligible Batches', key: 'eligibleBatches', width: 28 },
      { header: 'Eligible Passing Years', key: 'eligiblePassingYears', width: 20 },
      { header: 'Required Skills', key: 'requiredSkills', width: 32 },
      { header: 'Required Documents', key: 'requiredDocuments', width: 28 },
      { header: 'Selection Process', key: 'selectionProcess', width: 32 }
    ]

    const headerRow = worksheet.getRow(1)
    headerRow.height = 24
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF35063E' }
      }
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' }
      }
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      }
      cell.border = {
        bottom: { style: 'medium', color: { argb: 'FF9B46B2' } }
      }
    })

    reportDrives.forEach((drive, index) => {
      const row = worksheet.addRow({
        driveId: drive.driveId || '-',
        driveTitle: drive.driveTitle || '-',
        companyName: drive.companyName || '-',
        jobTitle: drive.jobTitle || '-',
        jobPosition: drive.jobPosition || '-',
        driveDate: drive.driveDate || '-',
        applicationStartDate: drive.applicationStartDate || '-',
        applicationEndDate: drive.applicationEndDate || '-',
        interviewLocation: drive.interviewLocation || '-',
        interviewMode: drive.interviewMode || '-',
        status: drive.status ? drive.status.replace(/_/g, ' ') : '-',
        studentsGiven: drive.studentsGiven ?? '-',
        companyFeedback: drive.companyFeedback || '-',
        minimumMockRating: drive.minimumMockRating ?? '-',
        minimumProfileReviewRating: drive.minimumProfileReviewRating ?? '-',
        eligibleCourses: drive.eligibleCourses || '-',
        eligibleBatches: drive.eligibleBatches || '-',
        eligiblePassingYears: drive.eligiblePassingYears || '-',
        requiredSkills: drive.requiredSkills || '-',
        requiredDocuments: drive.requiredDocuments || '-',
        selectionProcess: drive.selectionProcess || '-'
      })

      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', wrapText: true }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD7B5E0' } },
          bottom: { style: 'thin', color: { argb: 'FFD7B5E0' } }
        }
        if (index % 2 === 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5EDF7' }
          }
        }
      })
    })

    worksheet.views = [{ state: 'frozen', ySplit: 1 }]
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: worksheet.columns.length }
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `Placement_Drives_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
    setShowReportModal(false)
    setDownloadingReport(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'st-draft'
      case 'PUBLISHED': return 'st-published'
      case 'APPLICATION_OPEN': return 'st-application-open'
      case 'APPLICATION_CLOSED': return 'st-application-closed'
      case 'IN_PROGRESS': return 'st-in-progress'
      case 'COMPLETED': return 'st-completed'
      case 'CANCELLED': return 'st-cancelled'
      case 'PENDING': return 'st-pending'
      case 'UNDER_REVIEW': return 'st-under-review'
      case 'SHORTLISTED': return 'st-shortlisted'
      case 'SELECTED': return 'st-selected'
      case 'PLACED': return 'st-placed'
      case 'REJECTED': return 'st-rejected'
      case 'WITHDRAWN': return 'st-withdrawn'
      default: return 'st-default'
    }
  }

  const toLocalDate = (value) => {
    if (!value) return null
    const text = String(value)
    const date = new Date(text.length === 10 ? `${text}T00:00:00` : text)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const matchesDriveDateRange = (drive) => {
    if (!driveFromDate && !driveToDate) return true
    const driveDate = toLocalDate(drive.driveDate || drive.applicationStartDate)
    if (!driveDate) return false

    if (driveFromDate) {
      const fromDate = new Date(`${driveFromDate}T00:00:00`)
      if (driveDate < fromDate) return false
    }

    if (driveToDate) {
      const toDate = new Date(`${driveToDate}T23:59:59.999`)
      if (driveDate > toDate) return false
    }

    return true
  }

  const dateFilteredDrives = drives.filter(matchesDriveDateRange)
  const driveStatuses = ['DRAFT', 'PUBLISHED', 'APPLICATION_OPEN', 'APPLICATION_CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
  const statusCounts = driveStatuses.reduce((acc, status) => {
    acc[status] = dateFilteredDrives.filter(drive => drive.status === status).length
    return acc
  }, {})
  const filteredDrives = statusFilter === 'ALL' ? dateFilteredDrives : dateFilteredDrives.filter(drive => drive.status === statusFilter)
  const batchSearchTerm = studentSearchBatch.trim().toLowerCase()
  const batchSearchOptions = allBatches.filter(batch => {
    if (!batchSearchTerm) return true
    return batch.batchCode?.toLowerCase().includes(batchSearchTerm) || batch.subject?.toLowerCase().includes(batchSearchTerm)
  })

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900 via-primary-700 to-primary-500 p-8 mb-8 shadow-[0_35px_80px_-35px_rgba(23,2,58,0.75)]">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -left-10 -bottom-16 w-48 h-48 rounded-full bg-primary-300/20 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center shadow-lg shrink-0">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-primary-200 text-xs font-bold uppercase tracking-[0.25em] mb-1">Placement Module</p>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Placement Drive Management</h1>
              <p className="text-primary-100/90 mt-1 text-sm">Manage placement drives, eligibility and student applications.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white/10 hover:bg-white/20 border border-white/25 rounded-xl transition-all duration-300 hover:-translate-y-1">
              {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
            <button
              onClick={openReportModal}
              disabled={drives.length === 0}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Download Report
            </button>
            <button onClick={() => { setEditingDrive(null); resetFormData(); setSelectedCourses([]); setSelectedBatches([]); setShowModal(true) }} className="flex items-center gap-2 bg-white text-primary-700 hover:bg-primary-50 px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <Plus className="w-5 h-5" />
              Create Drive
            </button>
          </div>
        </div>
      </div>

      {/* Date Filters */}
      <div className="card mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-body-text mb-1">From Date</label>
          <input
            type="date"
            value={driveFromDate}
            onChange={(e) => setDriveFromDate(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-body-text mb-1">To Date</label>
          <input
            type="date"
            value={driveToDate}
            onChange={(e) => setDriveToDate(e.target.value)}
            className="input-field"
          />
        </div>
        <button
          onClick={() => { setDriveFromDate(''); setDriveToDate('') }}
          className="btn-secondary"
        >
          Clear Dates
        </button>
      </div>

      {/* Drive Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`pd-dash-card p-5 text-left ${statusFilter === 'ALL' ? 'ring-2 ring-primary' : ''}`}
        >
          <p className="text-sm text-body-text mb-1">Total Drives Added</p>
          <p className="text-3xl font-bold text-heading">{dateFilteredDrives.length}</p>
        </button>
        {driveStatuses.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`pd-dash-card p-5 text-left ${statusFilter === status ? 'ring-2 ring-primary' : ''}`}
          >
            <p className="text-sm text-body-text mb-1">{status.replace(/_/g, ' ')}</p>
            <p className="text-2xl font-bold text-heading">{statusCounts[status]}</p>
          </button>
        ))}
      </div>

      <div className="pd-shell relative overflow-hidden rounded-2xl bg-white border border-primary-100">
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="relative p-8">
          {filteredDrives.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-primary-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                {statusFilter === 'ALL'
                  ? 'No placement drives found. Click "Create Drive" to create one.'
                  : `No drives found with status ${statusFilter.replace(/_/g, ' ')}.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="pd-table w-full min-w-[1250px]">
                <thead>
                  <tr>
                    <th>Drive ID</th>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Drive Date</th>
                    <th>Application Period</th>
                    <th>Status</th>
                    <th>Students Given</th>
                    <th>Company Feedback</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrives.map((drive) => (
                    <tr key={drive.id}>
                      <td><span className="pd-id font-mono">{drive.driveId}</span></td>
                      <td className="font-semibold text-heading">{drive.driveTitle}</td>
                      <td className="py-4 px-4 text-gray-700">{drive.companyName}</td>
                      <td className="py-4 px-4 text-gray-700">{drive.driveDate || 'TBD'}</td>
                      <td className="py-4 px-4 text-gray-700">
                        {drive.applicationStartDate && drive.applicationEndDate 
                          ? `${drive.applicationStartDate} to ${drive.applicationEndDate}`
                          : 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`badge ${getStatusColor(drive.status)}`}>
                          {drive.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => openAddStudentsModal(drive)}
                          className={`inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-sm font-bold transition-all hover:scale-105 ${
                            drive.candidatesRequired && (drive.studentsGiven ?? 0) >= drive.candidatesRequired
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                          }`}
                          title="Click to add candidates manually"
                        >
                          {drive.studentsGiven ?? 0}/{drive.candidatesRequired ?? '∞'}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-gray-700 max-w-[240px] truncate" title={drive.companyFeedback || ''}>
                        {drive.companyFeedback || '-'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openAddStudentsModal(drive)}
                            className="pd-action-btn p-2 text-emerald-600 hover:bg-emerald-50 rounded-md"
                            title="Add Students"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openSendResumeModal(drive)}
                            className="pd-action-btn p-2 text-purple-600 hover:bg-purple-50 rounded-md"
                            title="Send Resumes"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(drive)}
                            className="pd-action-btn p-2 text-blue-500 hover:bg-blue-50 rounded-md"
                            title="Edit Drive"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <select
                            value={drive.status}
                            onChange={(e) => handleStatusChange(drive.id, e.target.value)}
                            className="pd-status-select"
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="APPLICATION_OPEN">Application Open</option>
                            <option value="APPLICATION_CLOSED">Application Closed</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                          <button
                            onClick={() => handleDelete(drive.id)}
                            className="pd-action-btn p-2 text-red-500 hover:bg-red-50 rounded-md"
                            title="Delete Drive"
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

      {/* Placement Drive Form Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-heading">
                {editingDrive ? 'Edit Placement Drive' : 'Create Placement Drive'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingDrive(null) }} className="p-2 hover:bg-light-blue rounded-md transition-colors">
                <X className="w-5 h-5 text-body-text" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Drive ID</label>
                  <input
                    type="text"
                    value={formData.driveId}
                    onChange={(e) => setFormData({ ...formData, driveId: e.target.value })}
                    className="input-field"
                    required
                    disabled={editingDrive}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Company</label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => {
                      setFormData({ ...formData, companyId: e.target.value, jobRequirementId: '' })
                      if (e.target.value) fetchRequirements(e.target.value)
                    }}
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
                  <label className="block text-body-text text-sm font-medium mb-2">Job Requirement</label>
                  <select
                    value={formData.jobRequirementId}
                    onChange={handleRequirementChange}
                    className="input-field"
                    required
                    disabled={!formData.companyId}
                  >
                    <option value="">Select Requirement</option>
                    {requirements.map((req) => (
                      <option key={req.id} value={req.id}>
                        {req.jobTitle}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Drive Title</label>
                  <input
                    type="text"
                    value={formData.driveTitle}
                    onChange={(e) => setFormData({ ...formData, driveTitle: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Job Position</label>
                  <input
                    type="text"
                    value={formData.jobPosition}
                    onChange={(e) => setFormData({ ...formData, jobPosition: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Drive Date</label>
                  <input
                    type="date"
                    value={formData.driveDate}
                    onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
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
                  <label className="block text-body-text text-sm font-medium mb-2">Application End Date</label>
                  <input
                    type="date"
                    value={formData.applicationEndDate}
                    onChange={(e) => setFormData({ ...formData, applicationEndDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Interview Location</label>
                  <input
                    type="text"
                    value={formData.interviewLocation}
                    onChange={(e) => setFormData({ ...formData, interviewLocation: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Interview Mode</label>
                  <input
                    type="text"
                    value={formData.interviewMode}
                    onChange={(e) => setFormData({ ...formData, interviewMode: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Minimum Mock Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.minimumMockRating}
                    onChange={(e) => setFormData({ ...formData, minimumMockRating: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-text text-sm font-medium mb-2">Minimum Profile Review Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.minimumProfileReviewRating}
                    onChange={(e) => setFormData({ ...formData, minimumProfileReviewRating: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Drive Description</label>
                <textarea
                  value={formData.driveDescription}
                  onChange={(e) => setFormData({ ...formData, driveDescription: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Eligibility Criteria</label>
                <textarea
                  value={formData.eligibilityCriteria}
                  onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                  className="input-field"
                  rows="2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Eligible Courses</label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-light-blue rounded-lg">
                  {courses.map((course) => (
                    <label key={course.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={() => handleCourseToggle(course.id)}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <span className="text-sm">{course.courseCode} - {course.courseName}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">
                  Eligible Batches {selectedCourses.length > 0 && `(filtered by selected courses)`}
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-light-blue rounded-lg max-h-48 overflow-y-auto">
                  {filteredBatches.length > 0 ? (
                    filteredBatches.map((batch) => (
                      <label key={batch.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBatches.includes(batch.id)}
                          onChange={() => handleBatchToggle(batch.id)}
                          className="w-4 h-4 text-primary rounded"
                        />
                        <span className="text-sm">{batch.batchCode} - {batch.subject}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 col-span-2">
                      {selectedCourses.length > 0 
                        ? 'No batches found for selected courses' 
                        : 'Select courses to see eligible batches'}
                    </p>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Eligible Passing Years</label>
                <input
                  type="text"
                  value={formData.eligiblePassingYears}
                  onChange={(e) => setFormData({ ...formData, eligiblePassingYears: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 2025, 2026"
                />
              </div>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Eligibility Criteria</label>
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
                <label className="block text-body-text text-sm font-medium mb-2">Required Skills</label>
                <textarea
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  className="input-field"
                  rows="2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Required Documents</label>
                <textarea
                  value={formData.requiredDocuments}
                  onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                  className="input-field"
                  rows="2"
                />
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
                <label className="block text-body-text text-sm font-medium mb-2">Company Feedback</label>
                <textarea
                  value={formData.companyFeedback}
                  onChange={(e) => setFormData({ ...formData, companyFeedback: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                {editingDrive ? 'Update Drive' : 'Create Drive'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Drive Students Modal */}
      {showViewStudentsModal && viewStudentsDrive && (
        <div className="modal-overlay">
          <div className="modal-content max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-heading">Students Added</h2>
                <p className="text-sm text-body-text">{viewStudentsDrive.driveTitle}</p>
              </div>
              <button onClick={() => { setShowViewStudentsModal(false); setViewStudentsDrive(null) }} className="p-2 hover:bg-light-blue rounded-md transition-colors">
                <X className="w-5 h-5 text-body-text" />
              </button>
            </div>
            {viewStudentsLoading ? (
              <p className="text-sm text-body-text">Loading students...</p>
            ) : viewStudents.length === 0 ? (
              <p className="text-sm text-body-text">No students added to this drive yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="pd-table w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="border-b border-primary-100 text-left text-body-text">
                      <th className="py-2 pr-4 font-semibold">Student</th>
                      <th className="py-2 pr-4 font-semibold">Code</th>
                      <th className="py-2 pr-4 font-semibold">Status</th>
                      <th className="py-2 pr-4 font-semibold">Reason</th>
                      <th className="py-2 pr-4 font-semibold">Applied At</th>
                      <th className="py-2 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewStudents.map(app => (
                      <tr key={app.id} className="border-b border-primary-50">
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            {app.profileImage ? (
                              <img src={apiFile(app.profileImage)} alt={app.studentName} onClick={() => setPhotoPreview({
                        src: app.profileImage,
                        name: app.studentName,
                        details: [
                          { label: 'Student Code', value: app.studentCode },
                          { label: 'Status', value: app.status?.replace(/_/g, ' ') },
                          { label: 'Reason', value: app.manualReason || 'Self applied' },
                          { label: 'Applied On', value: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '-' }
                        ],
                        education: buildEducationLines(app)
                      })} className="h-8 w-8 rounded-full object-cover border border-primary-200 shrink-0 cursor-zoom-in hover:scale-110 transition-transform" />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white">
                                {(app.studentName || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                              </div>
                            )}
                            <span className="text-heading">{app.studentName || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-4 text-body-text">{app.studentCode || 'N/A'}</td>
                        <td className="py-2 pr-4">
                          <span className={`badge ${getStatusColor(app.status)}`}>
                            {app.status?.replace(/_/g, ' ') || 'N/A'}
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          {app.manualReason ? (
                            <span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">{app.manualReason}</span>
                          ) : (
                            <span className="text-body-text text-xs">Self applied</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-body-text">
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-2 text-right">
                          <button
                            onClick={() => handleDeleteViewStudent(app)}
                            disabled={deletingAppId === app.id}
                            className="pd-action-btn p-2 text-red-500 hover:bg-red-50 rounded-md disabled:opacity-50"
                            title="Remove student from drive"
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
      )}

      {/* Download Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-heading">Download Drive Report</h2>
                <p className="text-sm text-body-text">Apply filters and download the Excel report.</p>
              </div>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-light-blue rounded-md transition-colors">
                <X className="w-5 h-5 text-body-text" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleDownloadReport() }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-body-text text-sm font-medium mb-1">Status</label>
                  <select value={reportStatus} onChange={(e) => setReportStatus(e.target.value)} className="input-field">
                    <option value="ALL">All Statuses</option>
                    {driveStatuses.map(status => (
                      <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-1">Company</label>
                  <select value={reportCompany} onChange={(e) => setReportCompany(e.target.value)} className="input-field">
                    <option value="ALL">All Companies</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.companyName}>{company.companyName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-1">From Date</label>
                  <input type="date" value={reportFromDate} onChange={(e) => setReportFromDate(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-1">To Date</label>
                  <input type="date" value={reportToDate} onChange={(e) => setReportToDate(e.target.value)} className="input-field" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-body-text text-sm font-medium mb-1">Search</label>
                  <input
                    type="text"
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    className="input-field"
                    placeholder="Drive ID, title, company, job title or position"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowReportModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={downloadingReport} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  <Download className="w-4 h-4" />
                  {downloadingReport ? 'Downloading...' : 'Download Excel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Resumes Modal */}
      {showSendResumeModal && sendResumeDrive && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-heading">Send Resumes</h2>
                <p className="text-sm text-body-text">{sendResumeDrive.driveTitle}</p>
              </div>
              <button onClick={() => { setShowSendResumeModal(false); setSendResumeDrive(null) }} className="p-2 hover:bg-light-blue rounded-md transition-colors">
                <X className="w-5 h-5 text-body-text" />
              </button>
            </div>
            <form onSubmit={handleSendResumes}>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Recipient Email</label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="input-field"
                  placeholder="hr@company.com"
                />
              </div>
              <div className="mb-4">
                <label className="block text-body-text text-sm font-medium mb-2">Recipient Name (optional)</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="input-field"
                  placeholder="HR Manager"
                />
              </div>
              <p className="text-sm text-body-text mb-4">
                All student resumes for this drive will be zipped and emailed as company_jobposition.zip.
              </p>
              <button type="submit" disabled={sendingResumes} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                <Mail className="w-4 h-4" />
                {sendingResumes ? 'Sending...' : 'Send Resumes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Students Modal */}
      {showAddStudentsModal && selectedDriveForStudents && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/30">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-heading">Add Students</h2>
                  <p className="text-sm text-body-text">{selectedDriveForStudents.driveTitle}</p>
                  {selectedDriveForStudents.candidatesRequired ? (
                    <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      (selectedDriveForStudents.studentsGiven ?? 0) >= selectedDriveForStudents.candidatesRequired
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-primary-100 text-primary-700'
                    }`}>
                      {selectedDriveForStudents.studentsGiven ?? 0}/{selectedDriveForStudents.candidatesRequired} candidates
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const drive = selectedDriveForStudents
                    setShowAddStudentsModal(false)
                    setSelectedDriveForStudents(null)
                    openDriveStudentsModal(drive)
                  }}
                  className="rounded-full border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  View added
                </button>
                <button onClick={() => { setShowAddStudentsModal(false); setSelectedDriveForStudents(null) }} className="p-2 rounded-full hover:bg-red-50 text-body-text hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50/60 to-white p-4 shadow-sm mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-body-text mb-1">Student ID</label>
                <input
                  type="text"
                  value={studentSearchCode}
                  onChange={(e) => { setStudentSearchCode(e.target.value); setStudentSearchError('') }}
                  placeholder="e.g. PENTAGON2024001"
                  className="input-field"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-body-text mb-1">Batch Code</label>
                <input
                  type="text"
                  value={studentSearchBatch}
                  onChange={handleBatchSearchChange}
                  onFocus={() => setShowBatchDropdown(true)}
                  onBlur={() => setTimeout(() => setShowBatchDropdown(false), 150)}
                  placeholder="Type or select batch code"
                  className="input-field"
                  autoComplete="off"
                />
                {showBatchDropdown && (
                  <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-primary-100 bg-white shadow-lg">
                    {batchSearchOptions.length > 0 ? (
                      batchSearchOptions.map(batch => (
                        <button
                          key={batch.id}
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); selectBatchForSearch(batch) }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-primary-50"
                        >
                          <span className="font-medium text-heading">{batch.batchCode}</span>
                          {batch.subject && <span className="text-body-text"> • {batch.subject}</span>}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-sm text-body-text">
                        {batchSearchTerm ? 'No matching batches' : 'No batches available'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            {studentSearchError && (
              <p className="mb-3 flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm font-medium text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {studentSearchError}
              </p>
            )}
            <button
              onClick={searchStudentsForDrive}
              disabled={studentSearchLoading}
              className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/30 hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {studentSearchLoading ? 'Searching...' : 'Search Students'}
            </button>
            <div className="mt-3">
              <label className="block text-sm font-medium text-body-text mb-1">Reason for Manual Addition <span className="text-red-500">*</span></label>
              <select
                value={manualReason}
                onChange={(e) => { setManualReason(e.target.value); setManualReasonError('') }}
                className={`input-field ${manualReasonError ? 'border-red-400' : ''}`}
              >
                <option value="">Select reason</option>
                <option value="Referred by Trainer">Referred by Trainer</option>
                <option value="Skillset Match">Skillset Match</option>
                <option value="Company Request">Company Request</option>
                <option value="Other">Other</option>
              </select>
              {manualReason === 'Other' && (
                <input
                  type="text"
                  value={manualReasonOther}
                  onChange={(e) => { setManualReasonOther(e.target.value); setManualReasonError('') }}
                  placeholder="Specify reason"
                  className="input-field mt-2"
                />
              )}
              {manualReasonError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {manualReasonError}
                </p>
              )}
            </div>
            </div>

            {studentSearchResults.length === 0 ? (
              <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-primary-200 bg-primary-50/30 px-4 py-8 text-center">
                <Search className="h-8 w-8 text-primary-300 mb-2" />
                <p className="text-sm text-body-text">Search by student ID and/or batch code to find students.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-body-text">
                  {studentSearchResults.length} result{studentSearchResults.length !== 1 ? 's' : ''} found
                </p>
                {studentSearchResults.map(student => (
                  <div key={student.id} className="group flex items-center justify-between gap-3 rounded-xl border border-primary-100 bg-white p-3 shadow-sm hover:shadow-md hover:border-primary-200 hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      {student.profileImage ? (
                        <img src={apiFile(student.profileImage)} alt={student.studentName} onClick={() => setPhotoPreview({
                        src: student.profileImage,
                        name: student.studentName,
                        details: [
                          { label: 'Student Code', value: student.studentCode },
                          { label: 'Batch Code', value: student.batchCode },
                          { label: 'Email', value: student.email },
                          { label: 'Phone', value: student.phone }
                        ],
                        education: buildEducationLines(student)
                      })} className="h-10 w-10 shrink-0 rounded-full object-cover border border-primary-200 cursor-zoom-in hover:scale-110 transition-transform" />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white">
                          {(student.studentName || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-heading truncate">{student.studentName}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="rounded-md bg-primary-50 px-1.5 py-0.5 text-xs font-medium text-primary-700">{student.studentCode}</span>
                          {student.batchCode && <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-xs font-medium text-sky-700">{student.batchCode}</span>}
                        </div>
                      </div>
                    </div>
                    {student.alreadyApplied ? (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Added</span>
                    ) : (
                      <button
                        onClick={() => handleAddStudentToDrive(student)}
                        disabled={addingStudentId === student.id}
                        className="shrink-0 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:scale-105 transition-all disabled:opacity-50"
                      >
                        {addingStudentId === student.id ? 'Adding...' : 'Add'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[200] animate-in slide-in-from-right fade-in duration-300">
          <div className={`flex items-center gap-3 min-w-[300px] max-w-sm rounded-xl border-l-4 shadow-xl p-4 ${toast.type === 'success' ? 'bg-white border-success' : 'bg-white border-red-500'}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-50' : 'bg-red-50'}`}>
              {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
            </div>
            <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-gray-800' : 'text-red-700'}`}>{toast.message}</p>
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

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 shadow-inner">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-heading">{confirmDialog.title}</h2>
            <p className="mt-2 text-sm text-body-text">{confirmDialog.message}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                disabled={confirmLoading}
                className="rounded-lg border border-primary-200 px-5 py-2 text-sm font-medium text-body-text hover:bg-primary-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDialog}
                disabled={confirmLoading}
                className="rounded-lg bg-gradient-to-r from-red-500 to-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
              >
                {confirmLoading ? 'Please wait...' : confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlacementDriveManagement
