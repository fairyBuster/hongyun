import React, { useCallback, useEffect, useState } from 'react'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Activity from './pages/Activity.jsx'
import Promotion from './pages/Promotion.jsx'
import Account from './pages/Account.jsx'
import Deposit from './pages/Deposit.jsx'
import Withdraw from './pages/Withdraw.jsx'
import Game from './pages/Game.jsx'
import { Toast } from './components/Chrome.jsx'
import { refCode } from './logic.js'

const KEY_USER = 'f55.user'
const KEY_BAL = 'f55.balance'
const KEY_BET = 'f55.bet'
const KEY_PROFILES = 'f55.profiles'
const KEY_REMEMBER = 'f55.remember'
const DEFAULT_AVATAR = '/assets/png/1-Cz2mt-nl.png'

const read = (k, def) => {
  try {
    const v = localStorage.getItem(k)
    return v === null ? def : JSON.parse(v)
  } catch {
    return def
  }
}

const saveProfiles = (profiles) => localStorage.setItem(KEY_PROFILES, JSON.stringify(profiles))

export default function App() {
  const [route, setRoute] = useState(() => (location.hash.replace(/^#/, '') || '/').split('?')[0])
  const [user, setUser] = useState(() => read(KEY_USER, null))
  const [balance, setBalance] = useState(() => read(KEY_BAL, 0))
  const [bet, setBet] = useState(() => read(KEY_BET, 1000))
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const onHash = () => setRoute((location.hash.replace(/^#/, '') || '/').split('?')[0])
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const guard = ['/', '/activity', '/promotion', '/main', '/wallet/Recharge', '/wallet/Withdraw']
    const isPrivate = guard.includes(route) || route.startsWith('/game/')
    if (!user && isPrivate) location.hash = '#/login'
    if (user && ['/login', '/register'].includes(route)) location.hash = '#/'
  }, [route, user])

  useEffect(() => localStorage.setItem(KEY_BAL, JSON.stringify(balance)), [balance])
  useEffect(() => localStorage.setItem(KEY_BET, JSON.stringify(bet)), [bet])

  /* simpan saldo per akun supaya tidak tercampur saat berganti akun */
  useEffect(() => {
    if (!user) return
    const profiles = read(KEY_PROFILES, {})
    profiles[user.phone] = { ...profiles[user.phone], balance }
    saveProfiles(profiles)
  }, [balance, user])

  const toast = useCallback((msg) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, msg }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200)
  }, [])

  const login = (id, remember = false) => {
    const profiles = read(KEY_PROFILES, {})
    const prof = profiles[id] || {}
    const u = {
      phone: id,
      nickname: prof.nickname || 'Member' + id.replace(/\D/g, '').slice(-4),
      uid: prof.uid || '2048' + id.replace(/\D/g, '').slice(-3),
      avatar: prof.avatar || DEFAULT_AVATAR,
      loginAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    }
    localStorage.setItem(KEY_USER, JSON.stringify(u))
    if (remember) localStorage.setItem(KEY_REMEMBER, JSON.stringify(id))
    else localStorage.removeItem(KEY_REMEMBER)
    setBalance(typeof prof.balance === 'number' ? prof.balance : 0)
    setUser(u)
    location.hash = '#/'
  }

  const register = (phone, invite = '') => {
    const profiles = read(KEY_PROFILES, {})
    let invited = ''
    if (!profiles[phone]) {
      const wanted = String(invite || '').trim().toUpperCase()
      if (wanted) {
        invited = Object.keys(profiles).find((k) => k !== phone && refCode(k) === wanted) || ''
      }
      profiles[phone] = {
        balance: 0,
        uid: '2048' + phone.replace(/\D/g, '').slice(-3),
        invitedBy: invited,
        joinedAt: Date.now(),
      }
      saveProfiles(profiles)
    }
    login(phone)
    toast(invited ? 'Pendaftaran berhasil · kode undangan diterima' : 'Pendaftaran berhasil')
  }

  const logout = () => {
    localStorage.removeItem(KEY_USER)
    setUser(null)
    location.hash = '#/login'
  }

  const updateUser = (patch) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      localStorage.setItem(KEY_USER, JSON.stringify(next))
      const profiles = read(KEY_PROFILES, {})
      profiles[prev.phone] = { ...profiles[prev.phone], ...patch }
      saveProfiles(profiles)
      return next
    })
  }

  const navigate = (to) => {
    location.hash = '#' + to
    window.scrollTo(0, 0)
  }

  const shared = { user, balance, setBalance, bet, setBet, toast, navigate, logout, updateUser }
  const r = route.replace(/\/$/, '') || '/'

  let page
  if (r === '/register') page = <Register onRegister={register} navigate={navigate} toast={toast} />
  else if (r === '/login') page = <Login onLogin={login} navigate={navigate} toast={toast} />
  else if (r.startsWith('/game/')) page = <Game id={r.slice(6)} {...shared} />
  else if (!user) page = <Login onLogin={login} navigate={navigate} toast={toast} />
  else if (r === '/activity') page = <Activity route={r} {...shared} />
  else if (r === '/promotion') page = <Promotion route={r} {...shared} />
  else if (r === '/main') page = <Account route={r} {...shared} />
  else if (r === '/wallet/Recharge') page = <Deposit {...shared} />
  else if (r === '/wallet/Withdraw') page = <Withdraw {...shared} />
  else page = <Home route={r} {...shared} />

  return (
    <>
      {page}
      <Toast items={toasts} />
    </>
  )
}
