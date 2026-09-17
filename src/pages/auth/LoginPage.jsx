import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Car, AlertCircle } from 'lucide-react'
import { signIn, signInWithGoogle } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { profile, refreshProfile } = useAuth()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const getRedirect = (p) => {
    if (p?.role === 'driver') return '/driver'
    if (p?.role === 'admin') return '/admin'
    return '/dashboard'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(form.email, form.password)
      await refreshProfile()
      navigate(getRedirect(profile))
    } catch (err) {
      setError(err.code === 'auth/invalid-credential' ? 'Invalid email or password' : err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      await refreshProfile()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center">
              <Car size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-ink-900">
              Ride<span className="text-brand-500">Mate</span>
            </span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-ink-900 mb-1">Welcome back</h1>
          <p className="text-ink-400 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card p-8">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-2xl px-4 py-3 mb-5 flex items-center gap-2">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="email" required
                  value={form.email} onChange={e => set('email', e.target.value)}
                  className="input-field pl-10" placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type={showPass ? 'text' : 'password'} required
                  value={form.password} onChange={e => set('password', e.target.value)}
                  className="input-field pl-10 pr-10" placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-ink-400 text-xs">or continue with</span>
            </div>
          </div>

          <button onClick={handleGoogle} disabled={loading}
            className="w-full btn-secondary flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
        </div>

        <p className="text-center text-sm text-ink-400 mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-500 font-semibold hover:text-brand-600">Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
