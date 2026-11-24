import { useEffect, useId, useRef, useState } from 'react'
import { fmt } from './ways'

/* ---------------- ikon (SVG, biar konsisten & tajam) ---------------- */
const P = {
  back: <path d="M15 4l-8 8 8 8" />,
  chevron: <path d="M9 4l8 8-8 8" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  play: <path d="M8 4.5l12 7.5-12 7.5V4.5z" fill="currentColor" stroke="none" />,
  gift: (
    <>
      <path d="M3.5 8.5h17v4h-17zM5.5 12.5v7.5h13v-7.5M12 8.5v11.5" />
      <path d="M12 8.5C9.2 8.5 7.6 7.3 7.6 5.8 7.6 4.4 8.7 3.5 10 3.5c2 0 2 3.5 2 5zM12 8.5c2.8 0 4.4-1.2 4.4-2.7 0-1.4-1.1-2.3-2.4-2.3-2 0-2 3.5-2 5z" />
    </>
  ),
  shop: <path d="M5 8h14l-1.2 12H6.2L5 8zM9 8V6.2A3 3 0 0112 3a3 3 0 013 3.2V8" />,
  chart: (
    <>
      <path d="M4 20V11M10 20V5M16 20v-6M22 20H2" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2.2" />
      <circle cx="9" cy="17" r="2.2" />
    </>
  ),
  sound: (
    <>
      <path d="M4 9.5v5h3.5l4.5 4V5.5l-4.5 4H4z" />
      <path d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" />
    </>
  ),
  mute: (
    <>
      <path d="M4 9.5v5h3.5l4.5 4V5.5l-4.5 4H4z" />
      <path d="M16 9.5l5 5M21 9.5l-5 5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.6" />
    </>
  ),
  bolt: <path d="M13.5 2L4 13.5h6L8.5 22 19 10.5h-6.2L13.5 2z" />,
  infinity: <path d="M7 8.5c-2.2 0-4 1.6-4 3.5s1.8 3.5 4 3.5c3.4 0 6.6-7 10-7 2.2 0 4 1.6 4 3.5s-1.8 3.5-4 3.5c-3.4 0-6.6-7-10-7z" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor" stroke="none" />,
  refresh: <path d="M20 12a8 8 0 11-2.4-5.7M20 4v5h-5" />,
  star: <path d="M12 3.5l2.6 5.4 6 .8-4.4 4.2 1.1 5.9L12 17l-5.3 2.8 1.1-5.9L3.4 9.7l6-.8L12 3.5z" />,
  trophy: (
    <>
      <path d="M8 4h8v4.5a4 4 0 01-8 0V4zM8 6H4.5A3.5 3.5 0 008 9.5M16 6h3.5A3.5 3.5 0 0116 9.5M12 12.5V17M8 20.5h8" />
    </>
  ),
}

export function Icon({ name, size = 22, stroke = 1.9, className = '' }) {
  const fill = name === 'play' || name === 'stop'
  return (
    <svg className={`ico ${className}`} width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      {fill ? null : P[name]}
      {fill ? P[name] : null}
    </svg>
  )
}

/* ---------------- koin (mahjong coin) ---------------- */
export function Coin({ size = 22, className = '' }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={`coin ${className}`} width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id={`cg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4c9" />
          <stop offset=".42" stopColor="#f1ce7a" />
          <stop offset="1" stopColor="#b47c22" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18.5" fill="#8a5c18" />
      <circle cx="20" cy="20" r="16.5" fill={`url(#cg${id})`} />
      <circle cx="20" cy="20" r="13.6" fill="none" stroke="#fff6d2" strokeWidth="1.4" opacity=".75" />
      <rect x="16.4" y="16.4" width="7.2" height="7.2" rx="1.4" fill="#7a4d12" stroke="#ffedb8" strokeWidth="1.1" />
      <circle cx="14" cy="12.5" r="2.6" fill="#fff" opacity=".32" />
    </svg>
  )
}

/* ---------------- angka yang menghitung naik/turun ---------------- */
export function Num({ value, className = '' }) {
  const [shown, setShown] = useState(value)
  const st = useRef({ cur: value, target: value, raf: 0 })
  useEffect(() => {
    const s = st.current
    s.target = value
    // tab tersembunyi = rAF nggak jalan, jadi langsung lompat biar angka nggak basi
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      cancelAnimationFrame(s.raf)
      s.raf = 0
      s.cur = value
      setShown(value)
      return
    }
    if (s.raf) return
    const tick = () => {
      const d = s.target - s.cur
      if (Math.abs(d) < 0.5) {
        s.cur = s.target
        setShown(s.target)
        s.raf = 0
        return
      }
      s.cur += d * 0.22
      setShown(s.cur)
      s.raf = requestAnimationFrame(tick)
    }
    s.raf = requestAnimationFrame(tick)
  }, [value])
  useEffect(() => () => cancelAnimationFrame(st.current.raf), [])
  return <span className={className}>{fmt(shown)}</span>
}

/* ---------------- modal / sheet ---------------- */
export function Modal({ open, onClose, title, accent = '#e8c46a', children, wide }) {
  if (!open) return null
  return (
    <div className="overlay" onClick={onClose}>
      <div className={`sheet${wide ? ' wide' : ''}`} style={{ '--acc': accent }}
        onClick={(e) => e.stopPropagation()}>
        <div className="sheetHead">
          <b>{title}</b>
          <button className="xBtn" onClick={onClose} aria-label="tutup"><Icon name="close" size={16} /></button>
        </div>
        <div className="sheetBody">{children}</div>
      </div>
    </div>
  )
}

export function Toggle({ on, onChange }) {
  return (
    <button className={`sw${on ? ' on' : ''}`} onClick={onChange} role="switch" aria-checked={on}>
      <i />
    </button>
  )
}
