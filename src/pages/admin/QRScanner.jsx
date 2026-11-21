import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Menu, X, QrCode, Check, X as XIcon, Camera, CameraOff, Loader2 } from 'lucide-react'
import axios from 'axios'
import { Html5Qrcode } from 'html5-qrcode'

const QRScanner = () => {
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [scannedResult, setScannedResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [manualQRInput, setManualQRInput] = useState('')
  const { sidebarOpen, setSidebarOpen } = useOutletContext()
  const { logout } = useAuth()
  const html5QrCodeRef = useRef(null)
  // Refs so the camera callback always sees the latest batch and never double-submits
  const selectedBatchRef = useRef(null)
  const processingRef = useRef(false)

  useEffect(() => {
    fetchBatches()
  }, [])

  // Keep the ref in sync with the selected batch
  useEffect(() => {
    selectedBatchRef.current = selectedBatch
  }, [selectedBatch])

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/batches', {
        headers: { Authorization: `Bearer ${token}` }
      })
      // FIX: default selection now comes from the filtered (active) list
      const activeBatches = response.data.filter(b => b.active)
      setBatches(activeBatches)
      if (activeBatches.length > 0) {
        setSelectedBatch(activeBatches[0].id)
      }
    } catch (error) {
      console.error('Error fetching batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScan = async (qrData) => {
    // FIX: read the latest batch from the ref (camera callback would otherwise use a stale value)
    const batchId = selectedBatchRef.current
    if (!batchId) {
      alert('Please select a batch first')
      return
    }

    // FIX: ignore repeated scans while a request is already in flight
    if (processingRef.current) return
    processingRef.current = true

    setScanning(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/api/qr/scan', null, {
        params: {
          qrData: qrData,
          batchId: batchId
        },
        headers: { Authorization: `Bearer ${token}` }
      })
      setScannedResult({ success: true, data: response.data })
      stopCamera()
    } catch (error) {
      setScannedResult({ 
        success: false, 
        error: error.response?.data?.message || error.message || 'Scanning failed' 
      })
      stopCamera()
    } finally {
      processingRef.current = false
      setScanning(false)
    }
  }

  const startCamera = async () => {
    if (!selectedBatch) {
      alert('Please select a batch first')
      return
    }

    try {
      const element = document.getElementById("reader")
      if (!element) {
        throw new Error("Camera element not found")
      }
      
      console.log('Starting camera...')
      const html5QrCode = new Html5Qrcode("reader")
      html5QrCodeRef.current = html5QrCode
      
      // Try to get available cameras first
      try {
        const devices = await Html5Qrcode.getCameras()
        console.log('Available cameras:', devices)
      } catch (err) {
        console.log('Could not get camera list:', err)
      }
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } }
      console.log('Requesting camera access with environment facing mode...')
      
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            console.log('QR code scanned:', decodedText)
            handleScan(decodedText)
          },
          (errorMessage) => {
            console.log('Camera scan error:', errorMessage)
          }
        )
      } catch (envError) {
        console.log('Environment camera failed, trying user camera...', envError)
        // Try with user facing mode as fallback
        await html5QrCode.start(
          { facingMode: "user" },
          config,
          (decodedText) => {
            console.log('QR code scanned:', decodedText)
            handleScan(decodedText)
          },
          (errorMessage) => {
            console.log('Camera scan error:', errorMessage)
          }
        )
      }
      
      console.log('Camera started successfully')
      setCameraActive(true)
    } catch (error) {
      console.error('Error starting camera:', error)
      alert(`Failed to start camera: ${error.message || error}. \n\nTroubleshooting:\n1. Close all other apps using camera (Zoom, Teams, etc.)\n2. Check if camera works in other apps\n3. Try a different browser\n4. Restart your computer\n\nFor now, please use manual QR code entry below.`)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualQRInput.trim()) {
      alert('Please enter QR code data')
      return
    }
    handleScan(manualQRInput.trim())
    setManualQRInput('')
  }

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
      } catch (error) {
        console.error('Error stopping camera:', error)
      } finally {
        // FIX: always reset UI state, even if stop() throws
        setCameraActive(false)
      }
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2">QR Code Scanner</h1>
          <p className="text-gray-600">Scan QR codes to mark student attendance.</p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-white rounded-xl shadow-lg border border-primary-200 hover:bg-primary-50 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1">
          {sidebarOpen ? <X className="w-5 h-5 text-primary-600" /> : <Menu className="w-5 h-5 text-primary-600" />}
        </button>
      </div>

      {/* Batch Selection */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 mb-6">
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="relative p-8">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-6 flex items-center gap-3">
            <QrCode className="w-7 h-7 text-primary-600" />
            Select Batch for Attendance
          </h2>
          <select
            value={selectedBatch || ''}
            onChange={(e) => setSelectedBatch(e.target.value ? parseInt(e.target.value) : null)}
            className="input-field"
          >
            <option value="">Select Batch</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.batchCode} - {batch.subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-primary-100 mb-6">
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
        <div className="relative p-8">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-6 flex items-center gap-3">
            <QrCode className="w-7 h-7 text-primary-600" />
            Scan QR Code
          </h2>
          <div className="bg-primary-50/50 p-12 rounded-xl text-center border border-primary-200">
            <div id="reader" className={`w-full max-w-md mx-auto ${!cameraActive ? 'h-0 overflow-hidden' : ''}`}></div>
            {!cameraActive ? (
              <>
                <QrCode className="w-32 h-32 mx-auto text-primary-600 mb-4" />
                <p className="text-gray-700 mb-2 font-semibold">QR Scanner</p>
                <p className="text-sm text-gray-600 mb-4">Click below to start camera</p>
                <button
                  onClick={startCamera}
                  disabled={!selectedBatch}
                  className="btn-primary flex items-center gap-2 mx-auto mb-4"
                >
                  <Camera className="w-5 h-5" />
                  Start Camera
                </button>
                <p className="text-xs text-gray-600 mb-2">Or manually enter QR code data:</p>
                <form onSubmit={handleManualSubmit} className="flex gap-2 max-w-md mx-auto">
                  <input
                    type="text"
                    value={manualQRInput}
                    onChange={(e) => setManualQRInput(e.target.value)}
                    placeholder="e.g., STUDENT:STU001"
                    className="input-field flex-1"
                    disabled={!selectedBatch}
                  />
                  <button
                    type="submit"
                    disabled={!selectedBatch || !manualQRInput.trim() || scanning}
                    className="btn-primary"
                  >
                    Submit
                  </button>
                </form>
              </>
            ) : (
              <button
                onClick={stopCamera}
                className="btn-secondary flex items-center gap-2 mx-auto mt-4"
              >
                <CameraOff className="w-5 h-5" />
                Stop Camera
              </button>
            )}
            {scanning && (
              <p className="mt-4 flex items-center justify-center gap-2 text-sm text-primary-700 font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                Marking attendance...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Scan Result */}
      {scannedResult && (
        <div className={`relative overflow-hidden rounded-2xl bg-white shadow-xl border ${scannedResult.success ? 'border-green-200' : 'border-red-200'}`}>
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full blur-3xl" />
          <div className="relative p-8">
            <div className="flex items-center gap-3 mb-4">
              {scannedResult.success ? (
                <div className="p-2 bg-green-50 rounded-full">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="p-2 bg-red-50 rounded-full">
                  <XIcon className="w-6 h-6 text-red-600" />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-6">
              {scannedResult.success ? 'Attendance Marked Successfully' : 'Scanning Failed'}
            </h2>
            {scannedResult.success ? (
              <div className="space-y-2">
                <p className="text-gray-700"><strong>Student ID:</strong> {scannedResult.data.studentId}</p>
                <p className="text-gray-700"><strong>Batch ID:</strong> {scannedResult.data.batchId}</p>
                <p className="text-gray-700"><strong>Status:</strong> Present</p>
                <p className="text-gray-700"><strong>Check-in Time:</strong> {new Date(scannedResult.data.checkInTime).toLocaleString()}</p>
                <p className="text-gray-700"><strong>QR Scanned:</strong> Yes</p>
              </div>
            ) : (
              <p className="text-red-600">{scannedResult.error}</p>
            )}
            <button
              onClick={() => setScannedResult(null)}
              className="btn-secondary mt-4"
            >
              Scan Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default QRScanner
