import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Student
import LoginPage from './pages/LoginPage'
import DashboardLayout from './pages/DashboardLayout'
import AllComplaintsPage from './pages/AllComplaintsPage'
import MyComplaintsPage from './pages/MyComplaintsPage'
import SubmitComplaintPage from './pages/SubmitComplaintPage'

// Staff
import StaffLayout from './pages/StaffLayout'
import OpenComplaintsPage from './pages/staff/OpenComplaintsPage'
import AcceptedComplaintsPage from './pages/staff/AcceptedComplaintsPage'
import ResolvedComplaintsPage from './pages/staff/ResolvedComplaintsPage'
import RemindersPage from './pages/staff/RemindersPage'
import EscalatedComplaintsPage from './pages/staff/EscalatedComplaintsPage'

// Coordinator
import CoordinatorLayout from './pages/CoordinatorLayout'
import CoordinatorComplaintsPage from './pages/coordinator/CoordinatorComplaintsPage'
import CoordinatorRemindersPage from './pages/coordinator/CoordinatorRemindersPage'
import CoordinatorEscalatedPage from './pages/coordinator/CoordinatorEscalatedPage'

// HOD
import HodLayout from './pages/HodLayout'
import HodComplaintsPage from './pages/hod/HodComplaintsPage'

// Managers (Hostel Manager, Librarian, Transport Manager)
import ManagerLayout from './pages/ManagerLayout'
import HostelManagerLayout from './pages/HostelManagerLayout'
import LibrarianLayout from './pages/LibrarianLayout'
import TransportManagerLayout from './pages/TransportManagerLayout'
import ManagerComplaintsPage from './pages/manager/ManagerComplaintsPage'
import ManagerEscalatedPage from './pages/manager/ManagerEscalatedPage'
import HostelManagerComplaints from './pages/manager/HostelManagerComplaints'
import TransportManagerComplaintsPage from './pages/manager/TransportManagerComplaintsPage';
import LibrarianComplaintsPage from './pages/manager/LibrarianComplaintsPage'
// Admin
import AdminLayout from './pages/AdminLayout'
import OverviewPage from './pages/admin/OverviewPage'
import TrendsPage from './pages/admin/TrendsPage'
import DepartmentsPage from './pages/admin/DepartmentsPage'
import EscalationsPage from './pages/admin/EscalationsPage'
import UsersPage from './pages/admin/UsersPage'
import ActivityPage from './pages/admin/ActivityPage'

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role_id)) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Student - role 1 */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={[1]}><DashboardLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="all" replace />} />
            <Route path="all" element={<AllComplaintsPage />} />
            <Route path="my" element={<MyComplaintsPage />} />
            <Route path="submit" element={<SubmitComplaintPage />} />
          </Route>

          {/* Staff - roles 2, 5, 6, 8 */}
          <Route path="/staff/dashboard" element={
            <ProtectedRoute allowedRoles={[2, 5, 8]}><StaffLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="open" replace />} />
            <Route path="open" element={<OpenComplaintsPage />} />
            <Route path="accepted" element={<AcceptedComplaintsPage />} />
            <Route path="resolved" element={<ResolvedComplaintsPage />} />
            <Route path="reminders" element={<RemindersPage />} />
            <Route path="escalated" element={<EscalatedComplaintsPage />} />
          </Route>

          {/* Coordinator - role 3 */}
          <Route path="/coordinator/dashboard" element={
            <ProtectedRoute allowedRoles={[3]}><CoordinatorLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="complaints" replace />} />
            <Route path="complaints" element={<CoordinatorComplaintsPage />} />
            <Route path="reminders" element={<CoordinatorRemindersPage />} />
            <Route path="escalated" element={<CoordinatorEscalatedPage />} />
          </Route>

          {/* HOD - role 4 */}
          <Route path="/hod/dashboard" element={
            <ProtectedRoute allowedRoles={[4]}><HodLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="complaints" replace />} />
            <Route path="complaints" element={<HodComplaintsPage />} />
            <Route path="escalated" element={<HodComplaintsPage escalatedOnly={true} />} />
          </Route>

          {/* Hostel Manager - role 6 */}
          <Route path="/hostel-manager/dashboard" element={
            <ProtectedRoute allowedRoles={[6]}><HostelManagerLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="complaints" replace />} />
            <Route path="complaints" element={<HostelManagerComplaints />} />
            <Route path="resolved" element={<HostelManagerComplaints />} />
            <Route path="escalated" element={<HostelManagerComplaints />} />
          </Route>

          {/* Librarian - role 9 */}
          <Route path="/librarian/dashboard" element={
            <ProtectedRoute allowedRoles={[9]}><LibrarianLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="complaints" replace />} />
            <Route path="complaints" element={<LibrarianComplaintsPage />} />
            <Route path="resolved"   element={<LibrarianComplaintsPage resolvedOnly />} />
            <Route path="escalated"  element={<ManagerEscalatedPage />} />
          </Route>

          {/* Transport Manager - role 10 */}
          <Route path="/transport-manager/dashboard" element={
            <ProtectedRoute allowedRoles={[10]}><TransportManagerLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="complaints" replace />} />
            <Route path="complaints" element={<TransportManagerComplaintsPage />} />
            <Route path="resolved"   element={<TransportManagerComplaintsPage resolvedOnly />} />
            <Route path="escalated"  element={<ManagerEscalatedPage />} />
          </Route>

          {/* Admin - role 7 */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={[7]}><AdminLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview"    element={<OverviewPage />} />
            <Route path="trends"      element={<TrendsPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="escalations" element={<EscalationsPage />} />
            <Route path="users"       element={<UsersPage />} />
            <Route path="activity"    element={<ActivityPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}