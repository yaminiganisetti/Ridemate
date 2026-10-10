import { Loader } from 'lucide-react'

const VARIANTS = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
}

export default function Button({ children, variant = 'primary', loading = false, disabled, className = '', size = 'md', ...props }) {
  const sizeClass = size === 'sm' ? 'text-xs px-4 py-2' : size === 'lg' ? 'text-base px-8 py-4' : ''
  return (
    <button
      disabled={disabled || loading}
      className={`${VARIANTS[variant] || VARIANTS.primary} ${sizeClass} ${disabled || loading ? 'opacity-50 cursor-not-allowed hover:transform-none' : ''} ${className}`}
      {...props}>
      {loading && <Loader size={13} className="animate-spin" />}
      {children}
    </button>
  )
}
