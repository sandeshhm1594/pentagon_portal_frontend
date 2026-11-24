import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  UserCheck, 
  BookOpen, 
  Users, 
  Calendar, 
  QrCode,
  GraduationCap,
  Library,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Briefcase,
  Building2,
  TrendingUp,
  Shield,
  FileText
} from 'lucide-react'
import pentagonLogo from '../pentagon-log.png'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-white">
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col ${sidebarOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full'}`}>
        <div className="p-6 border-b border-primary-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <img src={pentagonLogo} alt="Pentagon Space Logo" className="w-10 h-10 object-contain flex-shrink-0" />
            <h2 className={`text-lg font-bold text-gold-600 ${!sidebarOpen && 'hidden'}`}>PentagonSpace</h2>
          </div>
        </div>
        <nav className="mt-6 px-3 flex-1 overflow-y-auto custom-scrollbar">
          <button onClick={() => navigate('/admin')} className="sidebar-link mb-1">
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Dashboard</span>
          </button>
          <button onClick={() => navigate('/admin/enquiries')} className="sidebar-link mb-1">
            <MessageSquare className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Enquiries</span>
          </button>
          <button onClick={() => navigate('/admin/trainers')} className="sidebar-link mb-1">
            <UserCheck className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Trainers</span>
          </button>
          <button onClick={() => navigate('/admin/batches')} className="sidebar-link mb-1">
            <BookOpen className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Batches</span>
          </button>
          <button onClick={() => navigate('/admin/students')} className="sidebar-link mb-1">
            <Users className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Students</span>
          </button>
          <button onClick={() => navigate('/admin/account-requests')} className="sidebar-link mb-1">
            <UserCheck className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Account Requests</span>
          </button>
          <button onClick={() => navigate('/admin/attendance')} className="sidebar-link mb-1">
            <Calendar className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Attendance</span>
          </button>
          <button onClick={() => navigate('/admin/qr-scanner')} className="sidebar-link mb-1">
            <QrCode className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>QR Scanner</span>
          </button>
          <button onClick={() => navigate('/admin/courses')} className="sidebar-link mb-1">
            <GraduationCap className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Courses</span>
          </button>
          <button onClick={() => navigate('/admin/subjects')} className="sidebar-link mb-1">
            <Library className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Subjects</span>
          </button>
          <button onClick={() => navigate('/admin/course-enrollments')} className="sidebar-link mb-1">
            <GraduationCap className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Enrollments</span>
          </button>
          <button onClick={() => navigate('/admin/batch-enrollments')} className="sidebar-link mb-1">
            <BookOpen className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Batch Enrollments</span>
          </button>
          <button onClick={() => navigate('/admin/notes')} className="sidebar-link mb-1">
            <FileText className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Notes Management</span>
          </button>
          <div className={`my-2 border-t border-primary-200 ${!sidebarOpen && 'hidden'}`}></div>
          <button onClick={() => navigate('/admin/placement-dashboard')} className="sidebar-link mb-1">
            <TrendingUp className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Placement Dashboard</span>
          </button>
          <button onClick={() => navigate('/admin/companies')} className="sidebar-link mb-1">
            <Building2 className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Companies</span>
          </button>
          <button onClick={() => navigate('/admin/job-requirements')} className="sidebar-link mb-1">
            <Briefcase className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Job Requirements</span>
          </button>
          <button onClick={() => navigate('/admin/placement-drives')} className="sidebar-link mb-1">
            <Calendar className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Placement Drives</span>
          </button>
          <button onClick={() => navigate('/admin/placement-team')} className="sidebar-link mb-1">
            <Shield className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Placement Team</span>
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
      <div className={`transition-all duration-300 ml-0 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur border-b border-primary-100">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl bg-white shadow border border-primary-200">
            {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
          </button>
          <img src={pentagonLogo} alt="Pentagon Space Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-gold-600">PentagonSpace</span>
        </div>
        <Outlet context={{ sidebarOpen, setSidebarOpen }} />
      </div>
    </div>
  )
}

export default AdminLayout
