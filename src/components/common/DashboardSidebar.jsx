import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Car, Home, History, Wallet, Star, Users, BarChart2,
  MessageSquare, MapPin, Shield, LogOut, Menu, X,
  Settings, DollarSign, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { logOut } from '../../services/authService'
import { useToast } from '../../context/ToastContext'

const NAV = {
  user: [
    { to: '/dashboard',          icon: Home,          label: 'Overview'      },
    { to: '/book',               icon: Car,           label: 'Book Ride'     },
    { to: '/dashboard/history',  icon: History,       label: 'Ride History'  },
    { to: '/dashboard/payments', icon: Wallet,        label: 'Payments'      },
    { to: '/dashboard/places',   icon: MapPin,        label: 'Saved Places'  },
    { to: '/dashboard/messages', icon: MessageSquare, label: 'Messages'      },
    { to: '/dashboard/settings', icon: Settings,      label: 'Settings'      },
  ],
  driver: [
    { to: '/driver',             icon: Home,          label: 'Overview'      },
    { to: '/driver/rides',       icon: Car,           label: 'Ride Requests' },
    { to: '/driver/history',     icon: History,       label: 'History'       },
    { to: '/driver/earnings',    icon: Wallet,        label: 'Earnings'      },
    { to: '/driver/ratings',     icon: Star,          label: 'Ratings'       },
    { to: '/driver/messages',    icon: MessageSquare, label: 'Messages'      },
    { to: '/driver/settings',    icon: Settings,      label: 'Settings'      },
  ],
  admin: [
    { to: '/admin',              icon: Home,          label: 'Dashboard'     },
    { to: '/admin/drivers',      icon: Shield,        label: 'Drivers'       },
    { to: '/admin/users',        icon: Users,         label: 'Users'         },
    { to: '/admin/rides',        icon: Car,           label: 'All Rides'     },
    { to: '/admin/analytics',    icon: BarChart2,     label: 'Analytics'     },
    { to: '/admin/transactions', icon: DollarSign,    label: 'Transactions'  },
    { to: '/admin/settings',     icon: Settings,      label: 'Settings'      },
  ],
}

function NavLinks({ role, onClose }) {
  const location = useLocation()
  const navigate  = useNavigate()
  const { toast } = useToast()
  const { profile } = useAuth()
  const links = NAV[role] || NAV.user

  const isActive = (to) => {
    const index = ['/dashboard', '/driver', '/admin']
    return index.includes(to) ? location.pathname === to : location.pathname.startsWith(to + '/') || location.pathname === to
  }

  const handleLogout = async () => {
    onClose?.()
    await logOut()
    toast('Signed out successfully', 'info')
    navigate('/')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Profile pill */}
      <div className="mx-3 mb-3 p-3 bg-ink-50 rounded-2xl flex items-center gap-2.5">
        <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0">
          {profile?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-ink-800 truncate">{profile?.name || 'User'}</p>
          <p className="text-[10px] text-ink-400 capitalize font-medium">{role}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {links.map(({ to, icon: Icon, label }) => {
          const active = isActive(to)
          return (
            <Link key={to} to={to} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                active
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
              }`}>
              <Icon size={16} className={active ? 'text-white' : 'text-ink-400 group-hover:text-ink-600'} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={12} className="text-white/70" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-ink-100 mt-2">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  )
}

export default function DashboardSidebar({ role }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const Logo = ({ onClick }) => (
    <Link to="/" onClick={onClick} className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-sm">
        <Car size={15} className="text-white" />
      </div>
      <span className="font-display font-bold text-ink-900">Ride<span className="text-brand-500">Mate</span></span>
    </Link>
  )

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 glass border-b border-ink-100/60 px-4 h-14 flex items-center gap-3">
        <button onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl hover:bg-ink-100 transition-colors">
          <Menu size={20} className="text-ink-700" />
        </button>
        <Logo />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-white border-r border-ink-100 flex-col shrink-0">
        <div className="p-5 pb-4 border-b border-ink-100">
          <Logo />
        </div>
        <div className="flex-1 py-4 overflow-hidden flex flex-col">
          <NavLinks role={role} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 flex flex-col shadow-2xl">
            <div className="p-5 pb-4 border-b border-ink-100 flex items-center justify-between">
              <Logo onClick={() => setMobileOpen(false)} />
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-xl hover:bg-ink-100 transition-colors">
                <X size={17} className="text-ink-400" />
              </button>
            </div>
            <div className="flex-1 py-4 overflow-hidden flex flex-col">
              <NavLinks role={role} onClose={() => setMobileOpen(false)} />
            </div>
          </aside>
        </>
      )}
    </>
  )
}
