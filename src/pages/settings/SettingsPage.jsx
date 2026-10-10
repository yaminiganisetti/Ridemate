import { useState } from 'react'
import { User, Phone, Mail, Save, Bell, Trash2, AlertCircle, Loader, CheckCircle, Shield, Key } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { updateUserProfile } from '../../services/authService'
import { markAllRead } from '../../services/notificationService'

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const { toast } = useToast()
  const [tab, setTab]     = useState('profile')
  const [form, setForm]   = useState({ name: profile?.name || '', phone: profile?.phone || '' })
  const [saving, setSaving] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState({
    rideUpdates: true, paymentAlerts: true, promotions: false, chatMessages: true,
  })

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast('Name is required', 'warning'); return }
    setSaving(true)
    try {
      await updateUserProfile(user.uid, { name: form.name.trim(), phone: form.phone.trim() })
      await refreshProfile()
      toast('Profile updated', 'success')
    } catch { toast('Failed to update profile', 'error') }
    setSaving(false)
  }

  const TABS = [
    { id: 'profile',       label: 'Profile'       },
    { id: 'security',      label: 'Security'      },
    { id: 'notifications', label: 'Notifications' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account preferences</p>
      </div>

      <div className="card dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                tab === t.id
                  ? 'text-primary-600 border-primary-600 dark:text-primary-400 dark:border-primary-500'
                  : 'text-slate-500 border-transparent hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}>{t.label}</button>
          ))}
        </div>

        <div className="p-6">
          {/* PROFILE */}
          {tab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-5">
              {/* Avatar row */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {profile?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{profile?.name}</p>
                  <p className="text-xs text-slate-400">{profile?.email}</p>
                  <span className="mt-1 inline-block badge badge-blue capitalize">{profile?.role || 'user'}</span>
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Full name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input type="text" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
                      className="input input-with-icon" placeholder="Your full name" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Phone number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input type="tel" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))}
                      className="input input-with-icon" placeholder="+91 9876543210" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input value={profile?.email || ''} disabled
                      className="input input-with-icon bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Email address cannot be changed here</p>
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                Save changes
              </button>
            </form>
          )}

          {/* SECURITY */}
          {tab === 'security' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <Key size={15} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Password</p>
                    <p className="text-xs text-slate-400">Change your login password</p>
                  </div>
                </div>
                <a href="/forgot-password" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">Change →</a>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <Shield size={15} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Two-factor authentication</p>
                    <p className="text-xs text-slate-400">Add extra security to your account</p>
                  </div>
                </div>
                <span className="badge badge-amber">Coming soon</span>
              </div>

              <div className="p-4 border border-red-300/30 bg-red-50 dark:bg-red-900/10 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                    <AlertCircle size={15} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">Delete account</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
                      This permanently removes your account and all data. This cannot be undone.
                    </p>
                    <button className="btn btn-sm btn-danger flex items-center gap-1.5">
                      <Trash2 size={12} /> Delete my account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {tab === 'notifications' && (
            <div className="space-y-3">
              {[
                { key: 'rideUpdates',   label: 'Ride updates',    desc: 'Driver accepted, arrived, completed' },
                { key: 'paymentAlerts', label: 'Payment alerts',  desc: 'Receipts, failures, confirmations'   },
                { key: 'chatMessages',  label: 'Chat messages',   desc: 'In-ride messages from your driver'   },
                { key: 'promotions',    label: 'Promotions',      desc: 'Offers, discounts and new features'  },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                    className={`toggle ${notifPrefs[key] ? 'toggle-on' : ''}`}
                    role="switch" aria-checked={notifPrefs[key]} aria-label={label}>
                    <span className="toggle-thumb" />
                  </button>
                </div>
              ))}

              <button onClick={async () => {
                try { await markAllRead(user.uid); toast('All notifications marked as read', 'success') }
                catch { toast('Failed', 'error') }
              }} className="btn btn-secondary flex items-center gap-2 mt-2">
                <CheckCircle size={14} /> Mark all as read
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
