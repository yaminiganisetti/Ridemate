import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Car, Home, History, Wallet, Star, Users, BarChart2,
  MessageSquare, MapPin, Shield, LogOut, Menu, X,
  Settings, DollarSign, Zap, ArrowLeft
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { logOut } from '../../services/authService'

const NAV = {
  user: [
    { to: '/dashboard', icon: Home,          label: 'Overview'      },
    { to: '/book',      icon: Car,           label: 'Book Ride'     },
    { to: '/dashboard', icon: History,       label: 'Ride History'  },
    { to: '/dashboard', icon: Wallet,        label: 'Payments'      },
    { to: '/dashboard', icon: MapPin,        label: 'Saved Places'  },
    { to: '/dashboard', icon: MessageSquare, label: 'Messages'      },
    { to: '/settings',  icon: Settings,      label: 'Settings'      },
  ],
  driver: [
    { to: '/driver',    icon: Home,          label: 'Overview'      },
    { to: '/driver',    icon: Zap,           label: 'Ride Requests' },
    { to: '/driver',    icon: History,       label: 'History'       },
    { to: '/driver',    icon: Wallet,        label: 'Earnings'      },
    { to: '/driver',    icon: Star,          label: 'Ratings'       },
    { to: '/driver',    icon: MessageSquare, label: 'Messages'      },
    { to: '/settings',  icon: Settings,      label: 'Settings'      },
  ],
  admin: [
    { to: '/admin',     icon: Home,          label: 'Dashboard'     },
    { to: '/admin',     icon: Shield,        label: 'Drivers'       },
    { to: '/admin',     icon: Users,         label: 'Users'         },
    { to: '/admin',     icon: Car,           label: 'All Rides'     },
    { to: '/admin',     icon: BarChart2,     label: 'Analytics'     },
    { to: '/admin',     icon: DollarSign,    label: 'Transactions'  },
    { to: '/settings',  icon: Settings,      label: 'Settings'      },
  ],
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white border border-white/20 hover:bg-white/10 active:bg-white/20 transition-colors"
    >
      <ArrowLeft size={14} className="shrink-0" />
      Back
    </button>
  )
}

function SidebarContent({ role, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const links = NAV[role] || NAV.user

  const isActive = (to) => {
    if (['/dashboard', '/driver', '/admin'].includes(to))
      return location.pathname === to
    return location.pathname.startsWith(to) && to !== '/'
  }

  const handleLogout = async () => {
    onClose?.()
    await logOut()
    navigate('/')
  }

  const handleBack = () => {
    onClose?.()
    navigate(-1)
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">

      {/* Back button — TOP */}
      <div className="px-3 pt-3 pb-2">
        <BackButton onClick={handleBack} />
      </div>

      {/* Profile pill */}
      <div className="px-4 py-3 border-t border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {profile?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {profile?.name || 'User'}
            </p>
            <p className="text-xs text-white/50 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-3 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => {
          const active = isActive(to)
          return (
            <Link
              key={label}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={15} className="shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom — sign out + Back button */}
      <div className="px-3 pb-3 pt-2 border-t border-white/10 space-y-1.5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors"
        >
          <LogOut size={15} className="shrink-0" />
          <span>Sign out</span>
        </button>

        {/* Back button — BOTTOM */}
        <BackButton onClick={handleBack} />
      </div>
    </div>
  )
}

export default function DashboardSidebar({ role }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-slate-900 border-b border-white/10 h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <Car size={13} className="text-white" />
          </div>
          <span className="font-semibold text-white text-sm">RideMate</span>
        </Link>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-slate-900 flex-col shrink-0 sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Car size={13} className="text-white" />
            </div>
            <span className="font-semibold text-white text-sm">RideMate</span>
          </Link>
        </div>
        <SidebarContent role={role} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 flex flex-col shadow-xl animate-slide-down">
            <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Car size={13} className="text-white" />
                </div>
                <span className="font-semibold text-white text-sm">RideMate</span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <SidebarContent role={role} onClose={() => setOpen(false)} />
          </aside>
        </>
      )}
    </>
  )
}
