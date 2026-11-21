import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/Dashboard'
import TrainerDashboard from './pages/trainer/Dashboard'
import StudentDashboard from './pages/student/Dashboard'
import TrainerManagement from './pages/admin/TrainerManagement'
import BatchManagement from './pages/admin/BatchManagement'
import StudentManagement from './pages/admin/StudentManagement'
import AccountRequests from './pages/admin/AccountRequests'
import AttendanceManagement from './pages/admin/AttendanceManagement'
import QRScanner from './pages/admin/QRScanner'
import SubjectManagement from './pages/admin/SubjectManagement'
import CourseManagement from './pages/admin/CourseManagement'
import CourseEnrollmentManagement from './pages/admin/CourseEnrollmentManagement'
import BatchEnrollmentManagement from './pages/admin/BatchEnrollmentManagement'
import EnquiryManagement from './pages/admin/EnquiryManagement'
import PlacementDashboard from './pages/admin/PlacementDashboard'
import CompanyManagement from './pages/admin/CompanyManagement'
import JobRequirementManagement from './pages/admin/JobRequirementManagement'
import PlacementDriveManagement from './pages/admin/PlacementDriveManagement'
import PlacementTeamManagement from './pages/admin/PlacementTeamManagement'
import MockRatings from './pages/trainer/MockRatings'
import StudentMockRatings from './pages/student/MockRatings'
import NotesDashboard from './pages/trainer/NotesDashboard'
import UploadNotes from './pages/trainer/UploadNotes'
import EditNotes from './pages/trainer/EditNotes'
import MyUploadedNotes from './pages/trainer/MyUploadedNotes'
import NotesRequests from './pages/trainer/NotesRequests'
import AvailableNotes from './pages/student/AvailableNotes'
import MyNotesRequests from './pages/student/MyNotesRequests'
import ApprovedNotes from './pages/student/ApprovedNotes'
import NotesReader from './pages/student/NotesReader'
import AdminNotesManagement from './pages/admin/NotesManagement'
import PlacementProfile from './pages/student/PlacementProfile'
import PlacementDrives from './pages/student/PlacementDrives'
import PlacementLayout from './components/PlacementLayout'
import StudentLayout from './components/StudentLayout'
import PlacementApplications from './pages/placement/Applications'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="enquiries" element={<EnquiryManagement />} />
            <Route path="trainers" element={<TrainerManagement />} />
            <Route path="batches" element={<BatchManagement />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="account-requests" element={<AccountRequests />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="qr-scanner" element={<QRScanner />} />
            <Route path="subjects" element={<SubjectManagement />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="course-enrollments" element={<CourseEnrollmentManagement />} />
            <Route path="batch-enrollments" element={<BatchEnrollmentManagement />} />
            <Route path="notes" element={<AdminNotesManagement />} />
            <Route path="placement-dashboard" element={<PlacementDashboard />} />
            <Route path="companies" element={<CompanyManagement />} />
            <Route path="job-requirements" element={<JobRequirementManagement />} />
            <Route path="placement-drives" element={<PlacementDriveManagement />} />
            <Route path="placement-team" element={<PlacementTeamManagement />} />
          </Route>
          
          {/* Placement Team Routes */}
          <Route path="/placement" element={
            <ProtectedRoute>
              <PlacementLayout />
            </ProtectedRoute>
          }>
            <Route index element={<PlacementDashboard />} />
            <Route path="companies" element={<CompanyManagement />} />
            <Route path="job-requirements" element={<JobRequirementManagement />} />
            <Route path="placement-drives" element={<PlacementDriveManagement />} />
            <Route path="applications" element={<PlacementApplications />} />
            <Route path="team" element={<PlacementTeamManagement />} />
          </Route>
          
          {/* Trainer Routes */}
          <Route path="/trainer" element={
            <ProtectedRoute role="TRAINER">
              <TrainerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/trainer/mock-ratings" element={
            <ProtectedRoute role="TRAINER">
              <MockRatings />
            </ProtectedRoute>
          } />
          <Route path="/trainer/notes" element={
            <ProtectedRoute role="TRAINER">
              <NotesDashboard />
            </ProtectedRoute>
          } />
          <Route path="/trainer/notes/upload" element={
            <ProtectedRoute role="TRAINER">
              <UploadNotes />
            </ProtectedRoute>
          } />
          <Route path="/trainer/notes/edit/:notesId" element={
            <ProtectedRoute role="TRAINER">
              <EditNotes />
            </ProtectedRoute>
          } />
          <Route path="/trainer/notes/my-notes" element={
            <ProtectedRoute role="TRAINER">
              <MyUploadedNotes />
            </ProtectedRoute>
          } />
          <Route path="/trainer/notes/requests" element={
            <ProtectedRoute role="TRAINER">
              <NotesRequests />
            </ProtectedRoute>
          } />
          
          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute role="STUDENT">
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="mock-ratings" element={<StudentMockRatings />} />
            <Route path="placement-profile" element={<PlacementProfile />} />
            <Route path="placement-drives" element={<PlacementDrives />} />
            <Route path="notes/available" element={<AvailableNotes />} />
            <Route path="notes/my-requests" element={<MyNotesRequests />} />
            <Route path="notes/approved" element={<ApprovedNotes />} />
          </Route>
          <Route path="/student/notes/read/:notesId" element={
            <ProtectedRoute role="STUDENT">
              <NotesReader />
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
