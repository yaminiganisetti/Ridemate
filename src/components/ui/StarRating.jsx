import { Star } from 'lucide-react'

export default function StarRating({ rating, max=5, size=16, onChange }) {
  const stars = Array.from({ length: max }, (_, i) => i + 1)
  return (
    <div className="flex gap-0.5">
      {stars.map(star => (
        <button key={star} type="button" onClick={() => onChange?.(star)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <Star size={size}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-surface-300'}
          />
        </button>
      ))}
    </div>
  )
}
