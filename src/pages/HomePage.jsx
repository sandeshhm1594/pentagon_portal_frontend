import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, BookOpen, Calendar, Shield, TrendingUp, GraduationCap, CheckCircle, Zap, Lock, BarChart3, X, Mail, Phone, Building, User as UserIcon, Loader2, Briefcase } from 'lucide-react'
import pentagonLogo from '../pentagon-log.png'
import trainingImage from '../training.png'
import javaImg from '../images/Java.png'
import pythonImg from '../images/Python.png'
import devopsImg from '../images/Devops.png'
import dataImg from '../images/Data Analytics.jpg'
import mernImg from '../images/MERN-Stack-Development-Company.webp'
import axios from 'axios'
import { apiFile } from '../api'

const programs = [
  { name: 'Java Development', img: javaImg, tilt: '-6deg', delay: '0s' },
  { name: 'Python', img: pythonImg, tilt: '5deg', delay: '0.8s' },
  { name: 'DevOps', img: devopsImg, tilt: '-4deg', delay: '1.6s' },
  { name: 'Data Analytics', img: dataImg, tilt: '6deg', delay: '0.4s' },
  { name: 'MERN Stack', img: mernImg, tilt: '-5deg', delay: '1.2s' }
]

const HomePage = () => {
  const [showEnquiryModal, setShowEnquiryModal] = useState(false)
  const [enquiryData, setEnquiryData] = useState({
    name: '',
    email: '',
    phone: '',
    collegeName: '',
    degree: '',
    stream: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [todaysRequirements, setTodaysRequirements] = useState([])
  const [courses, setCourses] = useState([])
  const [ringDrag, setRingDrag] = useState(0)
  const [ringHover, setRingHover] = useState({ x: 0, y: 0 })
  const ringDragRef = useRef({ active: false, startX: 0, startRot: 0 })

  const handleRingPointerDown = (e) => {
    ringDragRef.current = { active: true, startX: e.clientX, startRot: ringDrag }
  }

  const handleRingPointerMove = (e) => {
    if (ringDragRef.current.active) {
      setRingDrag(ringDragRef.current.startRot + (e.clientX - ringDragRef.current.startX) * 0.45)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = Math.max(-1, Math.min(1, (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)))
    const ny = Math.max(-1, Math.min(1, (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)))
    setRingHover({ x: -ny * 14, y: nx * 45 })
  }

  const handleRingPointerUp = () => {
    ringDragRef.current.active = false
    setRingHover({ x: 0, y: 0 })
  }

  useEffect(() => {
    axios.get('/api/public/todays-requirements')
      .then((response) => setTodaysRequirements(response.data || []))
      .catch(() => setTodaysRequirements([]))
    axios.get('/api/public/courses')
      .then((response) => setCourses(response.data || []))
      .catch(() => setCourses([]))
  }, [])

  const displayPrograms = courses.length > 0
    ? courses.map((course, index) => ({
        name: course.courseName,
        img: apiFile(course.imageUrl) || programs[index % programs.length].img
      }))
    : programs

  // Ring radius grows with course count so cards keep even spacing
  const ringRadius = Math.min(700, Math.max(150, Math.ceil(132 / Math.sin(Math.PI / displayPrograms.length))))

  const handleEnquirySubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/auth/enquiry', enquiryData)
      console.log('Enquiry submitted:', response.data)
      setSubmitted(true)
      setTimeout(() => {
        setShowEnquiryModal(false)
        setSubmitted(false)
        setEnquiryData({ name: '', email: '', phone: '', collegeName: '', degree: '', stream: '', message: '' })
      }, 2000)
    } catch (err) {
      console.error('Error submitting enquiry:', err)
      setError(err.response?.data?.message || 'Failed to submit enquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ps-page min-h-screen bg-white">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${trainingImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-white/90" />
      </div>
      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div className="ps-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-md p-4">
          <div className="ps-pop bg-white/95 rounded-3xl shadow-[0_40px_90px_-30px_rgba(53,6,62,0.55)] ring-1 ring-white/60 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <div className="p-6 border-b border-primary-200 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10 rounded-t-3xl">
              <h3 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Request a Demo</h3>
              <button
                onClick={() => setShowEnquiryModal(false)}
                className="text-body-text hover:text-primary-600 transition-all duration-300 p-1.5 hover:bg-primary-100 hover:rotate-90 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-primary-500/5 animate-bounce">
                    <CheckCircle className="w-9 h-9 text-primary-600" />
                  </div>
                  <h4 className="text-lg font-bold text-heading mb-2">Thank You!</h4>
                  <p className="text-body-text/70">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-100 border border-red-200 border-l-4 border-l-red-500 rounded-xl px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-600" />
                      <input
                        type="text"
                        required
                        value={enquiryData.name}
                        onChange={(e) => setEnquiryData({ ...enquiryData, name: e.target.value })}
                        className="ps-input w-full pl-10 pr-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all duration-300"
                        placeholder="Enter your name"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-600" />
                      <input
                        type="email"
                        required
                        value={enquiryData.email}
                        onChange={(e) => setEnquiryData({ ...enquiryData, email: e.target.value })}
                        className="ps-input w-full pl-10 pr-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all duration-300"
                        placeholder="Enter your email"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-600" />
                      <input
                        type="tel"
                        required
                        value={enquiryData.phone}
                        onChange={(e) => setEnquiryData({ ...enquiryData, phone: e.target.value })}
                        className="ps-input w-full pl-10 pr-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all duration-300"
                        placeholder="Enter your phone number"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">College Name</label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-600" />
                      <input
                        type="text"
                        required
                        value={enquiryData.collegeName}
                        onChange={(e) => setEnquiryData({ ...enquiryData, collegeName: e.target.value })}
                        className="ps-input w-full pl-10 pr-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all duration-300"
                        placeholder="Enter your college name"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">Degree</label>
                    <select
                      required
                      value={enquiryData.degree}
                      onChange={(e) => setEnquiryData({ ...enquiryData, degree: e.target.value })}
                      className="ps-input w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all duration-300 bg-white"
                      disabled={loading}
                    >
                      <option value="">Select Degree</option>
                      <option value="Bachelors">Bachelors</option>
                      <option value="Masters">Masters</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">Stream</label>
                    <input
                      type="text"
                      required
                      value={enquiryData.stream}
                      onChange={(e) => setEnquiryData({ ...enquiryData, stream: e.target.value })}
                      className="ps-input w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all duration-300"
                      placeholder="e.g., Computer Science, Engineering"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-heading mb-1.5">Message (Optional)</label>
                    <textarea
                      value={enquiryData.message}
                      onChange={(e) => setEnquiryData({ ...enquiryData, message: e.target.value })}
                      className="ps-input w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all duration-300 resize-none"
                      rows="3"
                      placeholder="Tell us about your requirements"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="ps-btn w-full bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? 'Submitting...' : 'Submit Enquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="ps-nav sticky top-0 z-50 border-b border-primary-200/60 bg-white/70 backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(53,6,62,0.35)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src={pentagonLogo}
                  alt="Pentagon Space Logo"
                  className="w-14 h-14 object-contain transition-all duration-700 group-hover:rotate-[360deg] group-hover:scale-110 drop-shadow-md"
                />
                <span className="absolute -inset-1.5 rounded-full bg-primary-400/25 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 font-extrabold text-xl tracking-wide">PENTAGON SPACE</h1>
                <p className="text-gray-500 text-[11px] font-bold tracking-[0.22em] uppercase">Mastering The Future</p>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="ps-nav-link text-gray-600 hover:text-primary-600 transition-colors text-sm font-semibold">Features</a>
              <a href="#cta" className="ps-nav-link text-gray-600 hover:text-primary-600 transition-colors text-sm font-semibold">Contact</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="ps-nav-link text-gray-700 hover:text-primary-600 transition-colors font-semibold">
                Login
              </Link>
              <button
                onClick={() => setShowEnquiryModal(true)}
                className="ps-btn bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 active:scale-95"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left Content */}
          <div className="text-gray-900">
            <div className="ps-rise ps-badge inline-flex items-center gap-2 bg-primary-100/80 backdrop-blur border border-primary-300/50 text-primary-700 px-4 py-2 rounded-full text-xs font-bold mb-5 shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Modern Training Management</span>
            </div>
            <h1 className="ps-rise ps-rise-2 text-4xl lg:text-6xl font-extrabold mb-5 leading-[1.08] tracking-tight">
              Training Institute
              <span className="ps-gradient-text text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-400 to-primary-600"> Management</span>
              System
            </h1>
            <p className="ps-rise ps-rise-3 text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
              Streamline your training institute operations with our comprehensive management system featuring QR code attendance, real-time analytics, and role-based access control.
            </p>
            <div className="ps-rise ps-rise-3 flex flex-wrap gap-4 mb-10">
              <button 
                onClick={() => setShowEnquiryModal(true)}
                className="ps-btn group bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white px-8 py-4 rounded-full font-bold text-base transition-all duration-300 shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
              <Link 
                to="/login" 
                className="group bg-primary-50/80 backdrop-blur hover:bg-primary-100 text-primary-700 px-8 py-4 rounded-full font-bold text-base transition-all duration-300 border-2 border-primary-200 hover:border-primary-300 flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
                Learn More
              </Link>
            </div>
            
            {/* Stats */}
            <div className="ps-rise ps-rise-4 flex flex-wrap gap-4">
              <div className="ps-stat">
                <p className="text-3xl font-extrabold text-primary-600">500+</p>
                <p className="text-gray-600 text-xs font-medium">Students</p>
              </div>
              <div className="ps-stat">
                <p className="text-3xl font-extrabold text-gray-900">50+</p>
                <p className="text-gray-600 text-xs font-medium">Trainers</p>
              </div>
              <div className="ps-stat">
                <p className="text-3xl font-extrabold text-primary-600">99%</p>
                <p className="text-gray-600 text-xs font-medium">Uptime</p>
              </div>
            </div>
          </div>

          {/* Right Content - Logo */}
          <div className="ps-rise ps-rise-3 flex justify-center items-center relative">
            <div className="ps-orbit absolute inset-0 rounded-full" />
            <div className="ps-logo-card relative bg-primary-50/80 backdrop-blur-xl rounded-[2.5rem] p-10 border border-primary-200">
              <div className="ps-pentagon absolute -top-5 -right-5 w-20 h-20 bg-gradient-to-br from-primary-500 to-white flex items-center justify-center shadow-lg">
                <GraduationCap className="w-9 h-9 text-primary-600" />
              </div>
              <img 
                src={pentagonLogo} 
                alt="Pentagon Space Logo" 
                className="w-60 h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Programs Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">Our Popular Programs</h2>
          <div className="mx-auto mb-5 h-1.5 w-20 rounded-full bg-gradient-to-r from-primary-500 to-primary-400" />
          <p className="text-gray-600 max-w-2xl mx-auto">Industry-relevant courses designed to make you job-ready</p>
        </div>
        <div
          className="ps-ring-scene"
          style={{ '--ring-radius': `${ringRadius}px` }}
          onPointerDown={handleRingPointerDown}
          onPointerMove={handleRingPointerMove}
          onPointerUp={handleRingPointerUp}
          onPointerLeave={handleRingPointerUp}
        >
          <div
            className="ps-ring-tilt"
            style={{
              transform: `rotateX(${8 + ringHover.x}deg) rotateY(${ringDrag + ringHover.y}deg)`,
              transition: ringDragRef.current.active ? 'none' : 'transform 0.15s ease-out',
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="ps-ring">
              {displayPrograms.map((program, index) => (
                <div
                  key={program.name}
                  className="ps-ring-item"
                  style={{ transform: `rotateY(${index * (360 / displayPrograms.length)}deg) translateZ(var(--ring-radius))` }}
                >
                  <div className="ps-ring-card">
                    <img src={program.img} alt={program.name} />
                    <p className="ps-ring-label">{program.name}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="ps-ring-center">
              <img src={pentagonLogo} alt="Pentagon Space" />
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6 tracking-wide">Drag to spin • auto-rotates on its own</p>
        </div>
      </div>

      {/* Today's Requirements Marquee */}
      {todaysRequirements.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Today's Requirements</h2>
              <p className="text-xs text-gray-500">New job requirements posted today</p>
            </div>
            <span className="ml-auto ps-badge inline-flex items-center gap-1.5 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              <Zap className="w-3 h-3 fill-current" />
              Live
            </span>
          </div>
          <div className="ps-marquee overflow-hidden rounded-3xl border border-primary-200 bg-white/70 backdrop-blur-md shadow-[0_20px_50px_-25px_rgba(53,6,62,0.35)] py-4">
            <div className="ps-marquee-track flex gap-4 w-max px-4">
              {[...todaysRequirements, ...todaysRequirements].map((req, index) => (
                <div key={`${req.requirementId}-${index}`} className="ps-req-card shrink-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-primary-300 bg-gradient-to-br from-white via-primary-50 to-primary-100 px-4 py-4 text-center shadow-sm">
                  <span className="ps-req-id">{req.requirementId || 'REQ'}</span>
                  <span className="text-sm font-extrabold text-gray-900 whitespace-nowrap">{req.jobTitle}</span>
                  <span className="text-xs font-semibold text-primary-600 whitespace-nowrap">{req.jobRole || 'Openings'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Everything You Need
          </h2>
          <div className="mx-auto mb-5 h-1.5 w-20 rounded-full bg-gradient-to-r from-primary-500 to-primary-400" />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make training institute management effortless
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Role-Based Access"
            description="Secure login system with dedicated portals for Admins, Trainers, and Students"
            color="purple"
          />
          <FeatureCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Batch Management"
            description="Create and manage batches with trainer assignments and smart scheduling"
            color="purple"
          />
          <FeatureCard
            icon={<Calendar className="w-6 h-6" />}
            title="QR Attendance"
            description="Quick and accurate attendance tracking using QR code scanning technology"
            color="purple"
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Secure System"
            description="JWT-based authentication with encrypted passwords and data protection"
            color="purple"
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Real-time Analytics"
            description="Dashboard with live statistics, attendance reports, and performance metrics"
            color="purple"
          />
          <FeatureCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Student Management"
            description="Complete student profiles with batch assignments and progress tracking"
            color="purple"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div id="cta" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
        <div className="ps-cta bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 rounded-[2.5rem] p-10 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/25 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/25 rounded-full blur-3xl animate-pulse" />
          <div className="relative">
            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-white mb-5">
              Ready for Takeoff?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Your institute's next chapter starts here — Pentagon Space is cleared for landing.
            </p>
            <button 
              onClick={() => setShowEnquiryModal(true)}
              className="ps-btn group inline-flex items-center gap-2 bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-full font-bold text-base transition-all duration-300 shadow-2xl hover:shadow-[0_20px_50px_-10px_rgba(255,255,255,0.6)] hover:-translate-y-1 hover:scale-105 active:scale-100"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="ps-footer border-t border-primary-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="ps-pentagon w-11 h-11 bg-gradient-to-br from-primary-500 to-white flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <span className="text-gold-600 font-extrabold tracking-wide">PENTAGON SPACE</span>
                <p className="text-gray-600 text-xs">Mastering The Future</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Pentagon Space. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/login" className="ps-nav-link text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">Privacy</Link>
              <Link to="/login" className="ps-nav-link text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">Terms</Link>
              <Link to="/login" className="ps-nav-link text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const FeatureCard = ({ icon, title, description, color }) => {
  const colorClasses = {
    purple: 'bg-primary-500/10 text-primary-600',
    pink: 'bg-pink-500/10 text-pink-600',
    indigo: 'bg-indigo-500/10 text-indigo-600',
    violet: 'bg-violet-500/10 text-violet-600',
    fuchsia: 'bg-fuchsia-500/10 text-fuchsia-600',
  }

  return (
    <div className="ps-feature group rounded-3xl p-7 border border-primary-200 hover:border-primary-400 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 hover:-translate-y-2 bg-white/50 backdrop-blur-sm">
      <div className={`ps-icon w-14 h-14 ${colorClasses[color]} rounded-2xl flex items-center justify-center mb-5`}>
        {icon}
      </div>
      <h3 className="text-lg font-extrabold text-gray-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

export default HomePage
