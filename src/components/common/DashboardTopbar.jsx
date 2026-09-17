import { Bell, Search, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'

export default function DashboardTopbar({ role }) {
  const { profile } = useAuth()
  const { unreadCount } = useNotifications() || { unreadCount: 0 }

  const roleLabels = { user: 'Rider', driver: 'Driver', admin: 'Administrator' }

  return (
    <header className="bg-white border-b border-ink-100 px-4 md:px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="font-display font-semibold text-ink-900 text-base">
          Good day, {profile?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-xs text-ink-400">{roleLabels[role] || 'User'} Dashboard</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-xl hover:bg-ink-50 transition-colors">
          <Bell size={18} className="text-ink-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center">
          <span className="text-brand-600 text-sm font-bold">
            {profile?.name?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
      </div>
    </header>
  )
}
