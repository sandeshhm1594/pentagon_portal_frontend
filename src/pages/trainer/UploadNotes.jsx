import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import axios from 'axios'

const UploadNotes = () => {
  const [formData, setFormData] = useState({
    notesTitle: '',
    description: '',
    subjectId: '',
    batchId: '',
    chapterName: ''
  })
  const [file, setFile] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    fetchSubjects()
    fetchBatches()
  }, [])

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSubjects(response.data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/trainer/batches', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBatches(response.data)
    } catch (error) {
      console.error('Error fetching batches:', error)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        alert('Only PDF files are allowed')
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      alert('Please select a PDF file')
      return
    }

    setUploading(true)
    try {
      const token = localStorage.getItem('token')
      const formDataToSend = new FormData()
      const notesDataBlob = new Blob([JSON.stringify(formData)], { type: 'application/json' })
      formDataToSend.append('notesData', notesDataBlob, 'notesData.json')
      formDataToSend.append('file', file)

      const response = await axios.post('/api/trainer/notes/upload', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      alert('Notes uploaded successfully!')
      navigate('/trainer/notes/my-notes')
    } catch (error) {
      console.error('Error uploading notes:', error)
      alert('Error uploading notes')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Upload Notes</h1>
          <p className="text-gray-600">Upload PDF study materials for your students.</p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
          <X className="w-5 h-5 text-primary-600" />
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 p-8">
          <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Notes Title *</label>
                  <input
                    type="text"
                    value={formData.notesTitle}
                    onChange={(e) => setFormData({ ...formData, notesTitle: e.target.value })}
                    className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Subject *</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.subjectCode} - {subject.subjectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Batch *</label>
                  <select
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchCode}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Chapter / Topic *</label>
                  <input
                    type="text"
                    value={formData.chapterName}
                    onChange={(e) => setFormData({ ...formData, chapterName: e.target.value })}
                    className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">PDF File *</label>
                  <div className="border-2 border-dashed border-primary-300 rounded-xl p-8 text-center hover:border-primary-500 transition-colors">
                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-primary-600" />
                        <span className="text-gray-700 font-medium">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">PDF files only (Max 10MB)</p>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf"
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="inline-block mt-4 px-6 py-2 bg-primary-100 text-primary-700 rounded-lg cursor-pointer hover:bg-primary-200 transition-colors"
                        >
                          Select File
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Notes'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/trainer/notes')}
                    className="px-6 py-3 border border-primary-200 text-gray-700 rounded-xl font-medium hover:bg-primary-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadNotes
