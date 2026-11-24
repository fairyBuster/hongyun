import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { rupiah } from '../data.js'
import { K, read, statusText, timeText, write } from '../logic.js'

/* ---------- icon sprite (garis sederhana, currentColor) ---------- */
export function IconSprite() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', width: 0, height: 0 }}>
      <symbol id="i-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V20h13V9.5" />
        <path d="M9.8 20v-5.2h4.4V20" />
      </symbol>
      <symbol id="i-activity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="4" width="17" height="16.5" rx="3" />
        <path d="M7.5 9h9M7.5 13h9M7.5 17h5" />
      </symbol>
      <symbol id="i-promo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3.2 14.6 9l6.4.7-4.8 4.3 1.4 6.3L12 17l-5.6 3.3 1.4-6.3L3 9.7 9.4 9z" />
      </symbol>
      <symbol id="i-account" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.7" />
        <path d="M4.6 20.5c.7-3.8 3.7-6 7.4-6s6.7 2.2 7.4 6" />
      </symbol>
      <symbol id="i-wheel" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="8.6" />
        <path d="M12 3.4v17.2M3.4 12h17.2M6 6l12 12M18 6 6 18" />
      </symbol>
      <symbol id="i-notif" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <path d="M6 9.5a6 6 0 0 1 12 0c0 4 1.4 5.6 1.9 6.3H4.1C4.6 15.1 6 13.5 6 9.5z" />
        <path d="M10 19.2a2.2 2.2 0 0 0 4 0" />
      </symbol>
      <symbol id="i-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="square">
        <path d="M11.9 0v20" />
        <path d="M21.8 9.9 11.9 19.8 2 9.9" />
      </symbol>
      <symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
        <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
        <path d="m4 7 8 6 8-6" />
      </symbol>
      <symbol id="i-wallet" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="8" width="24" height="17" rx="4" />
        <path d="M4 13h24M21 18.5h4" />
      </symbol>
      <symbol id="i-in" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M16 5v16M10 15l6 6 6-6" />
        <path d="M5 24v3h22v-3" />
      </symbol>
      <symbol id="i-out" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M16 27V11M10 17l6-6 6 6" />
        <path d="M5 8V5h22v3" />
      </symbol>
      <symbol id="i-vip" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M5 11l4.5 4L16 6l6.5 9L27 11l-2.4 14H7.4z" />
      </symbol>
      <symbol id="i-bet" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="16" cy="16" r="11" />
        <path d="M11 11h10M16 11v11" />
      </symbol>
      <symbol id="i-tr" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M6 9h20M6 16h20M6 23h12" />
      </symbol>
      <symbol id="i-bell" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M9 14a7 7 0 0 1 14 0c0 5 2 7 2.5 8H6.5C7 21 9 19 9 14z" />
        <path d="M13 25.5a3 3 0 0 0 6 0" />
      </symbol>
      <symbol id="i-gift" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <rect x="5" y="12" width="22" height="15" rx="2" />
        <path d="M5 17h22M16 12v15" />
        <path d="M16 12c-4 0-6-1.6-6-4a3 3 0 0 1 6 0c0 2.4-2 4 0 4zm0 0c4 0 6-1.6 6-4a3 3 0 0 0-6 0c0 2.4 2 4 0 4z" />
      </symbol>
      <symbol id="i-coupon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M4 12V8h24v4a4 4 0 0 0 0 8v4H4v-4a4 4 0 0 0 0-8z" />
        <path d="M12 10v12" strokeDasharray="3 3" />
      </symbol>
      <symbol id="i-trophy" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M10 5h12v8a6 6 0 0 1-12 0z" />
        <path d="M10 8H6v3a4 4 0 0 0 4 4M22 8h4v3a4 4 0 0 1-4 4" />
        <path d="M16 19v5M11 27h10" />
      </symbol>
      <symbol id="i-code" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <rect x="4" y="6" width="24" height="20" rx="2" />
        <path d="M9 13h6M9 18h4M18 13l5 5-5 5" />
      </symbol>
      <symbol id="i-stats" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M6 25V15M13 25V8M20 25v-7M27 25V11" />
      </symbol>
      <symbol id="i-lang" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="16" cy="16" r="11" />
        <path d="M5 16h22M16 5c3.4 3.4 3.4 18.6 0 22M16 5c-3.4 3.4-3.4 18.6 0 22" />
      </symbol>
      <symbol id="i-settings" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="16" cy="16" r="4.5" />
        <path d="M16 4v4M16 24v4M4 16h4M24 16h4M8 8l3 3M21 21l3 3M24 8l-3 3M11 21l-3 3" />
      </symbol>
      <symbol id="i-feedback" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M5 7h22v14H13l-6 5v-5H5z" />
        <path d="M11 13h10M11 17h6" strokeLinecap="round" />
      </symbol>
      <symbol id="i-announce" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M6 13v6h4l10 6V7L10 13z" />
        <path d="M24 12a6 6 0 0 1 0 8" strokeLinecap="round" />
      </symbol>
      <symbol id="i-service" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M6 18v-4a10 10 0 0 1 20 0v4" />
        <rect x="3" y="17" width="5" height="8" rx="2" />
        <rect x="24" y="17" width="5" height="8" rx="2" />
        <path d="M26 25a5 5 0 0 1-5 5h-3" strokeLinecap="round" />
      </symbol>
      <symbol id="i-guide" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M5 7c4-2 8-2 11 0v19c-3-2-7-2-11 0zM27 7c-4-2-8-2-11 0v19c3-2 7-2 11 0z" />
      </symbol>
      <symbol id="i-about" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="16" cy="16" r="11" />
        <path d="M16 14v9M16 9.6v.8" strokeLinecap="round" />
      </symbol>
      <symbol id="i-logout" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M19 5H7v22h12" />
        <path d="M16 16h12M24 11l5 5-5 5" />
      </symbol>
      <symbol id="i-refresh" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M26 16a10 10 0 1 1-3-7.1" />
        <path d="M26 5v6h-6" />
      </symbol>
      <symbol id="i-copy" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <rect x="10" y="10" width="16" height="16" rx="2" />
        <path d="M22 10V6H6v16h4" />
      </symbol>
      <symbol id="i-edit" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M22 5l5 5-15 15H7v-5z" />
      </symbol>
      <symbol id="i-cs" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M6 13v6h4l10 6V7L10 13z" />
        <path d="M24 12a6 6 0 0 1 0 8" strokeLinecap="round" />
      </symbol>
      <symbol id="i-info" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="16" cy="16" r="11" />
        <path d="M16 14v9M16 9.6v.8" strokeLinecap="round" />
      </symbol>
      <symbol id="i-empty" viewBox="0 0 120 80" fill="none" stroke="#cdd2dd" strokeWidth="3">
        <rect x="18" y="20" width="84" height="46" rx="6" />
        <path d="M18 34h84M40 46h16" strokeLinecap="round" />
        <circle cx="92" cy="26" r="4" fill="#e6e9f0" stroke="none" />
      </symbol>
      <symbol id="i-tip" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="13" cy="13" r="10" />
        <path d="M13 11v7M13 7.6v.8" strokeLinecap="round" />
      </symbol>
      <symbol id="i-bolt" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M14 3 5 15h6l-1 8 9-12h-6z" />
      </symbol>
      <symbol id="i-coin" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="13" cy="13" r="10" />
        <path d="M13 7v12M9.6 9.5h6.8M9.6 16.5h6.8" strokeLinecap="round" />
      </symbol>
      <symbol id="i-arrow-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 4 7 12l8 8" />
      </symbol>
      <symbol id="i-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
        <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" strokeLinecap="round" />
        <path d="M12 14.5v2.2" strokeLinecap="round" />
      </symbol>
      <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 13 5 5L19 7" />
      </symbol>
    </svg>
  )
}

export const Svg = ({ id, className = '', style, ...rest }) => (
  <svg className={'svg-icon ' + className} style={style} {...rest}>
    <use href={'#' + id} />
  </svg>
)

/* ---------- logo brand ---------- */
export function BrandLogo() {
  return (
    <svg className="brand-logo3d" viewBox="0 0 152 36" role="img" aria-label="HONGYUN">
      <defs>
        <linearGradient id="hyGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset=".18" stopColor="#ffe98a" />
          <stop offset=".42" stopColor="#ffc61f" />
          <stop offset=".68" stopColor="#f08a04" />
          <stop offset=".88" stopColor="#ffcf35" />
          <stop offset="1" stopColor="#fff3b8" />
        </linearGradient>
      </defs>
      <g transform="skewX(-6) translate(3 0)">
        <text x="1" y="31" fontFamily="Segoe UI, Arial Black, sans-serif" fontSize="30" fontWeight="900" letterSpacing=".4" textLength="146" lengthAdjust="spacingAndGlyphs" fill="#7a1a06" stroke="#3d0500" strokeWidth=".8" transform="translate(1.6 3.2)">HONGYUN</text>
        <text x="1" y="31" fontFamily="Segoe UI, Arial Black, sans-serif" fontSize="30" fontWeight="900" letterSpacing=".4" textLength="146" lengthAdjust="spacingAndGlyphs" fill="url(#hyGold)" stroke="#6b2a00" strokeWidth=".7" paintOrder="stroke" strokeLinejoin="round">HONGYUN</text>
      </g>
    </svg>
  )
}

/* ---------- navbar ---------- */
export function NavBar({ variant = 'main', title, back, right, logo }) {
  return (
    <div className={'navbar ' + variant}>
      <div className="navbar-fixed">
        <div className="navbar__content">
          <div className="navbar__content-left">
            {back ? (
              <i className="van-badge__wrapper van-icon van-icon-arrow-left" onClick={back} />
            ) : logo === false ? null : logo === 'dark' ? (
              <div className="headLogo" />
            ) : (
              <BrandLogo />
            )}
          </div>
          <div className="navbar__content-center">
            <div className="navbar__content-title">{title || ''}</div>
          </div>
          <div className="navbar__content-right">{right}</div>
        </div>
      </div>
    </div>
  )
}

/* ---------- modal sheet bersama ---------- */
export function Modal({ open, title, onClose, children, footer, className = '' }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose && onClose()
    window.addEventListener('keydown', onKey)
    document.body.classList.add('hy-modal-open')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('hy-modal-open')
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="hy-overlay" onClick={() => onClose && onClose()}>
      <div
        className={'hy-sheet ' + className}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hy-sheet__head">
          <h3>{title}</h3>
          <button type="button" className="hy-sheet__close" onClick={() => onClose && onClose()} aria-label="Tutup">
            ×
          </button>
        </div>
        <div className="hy-sheet__body">{children}</div>
        {footer ? <div className="hy-sheet__foot">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}

/* ---------- daftar transaksi (dipakai di beberapa halaman) ---------- */
const TX_LABEL = { deposit: 'Deposit', withdraw: 'Penarikan', bonus: 'Bonus', wheel: 'Bonus Undian' }

export function TxList({ items, empty = 'Belum ada transaksi' }) {
  if (!items || !items.length) {
    return (
      <div className="hy-empty">
        <Svg id="i-empty" style={{ width: '2.4rem', height: '1.6rem' }} />
        <p>{empty}</p>
      </div>
    )
  }
  return (
    <div className="hy-txlist">
      {items.map((t) => {
        const out = t.kind === 'withdraw'
        const pending = t.status && t.status !== 'success'
        return (
          <div className="hy-tx" key={t.id}>
            <div className="hy-tx__left">
              <b>{t.label || TX_LABEL[t.kind] || 'Transaksi'}</b>
              <span>
                {timeText(t.at)}
                {t.method ? ' · ' + t.method : ''}
              </span>
            </div>
            <div className="hy-tx__right">
              <b className={out ? 'out' : 'in'}>
                {out ? '-' : '+'}
                {rupiah(t.amount)}
              </b>
              <i className={'hy-chip hy-chip--' + (t.status || 'success')}>
                {statusText[t.status || 'success'] || t.status}
              </i>
              {pending ? null : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- chat customer service ---------- */
const csReply = (text) => {
  const s = text.toLowerCase()
  if (s.includes('deposit') || s.includes('top up') || s.includes('isi saldo'))
    return 'Untuk deposit: buka Akun → Deposit, pilih QRIS / Virtual Account / LinkAja, isi minimal Rp20.000, lalu selesaikan pembayaran sebelum 15 menit. Saldo masuk otomatis setelah pembayaran terverifikasi.'
  if (s.includes('tarik') || s.includes('withdraw') || s.includes('penarikan'))
    return 'Penarikan minimal Rp50.000 setelah rekening bank ditautkan. Buka Akun → Penarikan, tambahkan rekening atas nama sendiri, lalu ajukan penarikan. Proses normal 1–15 menit.'
  if (s.includes('sandi') || s.includes('password') || s.includes('lupa'))
    return 'Lupa kata sandi? Siapkan nomor terdaftar dan kirim permintaan reset di chat ini. Tim verifikasi akan memproses maksimal 10 menit.'
  if (s.includes('bonus') || s.includes('promo'))
    return 'Bonus aktif: check-in harian di Aktivitas, bonus deposit perdana, dan rabat taruhan 0,5%. Cek menu Promosi untuk syarat lengkap.'
  if (s.includes('mahjong') || s.includes('game') || s.includes('spin'))
    return 'Semua permainan ada di Beranda. Mahjong Ways tersedia 20 varian; pilih kartu, atur nominal taruhan, lalu tekan SPIN. Jika game tidak termuat, coba muat ulang halaman.'
  if (s.includes('terima kasih') || s.includes('makasih') || s.includes('thanks'))
    return 'Sama-sama! CS HONGYUN online 24 jam jika butuh bantuan lain.'
  return 'Terima kasih, pesan anda sudah diterima. CS HONGYUN online 24 jam — mohon tunggu sebentar, agen akan membalas. Untuk respon cepat, sebutkan kendala: deposit, penarikan, sandi, bonus, atau game.'
}

export function Customer({ toast }) {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState(() =>
    read(K.chat, [{ from: 'cs', text: 'Halo! Saya CS HONGYUN 24 jam. Ada yang bisa dibantu?', at: Date.now() }]),
  )
  const [text, setText] = useState('')
  const boxRef = useRef(null)

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener('hy:chat', onOpen)
    return () => window.removeEventListener('hy:chat', onOpen)
  }, [])

  useEffect(() => {
    if (open && boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight
  }, [open, msgs])

  const push = (m) => {
    setMsgs((prev) => {
      const next = [...prev, m].slice(-50)
      write(K.chat, next)
      return next
    })
  }

  const send = () => {
    const t = text.trim()
    if (!t) return
    push({ from: 'me', text: t, at: Date.now() })
    setText('')
    setTimeout(() => push({ from: 'cs', text: csReply(t), at: Date.now() }), 800)
  }

  return (
    <>
      <div
        className="customer"
        onClick={() => {
          setOpen(true)
          if (toast) toast('Customer Service 24 jam — live chat')
        }}
      >
        <img src="/assets/png/icon_sevice-CHO-MUt9.png" alt="cs" />
      </div>
      <Modal open={open} title="Customer Service" onClose={() => setOpen(false)} className="hy-sheet--chat">
        <div className="hy-chat" ref={boxRef}>
          {msgs.map((m, i) => (
            <div key={m.at + '-' + i} className={'hy-chat__row ' + (m.from === 'me' ? 'me' : 'cs')}>
              {m.from === 'cs' ? <span className="hy-chat__avatar">CS</span> : null}
              <div className="hy-chat__bubble">{m.text}</div>
            </div>
          ))}
        </div>
        <div className="hy-chat__quick">
          {['Deposit', 'Penarikan', 'Lupa sandi', 'Bonus'].map((q) => (
            <button key={q} type="button" onClick={() => setText(q)}>
              {q}
            </button>
          ))}
        </div>
        <div className="hy-chat__send">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Tulis pesan..."
          />
          <button type="button" onClick={send}>
            Kirim
          </button>
        </div>
      </Modal>
    </>
  )
}

/* ---------- bottom tabbar ---------- */
export function TabBar({ route, navigate }) {
  const cls = (to) => 'tabbar__container-item' + (route === to ? ' active' : '')

  return (
    <div className="tabbar__container">
      <div className={cls('/')} onClick={() => navigate('/')}>
        <Svg id="i-home" />
        <span>Beranda</span>
      </div>
      <div className={cls('/activity')} onClick={() => navigate('/activity')}>
        <Svg id="i-activity" />
        <span className="reddot" />
        <span>Aktivitas</span>
      </div>
      <div className={cls('/promotion')} onClick={() => navigate('/promotion')}>
        <Svg id="i-promo" />
        <span>Promosi</span>
      </div>
      <div className={cls('/main')} onClick={() => navigate('/main')}>
        <Svg id="i-account" />
        <span>Akun</span>
      </div>
    </div>
  )
}

export function Toast({ items }) {
  return items.map((t) => (
    <div key={t.id} className="van-toast van-toast--middle van-toast--text" style={{ zIndex: 4000 }}>
      <div className="van-toast__text">{t.msg}</div>
    </div>
  ))
}

export const Arrow = ({ right = true }) => (
  <i
    className="van-badge__wrapper van-icon van-icon-arrow"
    style={right ? { transform: 'rotate(180deg)' } : undefined}
  />
)
