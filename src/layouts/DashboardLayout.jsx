import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashboardSidebar from '../components/common/DashboardSidebar'
import DashboardTopbar from '../components/common/DashboardTopbar'

export default function DashboardLayout({ type }) {
  const { profile } = useAuth()
  const role = type || profile?.role || 'user'
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <DashboardSidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop topbar only — mobile topbar is inside DashboardSidebar */}
        <div className="hidden md:block">
          <DashboardTopbar role={role} />
        </div>
        {/* Mobile: push content below fixed topbar */}
        <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
