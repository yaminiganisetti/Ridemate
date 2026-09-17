import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import LoadingScreen from './components/common/LoadingScreen'

// Pages
import HomePage from './pages/home/HomePage'
import BookingPage from './pages/booking/BookingPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import DriverRegisterPage from './pages/driver/DriverRegisterPage'
import DriverPendingPage from './pages/driver/DriverPendingPage'

// Dashboard pages
import UserDashboard from './dashboard/user/UserDashboard'
import DriverDashboard from './dashboard/driver/DriverDashboard'
import AdminDashboard from './dashboard/admin/AdminDashboard'

// Protected route
const Protected = ({ children, roles }) => {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(profile?.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { loading } = useAuth()
  if (loading) return <LoadingScreen />

  return (
    <Routes>
      {/* Public */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/become-driver" element={<DriverRegisterPage />} />
        <Route path="/driver-pending" element={<DriverPendingPage />} />
      </Route>

      {/* User */}
      <Route path="/book" element={
        <Protected><BookingPage /></Protected>
      } />

      {/* User Dashboard */}
      <Route path="/dashboard" element={
        <Protected roles={['user', 'admin']}><DashboardLayout /></Protected>
      }>
        <Route index element={<UserDashboard />} />
      </Route>

      {/* Driver Dashboard */}
      <Route path="/driver" element={
        <Protected roles={['driver', 'admin']}><DashboardLayout type="driver" /></Protected>
      }>
        <Route index element={<DriverDashboard />} />
      </Route>

      {/* Admin Dashboard */}
      <Route path="/admin" element={
        <Protected roles={['admin']}><DashboardLayout type="admin" /></Protected>
      }>
        <Route index element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
