import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Phone, Car, FileText, AlertCircle, Upload, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { registerDriver } from '../../services/driverService'

const VEHICLE_TYPES = [
  { value: 'bike', label: 'Bike', icon: '🏍️', desc: 'Motorcycles & scooters' },
  { value: 'auto', label: 'Auto', icon: '🛺', desc: 'Three-wheelers' },
  { value: 'car', label: 'Car', icon: '🚗', desc: 'Sedan, hatchback, SUV' },
]

export default function DriverRegisterPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    vehicleType: '',
    vehicleNumber: '',
    vehicleModel: '',
    licenseNumber: '',
    aadhaar: '',
  })
  const [licenseFile, setLicenseFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB')
      return
    }
    setLicenseFile(file)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!form.vehicleType) { setError('Please select vehicle type'); return }
    if (!licenseFile) { setError('Please upload your driving license'); return }

    setLoading(true)
    setError('')
    try {
      await registerDriver(user.uid, {
        ...form,
        email: user.email,
        avatar: user.photoURL || '',
      }, licenseFile)
      navigate('/driver-pending')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🚗</div>
          <h1 className="font-display font-bold text-3xl text-ink-900 mb-2">Become a Driver Partner</h1>
          <p className="text-ink-400">Earn on your own schedule. Join 2,400+ RideMate drivers.</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > s ? 'bg-emerald-500 text-white' :
                step === s ? 'bg-brand-500 text-white' :
                'bg-ink-200 text-ink-500'
              }`}>
                {step > s ? <CheckCircle size={16} /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-emerald-400' : 'bg-ink-200'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-12 mb-8 text-xs text-ink-400">
          <span className={step >= 1 ? 'text-brand-600 font-medium' : ''}>Personal Info</span>
          <span className={step >= 2 ? 'text-brand-600 font-medium' : ''}>Vehicle Details</span>
          <span className={step >= 3 ? 'text-brand-600 font-medium' : ''}>Documents</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl shadow-card p-8">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-2xl px-4 py-3 mb-6 flex items-center gap-2">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display font-semibold text-xl text-ink-900 mb-2">Personal Information</h2>
                <div>
                  <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Full Name *</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input value={form.name} onChange={e => set('name', e.target.value)}
                      required className="input-field pl-10" placeholder="Your full legal name" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Phone Number *</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input value={form.phone} onChange={e => set('phone', e.target.value)}
                      required type="tel" className="input-field pl-10" placeholder="+91 9876543210" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Aadhaar Number (optional)</label>
                  <input value={form.aadhaar} onChange={e => set('aadhaar', e.target.value)}
                    className="input-field" placeholder="XXXX XXXX XXXX" maxLength={14} />
                </div>
                <button type="button" onClick={() => { if (!form.name || !form.phone) { setError('Fill required fields'); return } setError(''); setStep(2) }}
                  className="btn-primary w-full">Continue →</button>
              </div>
            )}

            {/* Step 2: Vehicle */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display font-semibold text-xl text-ink-900 mb-2">Vehicle Details</h2>
                <div>
                  <label className="text-xs font-semibold text-ink-700 mb-2 block">Vehicle Type *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {VEHICLE_TYPES.map(v => (
                      <button key={v.value} type="button" onClick={() => set('vehicleType', v.value)}
                        className={`p-4 rounded-2xl border-2 text-center transition-all ${
                          form.vehicleType === v.value ? 'border-brand-500 bg-brand-50' : 'border-ink-200 hover:border-ink-300'
                        }`}>
                        <span className="text-3xl block mb-1">{v.icon}</span>
                        <span className="text-sm font-semibold text-ink-800 block">{v.label}</span>
                        <span className="text-xs text-ink-400">{v.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Vehicle Number *</label>
                  <div className="relative">
                    <Car size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input value={form.vehicleNumber} onChange={e => set('vehicleNumber', e.target.value.toUpperCase())}
                      required className="input-field pl-10 font-mono" placeholder="KA 01 AB 1234" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Vehicle Model *</label>
                  <input value={form.vehicleModel} onChange={e => set('vehicleModel', e.target.value)}
                    required className="input-field" placeholder="e.g., Honda Activa, Bajaj RE Auto" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                  <button type="button" onClick={() => { if (!form.vehicleType || !form.vehicleNumber || !form.vehicleModel) { setError('Fill all vehicle details'); return } setError(''); setStep(3) }}
                    className="btn-primary flex-1">Continue →</button>
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display font-semibold text-xl text-ink-900 mb-2">Upload Documents</h2>
                <div>
                  <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Driving License Number *</label>
                  <div className="relative">
                    <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value.toUpperCase())}
                      required className="input-field pl-10 font-mono" placeholder="KA0120200012345" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-700 mb-2 block">Upload License Photo *</label>
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${
                    licenseFile ? 'border-emerald-400 bg-emerald-50' : 'border-ink-300 hover:border-brand-400 hover:bg-brand-50/30'
                  }`}>
                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                    {licenseFile ? (
                      <>
                        <CheckCircle size={28} className="text-emerald-500 mb-2" />
                        <p className="text-sm font-semibold text-emerald-700">{licenseFile.name}</p>
                        <p className="text-xs text-emerald-500 mt-0.5">Click to replace</p>
                      </>
                    ) : (
                      <>
                        <Upload size={28} className="text-ink-400 mb-2" />
                        <p className="text-sm font-semibold text-ink-700">Click to upload license</p>
                        <p className="text-xs text-ink-400 mt-0.5">JPG, PNG or PDF · Max 5MB</p>
                      </>
                    )}
                  </label>
                </div>

                <div className="bg-amber-50 rounded-2xl p-4 text-sm text-amber-800 border border-amber-200">
                  <p className="font-semibold mb-1">📋 What happens next?</p>
                  <p className="text-xs leading-relaxed">Your application will be reviewed by our admin team within 24–48 hours.
                    You'll be notified by email and in-app once approved.</p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
