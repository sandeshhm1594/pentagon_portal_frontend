import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import {
  User,
  Star,
  Briefcase,
  Building2,
  LogOut,
  BookOpen,
  ChevronDown
} from 'lucide-react'
import pentagonLogo from '../pentagon-log.png'
import { apiFile } from '../api'

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [student, setStudent] = useState(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/student/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setStudent(response.data)
      } catch (error) {
        console.error('Error fetching student profile:', error)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const displayName = student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : (localStorage.getItem('username') || 'Student')
  const initials = displayName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'S'

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}>
        <div className="p-6 border-b border-primary-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <img src={pentagonLogo} alt="Pentagon Space Logo" className="w-10 h-10 object-contain flex-shrink-0" />
            <h2 className={`text-lg font-bold text-gold-600 ${!sidebarOpen && 'hidden'}`}>PentagonSpace</h2>
          </div>
        </div>
        <nav className="mt-6 px-3 flex-1 overflow-y-auto custom-scrollbar">
          <button onClick={() => navigate('/student')} className={`sidebar-link mb-1 ${location.pathname === '/student' ? 'sidebar-link-active' : ''}`}>
            <User className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Dashboard</span>
          </button>
          <button onClick={() => navigate('/student/notes/available')} className={`sidebar-link mb-1 ${isActive('/student/notes') ? 'sidebar-link-active' : ''}`}>
            <BookOpen className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Notes</span>
          </button>
          <button onClick={() => navigate('/student/mock-ratings')} className={`sidebar-link mb-1 ${isActive('/student/mock-ratings') ? 'sidebar-link-active' : ''}`}>
            <Star className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>My Ratings</span>
          </button>
          <button onClick={() => navigate('/student/placement-profile')} className={`sidebar-link mb-1 ${isActive('/student/placement-profile') ? 'sidebar-link-active' : ''}`}>
            <Briefcase className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>My Profile</span>
          </button>
          <button onClick={() => navigate('/student/placement-drives')} className={`sidebar-link mb-1 ${isActive('/student/placement-drives') ? 'sidebar-link-active' : ''}`}>
            <Building2 className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Placement Drives</span>
          </button>
        </nav>
        <div className="p-3 border-t border-primary-200 flex-shrink-0">
          <button onClick={handleLogout} className="sidebar-link text-danger hover:text-danger-600 hover:bg-danger-50">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Top-right profile */}
        <div className="flex justify-end px-8 pt-5">
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-3 bg-white rounded-2xl border border-primary-200 shadow-md shadow-primary-500/10 pl-1.5 pr-3 py-1.5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              {student?.profileImage ? (
                <img src={apiFile(student.profileImage)} alt={displayName} className="w-10 h-10 rounded-xl object-cover border border-primary-100" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                  {initials}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-heading leading-tight">{displayName}</p>
                <p className="text-[11px] text-body-text leading-tight">{student?.studentCode || 'Student'}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-primary-500 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-primary-100 shadow-2xl shadow-primary-900/20 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-primary-100 bg-gradient-to-r from-primary-50 to-violet-50">
                  <p className="text-sm font-bold text-heading truncate">{displayName}</p>
                  <p className="text-xs text-body-text truncate">{student?.email || ''}</p>
                </div>
                <button
                  onClick={() => { setProfileMenuOpen(false); navigate('/student/placement-profile') }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                >
                  <User className="w-4 h-4" /> My Profile
                </button>
                <button
                  onClick={() => { setProfileMenuOpen(false); handleLogout() }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-primary-100"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <Outlet context={{ sidebarOpen, setSidebarOpen }} />
      </div>
    </div>
  )
}

export default StudentLayout
