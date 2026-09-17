const VARIANTS = {
  success:  'bg-emerald-100 text-emerald-700 border border-emerald-200/60',
  warning:  'bg-amber-100 text-amber-700 border border-amber-200/60',
  error:    'bg-red-100 text-red-600 border border-red-200/60',
  info:     'bg-blue-100 text-blue-700 border border-blue-200/60',
  default:  'bg-ink-100 text-ink-600 border border-ink-200/60',
  brand:    'bg-brand-100 text-brand-700 border border-brand-200/60',
}
export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${VARIANTS[variant] || VARIANTS.default} ${className}`}>
      {children}
    </span>
  )
}
