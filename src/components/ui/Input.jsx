export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-ink-600 mb-1.5">{label}</label>}
      <input className={`input-field ${error ? 'ring-2 ring-red-400 border-red-300' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
