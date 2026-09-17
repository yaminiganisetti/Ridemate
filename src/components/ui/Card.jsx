export default function Card({ children, className = '', hover = false, colored = false }) {
  const base = colored ? 'card-colored' : hover ? 'card' : 'card-flat'
  return <div className={`${base} ${className}`}>{children}</div>
}
