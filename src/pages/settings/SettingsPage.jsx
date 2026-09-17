import { useState } from 'react'
import { User, Phone, Mail, Save, Bell, Trash2, AlertCircle, Loader, CheckCircle, Shield, Key } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { updateUserProfile } from '../../services/authService'
import { markAllRead } from '../../services/notificationService'

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User    },
  { id: 'notifications', label: 'Notifications', icon: Bell    },
  { id: 'security',      label: 'Security',      icon: Shield  },
]

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
      toast('Profile updated successfully!', 'success')
    } catch { toast('Failed to update profile', 'error') }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-900">Settings</h1>
        <p className="text-ink-400 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="bg-white rounded-3xl shadow-card border border-ink-100/60 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-ink-100">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
                tab === id ? 'text-brand-600 border-b-2 border-brand-500 bg-brand-50/20' : 'text-ink-500 hover:text-ink-800'
              }`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-5">
              {/* Avatar + info */}
              <div className="flex items-center gap-4 p-4 bg-ink-50 rounded-2xl">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-sm shrink-0">
                  {profile?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-bold text-ink-900">{profile?.name}</p>
                  <p className="text-sm text-ink-400">{profile?.email}</p>
                  <span className="inline-flex items-center text-[10px] bg-brand-100 text-brand-700 px-2.5 py-0.5 rounded-full font-bold mt-1 uppercase tracking-wide">
                    {profile?.role || 'user'}
                  </span>
                </div>
              </div>

              {/* Fields */}
              {[
                { key: 'name',  label: 'Full Name',    icon: User,  type: 'text', placeholder: 'Your full name'     },
                { key: 'phone', label: 'Phone Number', icon: Phone, type: 'tel',  placeholder: '+91 9876543210'    },
              ].map(({ key, label, icon: Icon, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-ink-600 mb-1.5 block">{label}</label>
                  <div className="relative">
                    <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                    <input type={type} value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="input-field pl-10" placeholder={placeholder} />
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold text-ink-600 mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                  <input value={profile?.email || ''} disabled
                    className="input-field pl-10 bg-ink-100 text-ink-400 cursor-not-allowed" />
                </div>
                <p className="text-xs text-ink-400 mt-1">Email cannot be changed here</p>
              </div>

              <button type="submit" disabled={saving}
                className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                Save Changes
              </button>
            </form>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {tab === 'notifications' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4">
                <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                  <Bell size={14} className="text-amber-500" /> Notification Preferences
                </p>
                <p className="text-xs text-amber-700 mt-0.5">Control what you receive from RideMate</p>
              </div>

              {[
                { key: 'rideUpdates',   label: 'Ride Updates',    desc: 'Driver accepted, arrived, ride completed' },
                { key: 'paymentAlerts', label: 'Payment Alerts',  desc: 'Payment success, failure and receipts'    },
                { key: 'promotions',    label: 'Promotions',      desc: 'Discounts, offers and new features'       },
                { key: 'chatMessages',  label: 'Chat Messages',   desc: 'In-ride messages from your driver'        },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 border border-ink-100 rounded-2xl hover:bg-ink-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-ink-800">{label}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{desc}</p>
                  </div>
                  <button onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                    className={`w-11 h-6 rounded-full transition-all duration-200 relative shrink-0 ml-4 ${notifPrefs[key] ? 'bg-brand-500 shadow-sm' : 'bg-ink-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform duration-200 ${notifPrefs[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}

              <button onClick={async () => {
                try { await markAllRead(user.uid); toast('All notifications marked as read', 'success') }
                catch { toast('Failed', 'error') }
              }} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
                <CheckCircle size={14} /> Mark All as Read
              </button>
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {tab === 'security' && (
            <div className="space-y-4">
              <div className="border border-ink-100 rounded-2xl p-4 flex items-center justify-between hover:bg-ink-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Key size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-800">Password</p>
                    <p className="text-xs text-ink-400 mt-0.5">Change your login password</p>
                  </div>
                </div>
                <a href="/forgot-password" className="text-sm font-semibold text-brand-500 hover:text-brand-700 transition-colors">Change →</a>
              </div>

              <div className="border border-ink-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                    <Shield size={16} className="text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-800">Two-Factor Auth</p>
                    <p className="text-xs text-ink-400 mt-0.5">Add extra security to your account</p>
                  </div>
                </div>
                <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold">Soon</span>
              </div>

              <div className="border border-red-100 bg-red-50/40 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle size={16} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-800">Delete Account</p>
                    <p className="text-xs text-red-600 mt-0.5 mb-3 leading-relaxed">
                      This permanently removes your account and all associated data. This action cannot be undone.
                    </p>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-white px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors">
                      <Trash2 size={11} /> Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
