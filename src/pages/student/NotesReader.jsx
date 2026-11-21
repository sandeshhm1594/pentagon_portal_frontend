import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, ChevronLeft, ChevronRight, Search, ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react'
import axios from 'axios'

const NotesReader = () => {
  const { notesId } = useParams()
  const navigate = useNavigate()
  const { logout } = useAuth()
  
  const [notes, setNotes] = useState(null)
  const [pages, setPages] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [showZoomMenu, setShowZoomMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const zoomLevels = [75, 90, 100, 110, 125, 150]

  useEffect(() => {
    fetchNotesPages()
  }, [notesId])

  useEffect(() => {
    // Style code-like paragraphs after content is loaded
    const paragraphs = document.querySelectorAll('.notes-content p')
    paragraphs.forEach(p => {
      const text = p.textContent || ''
      // Check if paragraph looks like code
      const hasBraces = text.includes('{') || text.includes('}')
      const hasSemicolon = text.includes(';') && !text.includes('; ')
      const hasKeywords = /^(public|private|protected|class|interface|import|package|def|function|var|let|const|if|else|for|while|return|try|catch|throw|new|this|super)\s+/.test(text)
      const hasSystemOut = text.includes('System.out.println') || text.includes('System.out.print')
      const hasMain = text.includes('main(String[]') || text.includes('main(String')
      
      if (hasBraces || hasSemicolon || hasKeywords || hasSystemOut || hasMain) {
        p.classList.add('code-paragraph')
      }
    })
  }, [pages, currentPage])

  const fetchNotesPages = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/student/notes/${notesId}/pages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPages(response.data)
      setCurrentPage(1)
    } catch (error) {
      console.error('Error fetching notes pages:', error)
      if (error.response?.status === 403) {
        navigate('/student/notes/approved', { state: { toastMessage: 'You do not have access to these notes', toastType: 'error' } })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/student/notes/${notesId}/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSearchResults(response.data)
    } catch (error) {
      console.error('Error searching notes:', error)
    }
  }

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pages.length) {
      setCurrentPage(pageNumber)
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => {
      const currentIndex = zoomLevels.indexOf(prev)
      if (currentIndex < zoomLevels.length - 1) {
        return zoomLevels[currentIndex + 1]
      }
      return prev
    })
  }

  const handleZoomOut = () => {
    setZoom(prev => {
      const currentIndex = zoomLevels.indexOf(prev)
      if (currentIndex > 0) {
        return zoomLevels[currentIndex - 1]
      }
      return prev
    })
  }

  const handleResetZoom = () => {
    setZoom(100)
  }

  const handleFitToWidth = () => {
    setZoom('fit')
  }

  const handleZoomSelect = (level) => {
    setZoom(level)
    setShowZoomMenu(false)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 font-medium">No content available</p>
          <button
            onClick={() => navigate('/student/notes/approved')}
            className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold shadow-md shadow-primary-500/30 hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            Back to Approved Notes
          </button>
        </div>
      </div>
    )
  }

  const currentPageContent = pages.find(p => p.pageNumber === currentPage)

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-br from-white via-primary-50/30 to-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#17023A] via-[#2B0452] to-[#35063e] px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student/notes/approved')}
            className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/25 transition-all duration-200 hover:scale-105"
            title="Back to notes"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{pages[0]?.notesTitle || 'Notes'}</h1>
            <p className="text-xs text-white/60">
              {pages[0]?.chapterName || ''} • Page {currentPage} of {pages.length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-105 ${showSearch ? 'bg-white/25 text-white' : 'bg-white/10 text-white hover:bg-white/25'}`}
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          
          {/* Zoom Controls */}
          <div className="relative">
            <button
              onClick={() => setShowZoomMenu(!showZoomMenu)}
              className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/25 transition-all duration-200 flex items-center gap-1"
              title="Zoom"
            >
              <ZoomOut className="w-4 h-4" />
              <span className="text-xs font-semibold w-10 text-center">{zoom === 'fit' ? 'Fit' : zoom + '%'}</span>
              <ZoomIn className="w-4 h-4" />
            </button>
            
            {showZoomMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-md border border-white/40 rounded-2xl shadow-2xl shadow-purple-900/30 z-10 min-w-[150px] overflow-hidden">
                {zoomLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => handleZoomSelect(level)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      zoom === level ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold' : 'text-gray-700 hover:bg-primary-50'
                    }`}
                  >
                    {level}%
                  </button>
                ))}
                <button
                  onClick={handleFitToWidth}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors border-t border-primary-100 ${
                    zoom === 'fit' ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white font-semibold' : 'text-gray-700 hover:bg-primary-50'
                  }`}
                >
                  Fit to Width
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={handleResetZoom}
            className="px-3.5 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/25 transition-all duration-200"
            title="Reset Zoom"
          >
            Reset
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/25 transition-all duration-200 hover:scale-105"
            title="Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="bg-white/80 backdrop-blur-md border-b border-primary-100 px-6 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search within notes..."
                className="w-full pl-11 pr-4 py-2.5 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:shadow-md transition-all text-sm"
              />
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-primary-400 w-4 h-4" />
            </div>
            <button
              onClick={handleSearch}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-semibold shadow-md shadow-primary-500/30 hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Search
            </button>
            <button
              onClick={() => {
                setShowSearch(false)
                setSearchQuery('')
                setSearchResults([])
              }}
              className="p-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Found on pages:</span>
              {searchResults.map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-md shadow-primary-500/30'
                      : 'bg-primary-50 text-primary-700 border border-primary-100 hover:bg-primary-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 md:p-10">
        <style>{`
          .notes-content {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
          }
          .notes-content h1 {
            font-weight: 700;
            font-size: 1.75rem;
            margin: 2rem 0 1rem 0;
            color: #1a1a1a;
            line-height: 1.3;
          }
          .notes-content h2 {
            font-weight: 700;
            font-size: 1.5rem;
            margin: 1.75rem 0 0.875rem 0;
            color: #1a1a1a;
            line-height: 1.35;
          }
          .notes-content h3 {
            font-weight: 700;
            font-size: 1.25rem;
            margin: 1.5rem 0 0.75rem 0;
            color: #1a1a1a;
            line-height: 1.4;
          }
          .notes-content h1, .notes-content h2, .notes-content h3, .notes-content h4, .notes-content h5, .notes-content h6 {
            font-weight: 700;
            color: #1a1a1a;
          }
          .notes-content p {
            text-align: justify;
            line-height: 1.8;
            margin: 0.75rem 0;
            color: #333;
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          .notes-content p.code-paragraph {
            background-color: #f8f9fa;
            color: #212529;
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 1rem 0;
            overflow-x: auto;
            font-family: 'Courier New', Consolas, Monaco, 'Lucida Console', monospace;
            font-size: 0.9rem;
            line-height: 1.5;
            border: 1px solid #e9ecef;
            white-space: pre;
            word-wrap: normal;
            tab-size: 4;
            font-weight: 600;
            text-align: left;
          }
          .notes-content ul {
            margin: 0.75rem 0;
            padding-left: 1.5rem;
            list-style-type: disc;
          }
          .notes-content ol {
            margin: 0.75rem 0;
            padding-left: 1.5rem;
            list-style-type: decimal;
          }
          .notes-content li {
            text-align: left;
            line-height: 1.6;
            margin: 0.5rem 0;
            color: #333;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .notes-content pre {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 1rem 0;
            overflow-x: auto;
          }
          .notes-content pre code {
            background: transparent;
            color: #212529;
            padding: 0;
            font-family: 'Courier New', Consolas, Monaco, monospace;
            font-size: 0.9rem;
            line-height: 1.5;
            white-space: pre;
            font-weight: 400;
          }
          .notes-content code {
            background-color: #f1f3f5;
            color: #d6336c;
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
            font-family: 'Courier New', Consolas, Monaco, monospace;
            font-size: 0.875em;
          }
          .notes-content strong {
            font-weight: 700;
            color: #1a1a1a;
          }
          .notes-content em {
            font-style: italic;
          }
        `}</style>
        <div
          className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-primary-900/10 border border-primary-100 p-8 md:p-12" 
          style={{ 
            transform: zoom === 'fit' ? 'scale(1)' : `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            width: zoom === 'fit' ? '100%' : 'auto'
          }}
        >
          {currentPageContent ? (
            <div 
              className="prose prose-lg max-w-none notes-content"
              dangerouslySetInnerHTML={{ __html: currentPageContent.extractedHtml }}
            />
          ) : (
            <p className="text-gray-500 text-center">No content available for this page</p>
          )}
        </div>
      </div>

      {/* Footer Pagination */}
      <div className="bg-white/80 backdrop-blur-md border-t border-primary-100 px-6 py-4 flex items-center justify-center gap-4 shadow-[0_-10px_40px_-20px_rgba(53,6,62,0.3)]">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2.5 rounded-xl bg-white border border-primary-200 text-primary-600 shadow-sm hover:bg-primary-50 hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <input
            type="number"
            min="1"
            max={pages.length}
            value={currentPage}
            onChange={(e) => goToPage(parseInt(e.target.value))}
            className="w-16 px-3 py-2 border border-primary-200 rounded-xl text-center text-sm font-semibold text-heading focus:outline-none focus:border-primary-500 focus:shadow-md transition-all"
          />
          <span className="text-sm text-body-text font-medium">of {pages.length}</span>
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === pages.length}
          className="p-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-md shadow-primary-500/30 hover:shadow-lg hover:scale-105 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default NotesReader
