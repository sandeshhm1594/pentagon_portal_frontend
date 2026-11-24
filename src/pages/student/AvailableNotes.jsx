import { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FileText, BookOpen, Search, Menu, X, Eye, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import axios from 'axios'

const AvailableNotes = () => {
  const [notes, setNotes] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }
  const navigate = useNavigate()
  const { logout } = useAuth()
  const outletContext = useOutletContext()
  const sidebarOpen = outletContext?.sidebarOpen ?? true
  const setSidebarOpen = outletContext?.setSidebarOpen ?? (() => {})

  useEffect(() => {
    fetchAvailableNotes()
    fetchMyRequests()
  }, [])

  const fetchAvailableNotes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/student/notes/available', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotes(response.data)
    } catch (error) {
      console.error('Error fetching available notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/student/notes/my-requests', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMyRequests(response.data)
    } catch (error) {
      console.error('Error fetching my requests:', error)
    }
  }

  const hasAccess = (notesId) => {
    const request = myRequests.find(r => r.notesId === notesId)
    return request && request.requestStatus === 'APPROVED'
  }

  const hasPendingRequest = (notesId) => {
    const request = myRequests.find(r => r.notesId === notesId)
    return request && request.requestStatus === 'PENDING'
  }

  const handleRequestAccess = async (notesId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(`/api/student/notes/${notesId}/request-access`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('Access request sent successfully')
      fetchMyRequests()
    } catch (error) {
      console.error('Error requesting access:', error)
      showToast(error.response?.data?.message || 'Error requesting access', 'error')
    }
  }

  const handleViewNotes = (notesId) => {
    navigate(`/student/notes/read/${notesId}`)
  }

  const filteredNotes = notes.filter(note =>
    note.notesTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.chapterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.subjectName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Available Notes</h1>
          <p className="text-gray-600">Browse and request access to study materials.</p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
          {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search notes by title, chapter, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-12 text-center">
          <BookOpen className="w-16 h-16 text-primary-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No notes available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div key={note.id} className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{note.notesTitle}</h3>
                    <p className="text-sm text-gray-600">{note.chapterName}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Subject:</span> {note.subjectName || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Batch:</span> {note.batchCode || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Pages:</span> {note.totalPages}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Uploaded by:</span> {note.trainerName || 'N/A'}
                  </p>
                </div>

                {hasAccess(note.id) ? (
                  <button
                    onClick={() => handleViewNotes(note.id)}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    View Notes
                  </button>
                ) : hasPendingRequest(note.id) ? (
                  <button
                    disabled
                    className="w-full rounded-xl bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2.5 text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Clock className="w-5 h-5" />
                    Request Pending
                  </button>
                ) : (
                  <button
                    onClick={() => handleRequestAccess(note.id)}
                    className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/30 hover:shadow-lg hover:scale-[1.02] transition-all"
                  >
                    Request Access
                  </button>
                )}
              </div>
            </div>
          ))}
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

export default AvailableNotes
