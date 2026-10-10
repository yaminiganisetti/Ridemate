import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Car, Menu, X, Bell, ChevronDown, LogOut, Settings, LayoutDashboard, History, CreditCard } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { logOut } from '../../services/authService'
import { useNotifications } from '../../context/NotificationContext'

export default function Navbar() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { unreadCount = 0 } = useNotifications()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropOpen, setDropOpen]     = useState(false)
  const [scrolled, setScrolled]     = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false); setDropOpen(false) }, [location.pathname])

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => { await logOut(); navigate('/') }

  const dashLink = profile?.role === 'driver' ? '/driver' : profile?.role === 'admin' ? '/admin' : '/dashboard'

  const NAV = [
    { to: '/', label: 'Home' },
    { to: '/book', label: 'Book a Ride' },
    { to: '/become-driver', label: 'Drive with us' },
  ]

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
      scrolled ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm' : 'bg-white/80 backdrop-blur-sm'
    } dark:bg-slate-900/95 dark:border-slate-800`}>
      <div className="container-wide h-14 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Car size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-slate-900 text-base tracking-tight dark:text-white">
            RideMate
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV.map(({ to, label }) => (
            <Link key={to} to={to}
              className={`nav-link ${isActive(to) ? 'nav-link-active' : ''}`}>
              {label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          {user ? (
            <>
              <button onClick={() => navigate(dashLink)} aria-label="Notifications"
                className="btn-icon relative text-slate-500 hover:text-slate-700 dark:text-slate-400">
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={dropRef}>
                <button onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors dark:hover:bg-slate-800"
                  aria-expanded={dropOpen} aria-haspopup="true">
                  <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                    {profile?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[90px] truncate dark:text-slate-200">
                    {profile?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-dropdown border border-slate-200 py-1.5 animate-slide-down dark:bg-slate-900 dark:border-slate-800 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 truncate dark:text-slate-100">{profile?.name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{profile?.email}</p>
                      <span className="mt-1.5 inline-block badge badge-blue capitalize">{profile?.role || 'user'}</span>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                      {[
                        { icon: LayoutDashboard, label: 'Dashboard',    to: dashLink    },
                        { icon: History,         label: 'Ride History', to: dashLink    },
                        { icon: CreditCard,      label: 'Payments',     to: dashLink    },
                        { icon: Settings,        label: 'Settings',     to: '/settings' },
                      ].map(({ icon: Icon, label, to }) => (
                        <Link key={label} to={to}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors dark:text-slate-300 dark:hover:bg-slate-800">
                          <Icon size={14} className="text-slate-400 shrink-0" /> {label}
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-0.5">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={14} className="shrink-0" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-ghost text-slate-600">Log in</Link>
              <Link to="/signup" className="btn btn-primary">Get started</Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu"
          className="md:hidden ml-auto btn-icon text-slate-600 dark:text-slate-300">
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 px-4 py-3 space-y-1 animate-slide-down">
          {NAV.map(({ to, label }) => (
            <Link key={to} to={to}
              className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(to) ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}>
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2 space-y-1">
            {user ? (
              <>
                <Link to={dashLink} className="block px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-xl dark:text-slate-300 dark:hover:bg-slate-800">Dashboard</Link>
                <Link to="/settings" className="block px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-xl dark:text-slate-300 dark:hover:bg-slate-800">Settings</Link>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl">Sign out</button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link to="/login"  className="flex-1 btn btn-secondary justify-center">Log in</Link>
                <Link to="/signup" className="flex-1 btn btn-primary justify-center">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
