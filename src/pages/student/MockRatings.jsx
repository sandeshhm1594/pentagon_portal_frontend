import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Star,
  Menu,
  X
} from 'lucide-react'
import axios from 'axios'

const StudentMockRatings = () => {
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const outletContext = useOutletContext()
  const sidebarOpen = outletContext?.sidebarOpen ?? true
  const setSidebarOpen = outletContext?.setSidebarOpen ?? (() => {})
  const { user } = useAuth()

  useEffect(() => {
    fetchRatings()
  }, [])

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/mock-ratings/student/${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRatings(response.data)
    } catch (error) {
      console.error('Error fetching ratings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">My Mock Ratings</h1>
        <p className="text-gray-600">Your mock interview performance over time.</p>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
          {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
        </button>
      </div>

        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6">
          {ratings.length === 0 ? (
            <p className="text-body-text">No ratings found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="pd-table w-full min-w-[700px]">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Batch</th>
                    <th>Rating</th>
                    <th>Date</th>
                    <th>Remarks</th>
                    <th>Trainer</th>
                  </tr>
                </thead>
                <tbody>
                  {ratings.map(rating => (
                    <tr key={rating.id}>
                      <td>
                        <div>
                          <p className="font-medium text-heading">{rating.subjectName}</p>
                          <p className="text-sm text-body-text">{rating.subjectCode}</p>
                        </div>
                      </td>
                      <td>{rating.batchCode}</td>
                      <td>
                        <span className={`badge ${
                          rating.rating >= 7 ? 'badge-success' :
                          rating.rating >= 5 ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {rating.rating}/10
                        </span>
                      </td>
                      <td>{rating.mockDate}</td>
                      <td>{rating.remarks || '-'}</td>
                      <td>{rating.trainerName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {ratings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="card card-hover relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
                    <Star className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-heading">Average Rating</h3>
                </div>
                <p className="text-3xl font-bold text-primary">
                  {Math.round(ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length)}
                  <span className="text-base text-body-text font-medium">/10</span>
                </p>
              </div>
            </div>
            <div className="card card-hover relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
                    <Star className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-heading">Total Tests</h3>
                </div>
                <p className="text-3xl font-bold text-success">{ratings.length}</p>
              </div>
            </div>
            <div className="card card-hover relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-violet-400/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md">
                    <Star className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-heading">Highest Score</h3>
                </div>
                <p className="text-3xl font-bold text-secondary">
                  {Math.max(...ratings.map(r => r.rating))}
                  <span className="text-base text-body-text font-medium">/10</span>
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default StudentMockRatings
