import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Car, Menu, X, Bell, User, ChevronDown, LogOut, Settings, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { logOut } from '../../services/authService'
import { useNotifications } from '../../context/NotificationContext'

export default function Navbar() {
  const { user, profile } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const { unreadCount } = useNotifications()
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [dropOpen,    setDropOpen]    = useState(false)
  const [scrolled,    setScrolled]    = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMenuOpen(false); setDropOpen(false) }, [location.pathname])

  const handleLogout = async () => { await logOut(); navigate('/') }

  const dashLink = profile?.role === 'driver' ? '/driver' : profile?.role === 'admin' ? '/admin' : '/dashboard'

  const NAV_LINKS = [
    { to: '/', label: 'Home' },
    { to: '/book', label: 'Book a Ride' },
    { to: '/become-driver', label: 'Become a Driver' },
  ]

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass border-b border-ink-100/60 shadow-sm' : 'bg-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-premium transition-all duration-200">
            <Car size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-ink-900 tracking-tight">
            Ride<span className="text-brand-500">Mate</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive(to)
                  ? 'bg-brand-50 text-brand-600 font-semibold'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
              }`}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {/* Notifications bell */}
              <button onClick={() => navigate(dashLink)}
                className="relative p-2 rounded-xl hover:bg-ink-100 text-ink-600 hover:text-ink-900 transition-colors">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User dropdown */}
              <div className="relative">
                <button onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 bg-white border border-ink-200 rounded-2xl px-3 py-2 hover:border-brand-300 hover:shadow-sm transition-all duration-200">
                  <div className="w-6 h-6 bg-brand-100 rounded-lg flex items-center justify-center text-xs font-bold text-brand-600">
                    {profile?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-sm font-medium text-ink-800 max-w-[100px] truncate">{profile?.name?.split(' ')[0]}</span>
                  <ChevronDown size={13} className={`text-ink-400 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
                    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 bg-white rounded-2xl shadow-card-hover border border-ink-100/60 py-1.5 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-ink-100">
                        <p className="text-xs font-semibold text-ink-800 truncate">{profile?.name}</p>
                        <p className="text-xs text-ink-400 truncate">{profile?.email}</p>
                      </div>
                      {[
                        { icon: LayoutDashboard, label: 'Dashboard', to: dashLink },
                        { icon: Settings,        label: 'Settings',  to: '/settings' },
                      ].map(({ icon: Icon, label, to }) => (
                        <Link key={to} to={to}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors">
                          <Icon size={14} className="text-ink-400" /> {label}
                        </Link>
                      ))}
                      <div className="border-t border-ink-100 mt-1.5 pt-1.5">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut size={14} /> Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm">Log in</Link>
              <Link to="/signup" className="btn-primary text-sm px-5 py-2.5">Get started</Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-ink-100 text-ink-700 transition-colors">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-ink-100/60 px-4 py-4 space-y-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive(to) ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-ink-700 hover:bg-ink-100'
              }`}>
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-ink-100">
            {user ? (
              <>
                <Link to={dashLink} className="block px-4 py-3 text-sm text-ink-700 hover:bg-ink-100 rounded-xl">Dashboard</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl">Sign out</button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link to="/login"  className="flex-1 btn-secondary text-sm py-2.5 justify-center">Log in</Link>
                <Link to="/signup" className="flex-1 btn-primary text-sm py-2.5 justify-center">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
