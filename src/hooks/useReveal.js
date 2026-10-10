import { useEffect, useRef } from 'react'

/**
 * Lightweight IntersectionObserver-based scroll reveal.
 * Adds class "visible" to elements with class "reveal" when they enter viewport.
 */
export default function useReveal(deps = []) {
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current || document
    const els = container.querySelectorAll ? container.querySelectorAll('.reveal') : []
    if (!els.length) return

    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, deps) // eslint-disable-line

  return ref
}
