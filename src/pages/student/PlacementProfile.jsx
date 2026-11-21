import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Menu,
  X,
  GraduationCap,
  Code,
  FileText,
  Link,
  Save,
  User,
  Mail,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import axios from 'axios'
import { apiFile } from '../../api'

const PlacementProfile = () => {
  const [profile, setProfile] = useState({
    profileImage: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    collegeName: '',
    qualification: '',
    passingYear: '',
    tenthPercentage: '',
    twelfthDiplomaPercentage: '',
    degree: '',
    stream: '',
    bachelorsDegree: '',
    bachelorsStream: '',
    bachelorsPercentage: '',
    bachelorsCgpa: '',
    mastersDegree: '',
    mastersStream: '',
    mastersPercentage: '',
    mastersCgpa: '',
    technicalSkills: '',
    programmingLanguages: '',
    frameworks: '',
    databaseSkills: '',
    projects: '',
    certifications: '',
    internshipExperience: '',
    resumeUrl: '',
    linkedinProfile: '',
    githubProfile: '',
    portfolioUrl: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef(null)
  const [isEditing, setIsEditing] = useState(false)
  const [percentagesLocked, setPercentagesLocked] = useState(false)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [requestSubmitting, setRequestSubmitting] = useState(false)
  const [requestMessage, setRequestMessage] = useState(null)
  const [toast, setToast] = useState(null)
  const [requestForm, setRequestForm] = useState({
    tenth: '', tenth12: '', bachelorsPct: '', bachelorsCgpa: '', mastersPct: '', mastersCgpa: '', note: ''
  })
  const outletContext = useOutletContext()
  const sidebarOpen = outletContext?.sidebarOpen ?? true
  const setSidebarOpen = outletContext?.setSidebarOpen ?? (() => {})
  const { user } = useAuth()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/student/placement-profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(response.data || {})
      setPercentagesLocked(!!(response.data?.tenthPercentage || response.data?.twelfthDiplomaPercentage || response.data?.bachelorsPercentage || response.data?.bachelorsCgpa || response.data?.mastersPercentage || response.data?.mastersCgpa))
      if (!response.data?.collegeName && !response.data?.qualification) {
        setIsEditing(true)
      }
    } catch (error) {
      console.error('Error fetching placement profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const token = localStorage.getItem('token')
      const uploadData = new FormData()
      uploadData.append('file', file)
      const response = await axios.post('/api/student/profile-image', uploadData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(response.data || profile)
    } catch (error) {
      console.error('Error uploading profile image:', error)
      showToast('Failed to upload photo', 'error')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put('/api/student/placement-profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(response.data || profile)
      setIsEditing(false)
      setPercentagesLocked(true)
      showToast('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      const serverMsg = error.response?.data?.message || error.response?.data
      showToast(typeof serverMsg === 'string' && serverMsg ? serverMsg : 'Error updating profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleRequestPercentageUpdate = () => {
    setRequestForm({ tenth: '', tenth12: '', bachelorsPct: '', bachelorsCgpa: '', mastersPct: '', mastersCgpa: '', note: '' })
    setRequestMessage(null)
    setRequestModalOpen(true)
  }

  const submitUpdateRequest = async () => {
    const lines = []
    const fields = [
      ['10th Percentage', profile.tenthPercentage, requestForm.tenth],
      ['12th / Diploma Percentage', profile.twelfthDiplomaPercentage, requestForm.tenth12],
      ['Bachelors Percentage', profile.bachelorsPercentage, requestForm.bachelorsPct],
      ['Bachelors CGPA', profile.bachelorsCgpa, requestForm.bachelorsCgpa],
      ['Masters Percentage', profile.mastersPercentage, requestForm.mastersPct],
      ['Masters CGPA', profile.mastersCgpa, requestForm.mastersCgpa]
    ]
    fields.forEach(([label, current, requested]) => {
      if (requested && requested.trim()) {
        lines.push(`${label}: ${current || '-'} -> ${requested.trim()}`)
      }
    })
    if (requestForm.note && requestForm.note.trim()) {
      lines.push(`Note: ${requestForm.note.trim()}`)
    }
    if (lines.length === 0) {
      setRequestMessage('Enter at least one requested value or a note.')
      return
    }
    const details = `Student: ${profile.firstName || ''} ${profile.lastName || ''} (${profile.studentCode || 'N/A'})\n\n` + lines.join('\n')
    setRequestSubmitting(true)
    setRequestMessage(null)
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/student/update-requests', {
        requestType: 'PERCENTAGE_UPDATE',
        details
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRequestModalOpen(false)
      showToast('Update request submitted! The placement team will review it.')
    } catch (error) {
      const serverMsg = error.response?.data?.message
      setRequestMessage(typeof serverMsg === 'string' && serverMsg ? serverMsg : 'Failed to submit request. Please try again.')
    } finally {
      setRequestSubmitting(false)
    }
  }

  const calculateCompletion = () => {
    const fields = [
      profile.collegeName,
      profile.qualification,
      profile.passingYear,
      profile.tenthPercentage,
      profile.twelfthDiplomaPercentage,
      profile.degree,
      profile.stream,
      profile.technicalSkills,
      profile.programmingLanguages,
      profile.frameworks,
      profile.databaseSkills,
      profile.projects,
      profile.certifications,
      profile.internshipExperience,
      profile.resumeUrl,
      profile.linkedinProfile,
      profile.githubProfile,
      profile.portfolioUrl
    ]
    const filled = fields.filter(f => f && String(f).trim() !== '').length
    return Math.round((filled / fields.length) * 100)
  }

  const educationLevelOptions = ['Bachelors', 'Masters']
  const bachelorsDegreeOptions = ['B.E.', 'B.Tech', 'BCA', 'B.Sc', 'Bachelor']
  const mastersDegreeOptions = ['M.E.', 'M.Tech', 'MBA', 'MCA', 'Master']
  const streamOptionsList = [
    'Computer Science', 'Artificial Intelligence', 'Data Science', 'Information Technology',
    'Computer Applications', 'Electronics & Communication', 'Electrical', 'Mechanical', 'Civil',
    'Biotechnology', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Commerce'
  ]
  const parseList = (value) => value ? String(value).split(',').map(item => item.trim()).filter(Boolean) : []
  const selectedEducationLevels = parseList(profile.degree)
  const selectedBachelors = selectedEducationLevels.includes('Bachelors')
  const selectedMasters = selectedEducationLevels.includes('Masters')
  const toggleEducationLevel = (level) => {
    setProfile(prev => {
      const current = parseList(prev.degree)
      const next = current.includes(level) ? current.filter(item => item !== level) : [...current, level]
      return { ...prev, degree: next.join(', ') }
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const completion = calculateCompletion()

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Placement Profile</h1>
          <p className="text-gray-600">Update your placement information and skills.</p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
          {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
        </button>
      </div>

          {/* Profile Completion */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-heading mb-2">Profile Completion</h2>
                <p className="text-body-text text-sm">Complete your profile to increase placement opportunities.</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-primary">{completion}%</p>
                <p className={`text-sm ${completion >= 80 ? 'text-success' : 'text-warning'}`}>
                  {completion >= 80 ? 'Eligible for placements' : 'Complete more fields'}
                </p>
              </div>
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${completion >= 80 ? 'bg-success' : 'bg-warning'}`}
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          {/* Placement Profile Form */}
          {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-heading mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h2>
              <div className="flex items-center gap-5 mb-5 p-4 rounded-xl border border-primary-100 bg-gradient-to-r from-primary-50/60 to-white">
                <div className="relative shrink-0">
                  {profile.profileImage ? (
                    <img src={apiFile(profile.profileImage)} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      {(profile.firstName || 'S').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading">Profile Photo</p>
                  <p className="text-xs text-body-text mb-2">Upload a clear photo. It will be saved instantly.</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-md transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? 'Uploading...' : (profile.profileImage ? 'Change Photo' : 'Upload Photo')}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    value={profile.firstName || ''}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName || ''}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Phone</label>
                  <input
                    type="text"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={profile.dateOfBirth || ''}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-body-text text-sm font-medium mb-2">Address</label>
                  <textarea
                    value={profile.address || ''}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-heading mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Educational Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">College Name</label>
                  <input
                    type="text"
                    value={profile.collegeName || ''}
                    onChange={(e) => setProfile({ ...profile, collegeName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Qualification</label>
                  <input
                    type="text"
                    value={profile.qualification || ''}
                    onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Passing Year</label>
                  <input
                    type="text"
                    value={profile.passingYear || ''}
                    onChange={(e) => setProfile({ ...profile, passingYear: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 2026"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">10th Percentage</label>
                  <input
                    type="text"
                    value={profile.tenthPercentage || ''}
                    onChange={(e) => setProfile({ ...profile, tenthPercentage: e.target.value })}
                    className="input-field disabled:opacity-60"
                    placeholder="e.g., 85%"
                    disabled={percentagesLocked}
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">12th / Diploma Percentage</label>
                  <input
                    type="text"
                    value={profile.twelfthDiplomaPercentage || ''}
                    onChange={(e) => setProfile({ ...profile, twelfthDiplomaPercentage: e.target.value })}
                    className="input-field disabled:opacity-60"
                    placeholder="e.g., 78%"
                    disabled={percentagesLocked}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-body-text text-sm font-medium mb-2">Education Level</label>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-light-blue rounded-lg">
                    {educationLevelOptions.map(level => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedEducationLevels.includes(level)}
                          onChange={() => toggleEducationLevel(level)}
                          className="w-4 h-4 text-primary rounded"
                        />
                        <span className="text-sm">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {selectedBachelors && (
                  <div className="md:col-span-3">
                    <p className="text-sm font-semibold text-heading mb-2">Bachelors Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-body-text text-sm font-medium mb-2">Degree</label>
                        <select value={profile.bachelorsDegree} onChange={(e) => setProfile({ ...profile, bachelorsDegree: e.target.value })} className="input-field">
                          <option value="">Select degree</option>
                          {bachelorsDegreeOptions.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-body-text text-sm font-medium mb-2">Stream</label>
                        <select value={profile.bachelorsStream} onChange={(e) => setProfile({ ...profile, bachelorsStream: e.target.value })} className="input-field">
                          <option value="">Select stream</option>
                          {streamOptionsList.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-body-text text-sm font-medium mb-2">Percentage</label>
                        <input type="text" value={profile.bachelorsPercentage || ''} onChange={(e) => setProfile({ ...profile, bachelorsPercentage: e.target.value })} className="input-field disabled:opacity-60" placeholder="e.g., 85%" disabled={percentagesLocked} />
                      </div>
                      <div>
                        <label className="block text-body-text text-sm font-medium mb-2">CGPA</label>
                        <input type="text" value={profile.bachelorsCgpa || ''} onChange={(e) => setProfile({ ...profile, bachelorsCgpa: e.target.value })} className="input-field disabled:opacity-60" placeholder="e.g., 8.5" disabled={percentagesLocked} />
                      </div>
                    </div>
                  </div>
                )}
                {selectedMasters && (
                  <div className="md:col-span-3">
                    <p className="text-sm font-semibold text-heading mb-2">Masters Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-body-text text-sm font-medium mb-2">Degree</label>
                        <select value={profile.mastersDegree} onChange={(e) => setProfile({ ...profile, mastersDegree: e.target.value })} className="input-field">
                          <option value="">Select degree</option>
                          {mastersDegreeOptions.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-body-text text-sm font-medium mb-2">Stream</label>
                        <select value={profile.mastersStream} onChange={(e) => setProfile({ ...profile, mastersStream: e.target.value })} className="input-field">
                          <option value="">Select stream</option>
                          {streamOptionsList.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-body-text text-sm font-medium mb-2">Percentage</label>
                        <input type="text" value={profile.mastersPercentage || ''} onChange={(e) => setProfile({ ...profile, mastersPercentage: e.target.value })} className="input-field disabled:opacity-60" placeholder="e.g., 78%" disabled={percentagesLocked} />
                      </div>
                      <div>
                        <label className="block text-body-text text-sm font-medium mb-2">CGPA</label>
                        <input type="text" value={profile.mastersCgpa || ''} onChange={(e) => setProfile({ ...profile, mastersCgpa: e.target.value })} className="input-field disabled:opacity-60" placeholder="e.g., 8.2" disabled={percentagesLocked} />
                      </div>
                    </div>
                  </div>
                )}
                {percentagesLocked && (
                  <div className="md:col-span-3">
                    <p className="text-xs text-body-text">10th, 12th/Diploma percentages and Bachelors/Masters percentage &amp; CGPA are locked after first save. Use Request Percentage Update or contact admin/placement team.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-heading mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Technical Skills
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Technical Skills</label>
                  <textarea
                    value={profile.technicalSkills}
                    onChange={(e) => setProfile({ ...profile, technicalSkills: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="e.g., Java, Python, JavaScript, React, Spring Boot"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Programming Languages</label>
                  <textarea
                    value={profile.programmingLanguages}
                    onChange={(e) => setProfile({ ...profile, programmingLanguages: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="e.g., Java, Python, C++, JavaScript"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Frameworks</label>
                  <textarea
                    value={profile.frameworks}
                    onChange={(e) => setProfile({ ...profile, frameworks: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="e.g., Spring Boot, React, Angular, Hibernate"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Database Skills</label>
                  <textarea
                    value={profile.databaseSkills}
                    onChange={(e) => setProfile({ ...profile, databaseSkills: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="e.g., MySQL, PostgreSQL, MongoDB"
                  />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-heading mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Experience & Projects
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Projects</label>
                  <textarea
                    value={profile.projects}
                    onChange={(e) => setProfile({ ...profile, projects: e.target.value })}
                    className="input-field"
                    rows="4"
                    placeholder="Describe your key projects and technologies used"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Certifications</label>
                  <textarea
                    value={profile.certifications}
                    onChange={(e) => setProfile({ ...profile, certifications: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="List your certifications and training programs"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Internship Experience</label>
                  <textarea
                    value={profile.internshipExperience}
                    onChange={(e) => setProfile({ ...profile, internshipExperience: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="Describe any internship experience"
                  />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-heading mb-4 flex items-center gap-2">
                <Link className="w-5 h-5 text-primary" />
                Online Profiles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Resume URL</label>
                  <input
                    type="url"
                    value={profile.resumeUrl}
                    onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
                    className="input-field"
                    placeholder="Link to your resume (Google Drive, etc.)"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={profile.linkedinProfile}
                    onChange={(e) => setProfile({ ...profile, linkedinProfile: e.target.value })}
                    className="input-field"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">GitHub Profile</label>
                  <input
                    type="url"
                    value={profile.githubProfile}
                    onChange={(e) => setProfile({ ...profile, githubProfile: e.target.value })}
                    className="input-field"
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                <div>
                  <label className="block text-body-text text-sm font-medium mb-2">Portfolio URL</label>
                  <input
                    type="url"
                    value={profile.portfolioUrl}
                    onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                    className="input-field"
                    placeholder="Link to your portfolio website"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              <button type="button" onClick={handleRequestPercentageUpdate} className="btn-secondary flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Request Percentage Update
              </button>
            </div>
          </form>
          ) : (
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-heading">My Information</h2>
                  <p className="text-sm text-body-text">Your personal, educational and placement information is up to date.</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={handleRequestPercentageUpdate} className="btn-secondary flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Request Percentage Update
                  </button>
                  <button type="button" onClick={() => setIsEditing(true)} className="btn-primary flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Edit Profile
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {profile.profileImage ? (
                      <img src={apiFile(profile.profileImage)} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-primary-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                        {(profile.firstName || 'S').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h3 className="font-semibold text-heading">Personal Information</h3>
                  </div>
                  <div className="space-y-1 text-sm text-body-text">
                    <p><span className="font-medium">Name:</span> {profile.firstName} {profile.lastName}</p>
                    <p><span className="font-medium">Email:</span> {profile.email}</p>
                    <p><span className="font-medium">Phone:</span> {profile.phone || '-'}</p>
                    <p><span className="font-medium">Date of Birth:</span> {profile.dateOfBirth || '-'}</p>
                    <p><span className="font-medium">Address:</span> {profile.address || '-'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-heading mb-2">Educational Information</h3>
                  <div className="space-y-1 text-sm text-body-text">
                    <p><span className="font-medium">College:</span> {profile.collegeName || '-'}</p>
                    <p><span className="font-medium">Qualification:</span> {profile.qualification || '-'}</p>
                    <p><span className="font-medium">Passing Year:</span> {profile.passingYear || '-'}</p>
                    <p><span className="font-medium">10th %:</span> {profile.tenthPercentage || '-'}</p>
                    <p><span className="font-medium">12th/Diploma %:</span> {profile.twelfthDiplomaPercentage || '-'}</p>
                    <p><span className="font-medium">Education Level:</span> {profile.degree || '-'}</p>
                    {profile.bachelorsDegree && <p><span className="font-medium">Bachelors:</span> {profile.bachelorsDegree}{profile.bachelorsStream ? ` - ${profile.bachelorsStream}` : ''}{profile.bachelorsPercentage ? ` | ${profile.bachelorsPercentage}` : ''}{profile.bachelorsCgpa ? ` | CGPA ${profile.bachelorsCgpa}` : ''}</p>}
                    {profile.mastersDegree && <p><span className="font-medium">Masters:</span> {profile.mastersDegree}{profile.mastersStream ? ` - ${profile.mastersStream}` : ''}{profile.mastersPercentage ? ` | ${profile.mastersPercentage}` : ''}{profile.mastersCgpa ? ` | CGPA ${profile.mastersCgpa}` : ''}</p>}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-heading mb-2">Skills & Experience</h3>
                  <div className="space-y-1 text-sm text-body-text">
                    {profile.technicalSkills && <p><span className="font-medium">Technical Skills:</span> {profile.technicalSkills}</p>}
                    {profile.programmingLanguages && <p><span className="font-medium">Languages:</span> {profile.programmingLanguages}</p>}
                    {profile.frameworks && <p><span className="font-medium">Frameworks:</span> {profile.frameworks}</p>}
                    {profile.databaseSkills && <p><span className="font-medium">Databases:</span> {profile.databaseSkills}</p>}
                    {profile.projects && <p><span className="font-medium">Projects:</span> {profile.projects}</p>}
                    {profile.certifications && <p><span className="font-medium">Certifications:</span> {profile.certifications}</p>}
                    {profile.internshipExperience && <p><span className="font-medium">Internship:</span> {profile.internshipExperience}</p>}
                    {!profile.technicalSkills && !profile.programmingLanguages && !profile.frameworks && !profile.databaseSkills && !profile.projects && !profile.certifications && !profile.internshipExperience && (
                      <p className="text-gray-400">No skills or experience added yet.</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-heading mb-2">Links & Documents</h3>
                  <div className="space-y-1 text-sm text-body-text">
                    {profile.linkedinProfile && <p><span className="font-medium">LinkedIn:</span> <a href={profile.linkedinProfile} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline break-all">{profile.linkedinProfile}</a></p>}
                    {profile.githubProfile && <p><span className="font-medium">GitHub:</span> <a href={profile.githubProfile} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline break-all">{profile.githubProfile}</a></p>}
                    {profile.portfolioUrl && <p><span className="font-medium">Portfolio:</span> <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline break-all">{profile.portfolioUrl}</a></p>}
                    {profile.resumeUrl && <p><span className="font-medium">Resume:</span> <a href={apiFile(profile.resumeUrl)} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline break-all">{profile.resumeUrl}</a></p>}
                    {!profile.linkedinProfile && !profile.githubProfile && !profile.portfolioUrl && !profile.resumeUrl && (
                      <p className="text-gray-400">No links or documents added yet.</p>
                    )}
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

      {/* Percentage Update Request Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setRequestModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary-100">
              <div>
                <h3 className="text-lg font-bold text-heading">Request Percentage / CGPA Update</h3>
                <p className="text-xs text-body-text">These fields are locked after first save. The placement team will review your request.</p>
              </div>
              <button onClick={() => setRequestModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ['tenth', '10th Percentage', profile.tenthPercentage],
                  ['tenth12', '12th / Diploma %', profile.twelfthDiplomaPercentage],
                  ['bachelorsPct', 'Bachelors %', profile.bachelorsPercentage],
                  ['bachelorsCgpa', 'Bachelors CGPA', profile.bachelorsCgpa],
                  ['mastersPct', 'Masters %', profile.mastersPercentage],
                  ['mastersCgpa', 'Masters CGPA', profile.mastersCgpa]
                ].map(([key, label, current]) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-body-text mb-1">{label}</label>
                    <p className="text-[11px] text-gray-400 mb-1">Current: <span className="font-medium text-gray-500">{current || 'Not set'}</span></p>
                    <input
                      type="text"
                      value={requestForm[key]}
                      onChange={(e) => setRequestForm({ ...requestForm, [key]: e.target.value })}
                      className="input-field"
                      placeholder="Enter new value"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-body-text mb-1">Note (optional)</label>
                <textarea
                  value={requestForm.note}
                  onChange={(e) => setRequestForm({ ...requestForm, note: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Reason for update, corrected document, etc."
                />
              </div>
              {requestMessage && (
                <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{requestMessage}</p>
              )}
              <div className="flex justify-end gap-3 pt-1">
                <button onClick={() => setRequestModalOpen(false)} className="btn-secondary">Cancel</button>
                <button onClick={submitUpdateRequest} disabled={requestSubmitting} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  <Mail className="w-4 h-4" />
                  {requestSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlacementProfile
