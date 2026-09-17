import { useState } from 'react'
import { X, Star, Send, CheckCircle } from 'lucide-react'
import { submitFeedback } from '../../services/feedbackService'
import { useAuth } from '../../context/AuthContext'

export default function FeedbackModal({ rideId, driverId, driverName, onClose }) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (!rating || !user) return
    setLoading(true)
    try {
      await submitFeedback(rideId, user.uid, driverId, rating, comment)
      setDone(true)
      setTimeout(onClose, 1800)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

  return (
    <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-ink-100">
          <h2 className="font-display font-bold text-lg text-ink-900">Rate Your Ride</h2>
          <button onClick={onClose}><X size={18} className="text-ink-400" /></button>
        </div>

        <div className="p-6">
          {done ? (
            <div className="text-center py-6">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
              <p className="font-bold text-ink-900">Thanks for your feedback!</p>
            </div>
          ) : (
            <>
              <p className="text-center text-ink-500 text-sm mb-5">
                How was your ride with <strong>{driverName}</strong>?
              </p>

              {/* Star rating */}
              <div className="flex justify-center gap-2 mb-3">
                {[1,2,3,4,5].map(s => (
                  <button key={s}
                    onMouseEnter={() => setHoveredRating(s)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(s)}
                    className="text-4xl transition-transform hover:scale-110">
                    <span className={(hoveredRating || rating) >= s ? 'text-brand-400' : 'text-ink-200'}>★</span>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm font-semibold text-brand-600 mb-5 h-5">
                {LABELS[hoveredRating || rating]}
              </p>

              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                placeholder="Share your experience (optional)..."
                className="input-field resize-none text-sm mb-4"
              />

              <button onClick={handleSubmit} disabled={!rating || loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? 'Submitting...' : <><Send size={15} /> Submit Feedback</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
