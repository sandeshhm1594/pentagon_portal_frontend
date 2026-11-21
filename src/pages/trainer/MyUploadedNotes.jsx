import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FileText, Edit, Trash2, Eye, Menu, X, Search } from 'lucide-react'
import axios from 'axios'

const MyUploadedNotes = () => {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/trainer/notes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotes(response.data)
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (notesId) => {
    if (!window.confirm('Are you sure you want to delete these notes?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/trainer/notes/${notesId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Notes deleted successfully')
      fetchNotes()
    } catch (error) {
      console.error('Error deleting notes:', error)
      alert('Error deleting notes')
    }
  }

  const handleToggleStatus = async (notesId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/trainer/notes/${notesId}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchNotes()
    } catch (error) {
      console.error('Error toggling status:', error)
      alert('Error toggling status')
    }
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
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">My Uploaded Notes</h1>
          <p className="text-gray-600">View and manage your uploaded study materials.</p>
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
          <FileText className="w-16 h-16 text-primary-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No notes found</p>
          <button
            onClick={() => navigate('/trainer/notes/upload')}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Upload Notes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div key={note.id} className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{note.notesTitle}</h3>
                    <p className="text-sm text-gray-600">{note.chapterName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    note.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {note.status}
                  </span>
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
                    <span className="font-medium">Uploaded:</span> {new Date(note.uploadDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-primary-200">
                  <button
                    onClick={() => navigate(`/trainer/notes/edit/${note.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(note.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    {note.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyUploadedNotes
