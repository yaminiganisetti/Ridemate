import { Loader } from 'lucide-react'
export default function Spinner({ size = 20, className = 'text-primary-500' }) {
  return <Loader size={size} className={`animate-spin ${className}`} />
}
