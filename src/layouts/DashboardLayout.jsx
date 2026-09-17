import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashboardSidebar from '../components/common/DashboardSidebar'
import DashboardTopbar from '../components/common/DashboardTopbar'

export default function DashboardLayout({ type }) {
  const { profile } = useAuth()
  const role = type || profile?.role || 'user'
  return (
    <div className="min-h-screen bg-ink-50 flex">
      <DashboardSidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar role={role} />
        <main className="flex-1 p-4 md:p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  )
}
