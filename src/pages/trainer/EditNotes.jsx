import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, Upload, X, FileText } from 'lucide-react'
import axios from 'axios'

const EditNotes = () => {
  const { notesId } = useParams()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [formData, setFormData] = useState({
    notesTitle: '',
    description: '',
    subjectId: '',
    batchId: '',
    chapterName: ''
  })
  const [subjects, setSubjects] = useState([])
  const [batches, setBatches] = useState([])
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchNotesData()
    fetchSubjects()
    fetchBatches()
  }, [notesId])

  const fetchNotesData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/trainer/notes/${notesId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const notes = response.data
      setFormData({
        notesTitle: notes.notesTitle,
        description: notes.description,
        subjectId: notes.subjectId,
        batchId: notes.batchId,
        chapterName: notes.chapterName
      })
    } catch (error) {
      console.error('Error fetching notes:', error)
      if (error.response?.status === 403) {
        alert('You are not authorized to edit these notes')
        navigate('/trainer/notes/my-uploaded')
      } else {
        setError('Failed to load notes data')
      }
    } finally {
      setLoading(false)
    }
  }

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
      const response = await axios.get('/api/batches', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBatches(response.data)
    } catch (error) {
      console.error('Error fetching batches:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
    } else {
      alert('Please select a PDF file')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const formDataToSend = new FormData()
      
      const notesDataBlob = new Blob([JSON.stringify(formData)], {
        type: 'application/json'
      })
      formDataToSend.append('notesData', notesDataBlob)
      
      if (file) {
        formDataToSend.append('file', file)
      }

      await axios.put(`/api/trainer/notes/${notesId}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      alert('Notes updated successfully')
      navigate('/trainer/notes/my-notes')
    } catch (error) {
      console.error('Error updating notes:', error)
      setError(error.response?.data?.message || 'Failed to update notes')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/trainer/notes/my-uploaded')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">Edit Notes</h1>
            <p className="text-gray-600">Update your study materials.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-primary-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes Title *</label>
              <input
                type="text"
                name="notesTitle"
                value={formData.notesTitle}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Enter notes title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chapter Name *</label>
              <input
                type="text"
                name="chapterName"
                value={formData.chapterName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Enter chapter name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subjectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Batch *</label>
              <select
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="">Select Batch</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batchCode} - {batch.batchName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors resize-none"
              placeholder="Enter notes description"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Replace PDF File (Optional)
            </label>
            <div className="relative border-2 border-dashed border-primary-300 rounded-xl p-8 text-center hover:border-primary-500 transition-colors">
              {file ? (
                <div className="flex items-center justify-center gap-4">
                  <FileText className="w-8 h-8 text-primary-600" />
                  <span className="text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop a PDF file here, or click to select</p>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
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
              disabled={submitting}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Updating...' : 'Update Notes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/trainer/notes/my-uploaded')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditNotes
