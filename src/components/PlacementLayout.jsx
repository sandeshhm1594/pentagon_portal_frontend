import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  Building2, 
  Briefcase, 
  Calendar, 
  Shield,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Users
} from 'lucide-react'
import placementImage from '../Placement.jpg'
import pentagonLogo from '../pentagon-log.png'

const PlacementLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="placement-module relative isolate min-h-screen bg-white">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${placementImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/70 to-white/85" />
      </div>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}>
        <div className="p-6 border-b border-primary-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <img src={pentagonLogo} alt="Pentagon Space Logo" className="w-10 h-10 object-contain flex-shrink-0" />
            <h2 className={`text-lg font-bold text-gold-600 ${!sidebarOpen && 'hidden'}`}>PentagonSpace</h2>
          </div>
        </div>
        <nav className="mt-6 px-3 flex-1 overflow-y-auto custom-scrollbar">
          <button onClick={() => navigate('/placement')} className={`sidebar-link mb-1 ${location.pathname === '/placement' ? 'sidebar-link-active' : ''}`}>
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Dashboard</span>
          </button>
          <button onClick={() => navigate('/placement/companies')} className={`sidebar-link mb-1 ${isActive('/placement/companies') ? 'sidebar-link-active' : ''}`}>
            <Building2 className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Companies</span>
          </button>
          <button onClick={() => navigate('/placement/job-requirements')} className={`sidebar-link mb-1 ${isActive('/placement/job-requirements') ? 'sidebar-link-active' : ''}`}>
            <Briefcase className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Job Requirements</span>
          </button>
          <button onClick={() => navigate('/placement/placement-drives')} className={`sidebar-link mb-1 ${isActive('/placement/placement-drives') ? 'sidebar-link-active' : ''}`}>
            <Calendar className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Placement Drives</span>
          </button>
          <button onClick={() => navigate('/placement/applications')} className={`sidebar-link mb-1 ${isActive('/placement/applications') ? 'sidebar-link-active' : ''}`}>
            <Users className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Applications</span>
          </button>
          <button onClick={() => navigate('/placement/team')} className={`sidebar-link mb-1 ${isActive('/placement/team') ? 'sidebar-link-active' : ''}`}>
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
      <div className={`placement-content transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Outlet context={{ sidebarOpen, setSidebarOpen }} />
      </div>
    </div>
  )
}

export default PlacementLayout
