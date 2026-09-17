import { useState } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'
import { openUPIApp, createTransaction, updateTransactionStatus } from '../../services/paymentService'
import { useAuth } from '../../context/AuthContext'

const METHODS = [
  { id: 'phonepe', name: 'PhonePe', emoji: '💜', color: 'bg-purple-50 border-purple-200' },
  { id: 'gpay', name: 'Google Pay', emoji: '🔵', color: 'bg-blue-50 border-blue-200' },
  { id: 'paytm', name: 'Paytm', emoji: '💙', color: 'bg-sky-50 border-sky-200' },
  { id: 'razorpay', name: 'Card / Net Banking', emoji: '💳', color: 'bg-ink-50 border-ink-200' },
  { id: 'cash', name: 'Cash', emoji: '💵', color: 'bg-emerald-50 border-emerald-200' },
]

export default function PaymentModal({ fare, rideId, onSuccess, onClose }) {
  const { user } = useAuth()
  const [method, setMethod] = useState(null)
  const [step, setStep] = useState('select') // select | processing | success | failed
  const [txId, setTxId] = useState(null)

  const handlePay = async () => {
    if (!method) return
    setStep('processing')
    try {
      const id = await createTransaction({ userId: user.uid, rideId, amount: fare, method, status: 'pending' })
      setTxId(id)
      if (method === 'cash') {
        await updateTransactionStatus(id, 'success')
        setStep('success')
        setTimeout(onSuccess, 1500)
        return
      }
      if (['phonepe', 'gpay', 'paytm'].includes(method)) {
        openUPIApp(method, 'ridemate@ybl', fare, `RideMate Ride #${rideId?.slice(-6)}`)
        // Simulate success after 3s
        setTimeout(async () => {
          await updateTransactionStatus(id, 'success')
          setStep('success')
          setTimeout(onSuccess, 1500)
        }, 3000)
        return
      }
      // Razorpay
      setTimeout(async () => {
        await updateTransactionStatus(id, 'success')
        setStep('success')
        setTimeout(onSuccess, 1500)
      }, 2000)
    } catch {
      setStep('failed')
    }
  }

  return (
    <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-ink-100">
          <h2 className="font-display font-bold text-lg text-ink-900">Complete Payment</h2>
          {step === 'select' && <button onClick={onClose}><X size={20} className="text-ink-400 hover:text-ink-700" /></button>}
        </div>

        <div className="p-6">
          {step === 'select' && (
            <>
              <div className="text-center bg-brand-50 rounded-2xl p-4 mb-5">
                <p className="text-ink-500 text-sm">Total Amount</p>
                <p className="font-display font-bold text-4xl text-brand-600">₹{fare}</p>
              </div>
              <p className="text-xs font-semibold text-ink-500 mb-3">Select payment method</p>
              <div className="space-y-2 mb-5">
                {METHODS.map(m => (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${method === m.id ? 'border-brand-500 bg-brand-50' : `border-ink-200 ${m.color} hover:border-ink-300`}`}>
                    <span className="text-xl">{m.emoji}</span>
                    <span className="font-medium text-ink-800 text-sm">{m.name}</span>
                    {method === m.id && <CheckCircle size={16} className="text-brand-500 ml-auto" />}
                  </button>
                ))}
              </div>
              <button onClick={handlePay} disabled={!method} className="btn-primary w-full">
                Pay ₹{fare}
              </button>
            </>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-3xl">⏳</span>
              </div>
              <h3 className="font-bold text-ink-900 mb-2">Processing payment</h3>
              <p className="text-ink-400 text-sm">Please wait or complete payment in the app...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h3 className="font-bold text-ink-900 mb-2">Payment Successful!</h3>
              <p className="text-ink-400 text-sm">₹{fare} paid successfully. Enjoy your ride!</p>
            </div>
          )}

          {step === 'failed' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="font-bold text-ink-900 mb-2">Payment Failed</h3>
              <p className="text-ink-400 text-sm mb-5">Something went wrong. Please try again.</p>
              <button onClick={() => setStep('select')} className="btn-primary">Try Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
