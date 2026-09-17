import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Car, CheckCircle, AlertCircle } from 'lucide-react'
import { resetPassword } from '../../services/authService'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError('Email not found. Please check and try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center">
              <Car size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-ink-900">Ride<span className="text-brand-500">Mate</span></span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-ink-900 mb-1">Reset password</h1>
          <p className="text-ink-400 text-sm">We'll send you a reset link</p>
        </div>
        <div className="bg-white rounded-3xl shadow-card p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-emerald-500" />
              </div>
              <h3 className="font-display font-bold text-lg text-ink-900 mb-2">Email sent!</h3>
              <p className="text-ink-400 text-sm mb-6">Check your inbox for the reset link.</p>
              <Link to="/login" className="btn-primary inline-block">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm rounded-2xl px-4 py-3 flex items-center gap-2"><AlertCircle size={15}/>{error}</div>}
              <div>
                <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="input-field pl-10" placeholder="you@example.com" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <div className="text-center">
                <Link to="/login" className="text-sm text-ink-400 hover:text-ink-600">← Back to login</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
