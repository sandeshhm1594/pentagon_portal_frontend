import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

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
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Outlet context={{ sidebarOpen, setSidebarOpen }} />
      </div>
    </div>
  )
}

export default AdminLayout
