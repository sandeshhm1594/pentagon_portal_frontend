import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FileText, BookOpen, Menu, X, Search } from 'lucide-react'
import axios from 'axios'

const AdminNotesManagement = () => {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { sidebarOpen, setSidebarOpen } = useOutletContext()
  const { logout } = useAuth()

  useEffect(() => {
    fetchAllNotes()
  }, [])

  const fetchAllNotes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/notes/all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotes(response.data)
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNotes = notes.filter(note =>
    note.notesTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.chapterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.trainerName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Notes Management</h1>
          <p className="text-gray-600">Overview of all study materials in the system.</p>
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
            placeholder="Search notes by title, chapter, subject, or trainer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-100 rounded-xl">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Total Notes</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{notes.length}</p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Active Notes</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{notes.filter(n => n.status === 'ACTIVE').length}</p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Total Pages</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{notes.reduce((sum, n) => sum + (n.totalPages || 0), 0)}</p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-6">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Unique Trainers</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{[...new Set(notes.map(n => n.trainerId))].length}</p>
          </div>
        </div>
      </div>

      {/* Notes Table */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100">
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="relative overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-50 border-b-2 border-primary-200">
                <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Title</th>
                <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Chapter</th>
                <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Subject</th>
                <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Batch</th>
                <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Trainer</th>
                <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Pages</th>
                <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Status</th>
                <th className="text-left py-4 px-4 text-primary-900 font-bold uppercase tracking-wider text-sm">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500">
                    No notes found
                  </td>
                </tr>
              ) : (
                filteredNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-primary-50/50 transition-colors duration-200 border-b border-primary-100">
                    <td className="py-4 px-4 font-medium text-gray-900">{note.notesTitle}</td>
                    <td className="py-4 px-4 text-gray-700">{note.chapterName}</td>
                    <td className="py-4 px-4 text-gray-700">{note.subjectName || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-700">{note.batchCode || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-700">{note.trainerName || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-700">{note.totalPages}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        note.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {note.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {note.uploadDate ? new Date(note.uploadDate).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminNotesManagement
