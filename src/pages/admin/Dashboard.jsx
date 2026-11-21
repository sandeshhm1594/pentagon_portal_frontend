import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  UserCheck, 
  BookOpen, 
  Users, 
  Calendar, 
  TrendingUp,
  Menu,
  X,
  Clock,
  Timer
} from 'lucide-react'
import axios from 'axios'
import LoginSuccessToast from '../../components/LoginSuccessToast'

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const { sidebarOpen, setSidebarOpen } = useOutletContext()

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/dashboard/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStatistics(response.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-primary-50/50 p-6 shadow-lg hover:shadow-2xl hover:shadow-primary-500/20 transition-all duration-500 hover:-translate-y-1 border border-primary-100">
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        <p className="text-gray-600 text-sm font-semibold mb-1 uppercase tracking-wider">{title}</p>
        <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">{value}</p>
      </div>
    </div>
  )

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1"
        >
          {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Trainers"
          value={statistics?.totalTrainers || 0}
          icon={UserCheck}
          color="bg-gradient-to-br from-primary-500 to-primary-600"
        />
        <StatCard
          title="Active Batches"
          value={statistics?.activeBatches || 0}
          icon={BookOpen}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Total Students"
          value={statistics?.totalStudents || 0}
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Today's Attendance"
          value={`${statistics?.todayAttendancePercentage?.toFixed(1) || 0}%`}
          icon={TrendingUp}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Upcoming Batches */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100">
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="relative p-8">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-6 flex items-center gap-3">
            <Calendar className="w-7 h-7 text-primary-600" />
            Upcoming Batch Schedules
          </h2>
          {statistics?.upcomingBatches?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statistics.upcomingBatches.map((batch, index) => (
                <div key={batch.id} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-primary-50/50 p-6 shadow-lg hover:shadow-2xl hover:shadow-primary-500/20 transition-all duration-500 hover:-translate-y-1 border border-primary-100">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                        Batch #{index + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-primary-900 mb-2">{batch.batchCode}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <BookOpen className="w-4 h-4 text-primary-500" />
                        <span className="text-sm">{batch.subject}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-primary-500" />
                        <span className="text-sm">{new Date(batch.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Timer className="w-4 h-4 text-primary-500" />
                        <span className="text-sm">{batch.scheduleTime || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-primary-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No upcoming batches scheduled</p>
            </div>
          )}
        </div>
      </div>
      <LoginSuccessToast />
    </div>
  )
}

export default AdminDashboard
