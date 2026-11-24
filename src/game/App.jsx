import { useEffect, useMemo, useRef, useState } from 'react'
import {
  GAMES, REELS, ROWS, PAYABLE, SYMBOLS, CASCADE_MULT, pick, spinGrid, evaluate, cascadeDrop,
  countScatters, scatterReward, cascadeMult, fmt, short,
} from './ways'
import { sound } from './sound'
import { Coin, Icon, Modal, Num, Toggle } from './ui'

const BETS = [200, 500, 1000, 2500, 5000, 10000, 25000, 50000]
const SAVE =
  'mj.v2' +
  (() => {
    try {
      const u = new URLSearchParams(location.search).get('u')
      return u ? ':' + u : ''
    } catch {
      return ''
    }
  })()
const LINKED = SAVE !== 'mj.v2'
const DAILY_MS = 20 * 3600e3
const img = (g, s) => `/assets/${g}/${s}.png`
const multTxt = (v) => (v >= 10 ? fmt(Math.round(v)) : v.toFixed(2).replace('.', ','))
const PACKS = [
  { amount: 100000, label: 'Starter', tag: '×1' },
  { amount: 500000, label: 'Populer', tag: 'HOT' },
  { amount: 2500000, label: 'Mega', tag: 'BEST' },
  { amount: 10000000, label: 'Legend', tag: 'MAX' },
]
const EMPTY_STATS = { spins: 0, wins: 0, wagered: 0, won: 0, best: 0 }
const DAILY0 = { last: 0, streak: 0, day: '', spins: 0, wins: 0, fs: 0, claimed: [] }
const FS_SPINS = 10
const JP_BASE = 8500000
const JP_MIN = 250
const JP_NAMES = ['PEMAIN 88**', 'DEWI 77**', 'BOS 21**', 'SINTA 45**', 'AGUS 90**', 'LUCKY 12**', 'NUSA 63**', 'MIRA 55**', 'JAYA 38**', 'HOKI 09**']
/* isi layar game biar terasa rame: promo berjalan, banner event, kabar menang */
const PROMOS = [
  { tag: 'BONUS', text: 'MEMBER BARU 100%' },
  { tag: 'CASHBACK', text: 'MINGGUAN 5%' },
  { tag: 'EVENT', text: 'MAHJONG 10JT TIAP MINGGU' },
  { tag: 'DEPOSIT', text: 'PULSA TANPA POTONGAN' },
  { tag: 'JACKPOT', text: 'PROGRESIF MIN 250× BET' },
]
const DROPS0 = [
  { id: 1, name: 'DEWI 77**', mult: 2480, machine: 'MW 7' },
  { id: 2, name: 'AGUS 90**', mult: 1125, machine: 'MW 3' },
  { id: 3, name: 'MIRA 55**', mult: 860, machine: 'MW 12' },
]
const TICK_WINS = [
  { name: 'HOKI 09**', mult: 3120, machine: 'MAHJONG WAYS 7' },
  { name: 'JAYA 38**', mult: 1780, machine: 'MAHJONG WAYS 3' },
  { name: 'SINTA 45**', mult: 940, machine: 'MAHJONG WAYS 12' },
  { name: 'BOS 21**', mult: 2650, machine: 'MAHJONG WAYS 5' },
]
const MISSIONS = [
  { id: 'spin50', need: 50, stat: 'spins', label: 'Main 50 spin hari ini', reward: 30000 },
  { id: 'win15', need: 15, stat: 'wins', label: 'Menang di 15 spin', reward: 60000 },
  { id: 'fs3', need: 3, stat: 'fs', label: 'Picu 3× free spin (scatter)', reward: 120000 },
]
/* menu mengikuti HONGYUN: label + ikon icomoon portal (kecuali MAHJONG = tile) */
const PORTAL_MENU = [
  { label: 'HOME', href: '/portal/index.html', ico: 'home' },
  { label: 'MAHJONG', href: '#lobby', ico: 'tile', active: true },
  { label: 'TOGEL', href: '/portal/togel.html', ico: 'lottery' },
  { label: 'SPORT', href: '/portal/sport.html', ico: 'sports' },
  { label: 'SABUNG', href: '/portal/sabung.html', ico: 'sabung' },
  { label: 'PROMOSI', href: '/portal/promosi.html', ico: 'promo' },
  { label: 'EVENT', href: '/portal/event.html', ico: 'event' },
]
/* ikon tile MAHJONG sama persis dengan yang dipakai portal (mahjong-entry.js) */
const MAHJONG_TILE = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4.2" y="2.5" width="15.6" height="19" rx="3.2" />
    <circle cx="12" cy="12" r="4.2" />
    <path d="M8.4 6.4h.01M15.6 6.4h.01M8.4 17.6h.01M15.6 17.6h.01" />
  </svg>
)
const dayKey = (t = Date.now()) => {
  const d = new Date(t)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function load() {
  const fallback = { bal: LINKED ? 0 : 500000, bet: 2500, xp: 0, stats: EMPTY_STATS, daily: DAILY0, hist: [], sfx: true, music: true, turbo: false, jp: JP_BASE }
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE) || '{}')
    return {
      bal: Number(raw.bal) >= 0 ? Number(raw.bal) : fallback.bal,
      bet: BETS.includes(raw.bet) ? raw.bet : fallback.bet,
      xp: Number(raw.xp) || 0,
      stats: { ...EMPTY_STATS, ...(raw.stats || {}) },
      daily: { ...DAILY0, ...(raw.daily || {}) },
      hist: Array.isArray(raw.hist) ? raw.hist.slice(0, 30) : [],
      sfx: raw.sfx !== false,
      music: raw.music !== false,
      turbo: !!raw.turbo,
      jp: Number(raw.jp) >= 1000000 ? Number(raw.jp) : fallback.jp,
    }
  } catch { return fallback }
}

/* deep link: #game/mw1 · #game/mw1/{pay,auto,bet,buy} · #lobby/{bonus,shop,stats,settings} */
const HASH_MODAL = { bonus: 'daily', daily: 'daily', shop: 'shop', stats: 'stats', settings: 'settings', pay: 'pay', auto: 'auto', bet: 'bet', buy: 'buy' }
function parseHash() {
  const h = (typeof location !== 'undefined' ? location.hash : '').replace(/^#\/?/, '')
  const [a, b, c] = h.split('/')
  const scr = a === 'game' && GAMES[b] ? 'game' : 'lobby'
  const gid = GAMES[b] ? b : 'mw1'
  const modal = scr === 'game' ? HASH_MODAL[c] || null : HASH_MODAL[b] || null
  return { scr, gid, modal }
}

const xpNeed = (lv) => 60 + lv * 40
function levelInfo(xp) {
  let lv = 1
  let rest = Math.max(0, xp)
  while (rest >= xpNeed(lv) && lv < 99) { rest -= xpNeed(lv); lv++ }
  return { lv, cur: rest, need: xpNeed(lv) }
}

/* Ukuran panggung ingame, sama seperti referensi mahjong-wins2:
   desktop/lanskap = artboard tetap 1920x945 yang diskalakan penuh,
   HP portrait = kanvas 540 yang dipanjangkan sampai bawah layar. */
function measureFit() {
  const vv = typeof window !== 'undefined' ? window.visualViewport : null
  const vw = Math.round(vv ? vv.width : window.innerWidth)
  const vh = Math.round(vv ? vv.height : window.innerHeight)
  if (vw >= 900 && vw > vh) {
    return { s: Math.min(vw / 1920, vh / 945), w: 1920, h: 945, desk: true }
  }
  const byW = vw / 540
  /* ceil: lebih baik kelebihan <1px (kepotong) daripada kurang 1px (garis gap) */
  if (vh / byW >= 960) return { s: byW, w: 540, h: Math.ceil(vh / byW), desk: false }
  return { s: Math.min(byW, vh / 960), w: 540, h: 960, desk: false }
}

export default function App() {
  const init = useMemo(load, [])
  const boot = useMemo(parseHash, [])
  const [screen, setScreen] = useState(boot.scr)
  const [gid, setGid] = useState(boot.gid)
  const [bal, setBal] = useState(init.bal)
  const [bet, setBet] = useState(init.bet)
  const [xp, setXp] = useState(init.xp)
  const [stats, setStats] = useState(init.stats)
  const [daily, setDaily] = useState(init.daily)
  const [sfx, setSfx] = useState(init.sfx)
  const [music, setMusic] = useState(init.music)
  const [turbo, setTurbo] = useState(init.turbo)
  const [hist, setHist] = useState(init.hist)
  const [jp, setJp] = useState(init.jp)
  const [jpFeed, setJpFeed] = useState(null)
  const [now, setNow] = useState(Date.now())

  const [grid, setGrid] = useState(() => spinGrid(GAMES[boot.gid].weight))
  const [rolling, setRolling] = useState(() => Array(REELS).fill(false))
  const [winCells, setWinCells] = useState([])
  const [popCells, setPopCells] = useState([])
  const [win, setWin] = useState(0)
  const [chain, setChain] = useState(0)
  const [float, setFloat] = useState(null)
  const [fs, setFs] = useState({ left: 0, mult: 0, won: 0 })
  const [auto, setAuto] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [flashing, setFlashing] = useState(false)
  const [bigWin, setBigWin] = useState(null)
  const [prize, setPrize] = useState(null)
  const [bigAmt, setBigAmt] = useState(0)
  const [fsIntro, setFsIntro] = useState(null)
  const [fsSummary, setFsSummary] = useState(null)
  const [modal, setModal] = useState(boot.modal)
  const [toast, setToast] = useState(null)
  const [fit, setFit] = useState(measureFit)
  /* loading saat masuk mesin: preload aset + progress nyata */
  const [loading, setLoading] = useState(boot.scr === 'game')
  const [loadPct, setLoadPct] = useState(0)
  const [loadOut, setLoadOut] = useState(false)
  /* rame: daftar menang terakhir untuk papan informasi */
  const [drops, setDrops] = useState(DROPS0)

  const busy = useRef(false)
  const token = useRef(0)
  const autoRef = useRef(0)
  const autoTimer = useRef(0)
  const toastTimer = useRef(0)
  const prizeTimer = useRef(0)
  const skipRef = useRef(null)
  const spinRef = useRef(null)
  const listRef = useRef(null)
  const listTop = useRef(0)
  const prevLv = useRef(levelInfo(init.xp).lv)

  const G = GAMES[gid]
  const fsCost = Math.round(bet * G.buy)
  const lv = levelInfo(xp)
  const winSet = useMemo(() => new Set(winCells.map(([c, r]) => `${c}-${r}`)), [winCells])
  const popSet = useMemo(() => new Set(popCells.map(([c, r]) => `${c}-${r}`)), [popCells])
  const dailyReady = now - daily.last >= DAILY_MS
  const dailyAmount = 50000 + lv.lv * 15000
  const remain = Math.max(0, DAILY_MS - (now - daily.last))
  const countdown = `${Math.floor(remain / 3600e3)}j ${Math.floor(remain / 60e3) % 60}m`
  /* baris kabar berjalan di bawah layar game */
  const ticker = [
    { text: `1024 WAYS · CASCADE ×8 · FREE SPIN ×${G.fsMult} · RTP ±91%` },
    ...TICK_WINS,
    { text: `JACKPOT MIN ${JP_MIN}× BET · TARUHAN 200–50.000` },
  ]

  /* ---------------- efek global ---------------- */
  useEffect(() => {
    const measure = () => setFit(measureFit())
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)
    window.visualViewport?.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
      window.visualViewport?.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(SAVE, JSON.stringify({ bal, bet, xp, stats, daily, hist, sfx, music, turbo, jp }))
  }, [bal, bet, xp, stats, daily, hist, sfx, music, turbo, jp])

  useEffect(() => { sound.setMuted(!sfx) }, [sfx])
  useEffect(() => { sound.setMusic(music) }, [music])
  /* ticker jackpot: notifikasi pemenang lain biar terasa rame */
  useEffect(() => {
    if (screen !== 'game') { setJpFeed(null); return }
    let show = 0
    let hide = 0
    const tick = () => {
      const who = JP_NAMES[Math.floor(Math.random() * JP_NAMES.length)]
      setJpFeed({ id: Date.now(), name: who, amt: (6 + Math.floor(Math.random() * 60)) * 500000 })
      /* sekalian isi papan "menang terakhir" di desktop */
      setDrops((d) => [{ id: Date.now(), name: who, mult: 320 + Math.floor(Math.random() * 2600), machine: `MW ${1 + Math.floor(Math.random() * 20)}` }, ...d].slice(0, 3))
      hide = setTimeout(() => setJpFeed(null), 4200)
      show = setTimeout(tick, 16000 + Math.random() * 12000)
    }
    show = setTimeout(tick, 7000)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [screen])
  useEffect(() => {
    const target = screen === 'game' ? `#game/${gid}${modal ? '/' + modal : ''}` : `#lobby${modal ? '/' + modal : ''}`
    if (location.hash !== target) history.replaceState(null, '', target)
  }, [screen, gid, modal])
  useEffect(() => {
    const onHash = () => {
      const b = parseHash()
      token.current++
      busy.current = false
      autoRef.current = 0
      setAuto(0)
      clearTimeout(autoTimer.current)
      setScreen(b.scr)
      setGid(b.gid)
      setModal(b.modal)
      setWin(0); setWinCells([]); setPopCells([]); setChain(0); setFloat(null)
      setBigWin(null); setFsIntro(null); setFsSummary(null); setPrize(null)
      setFs({ left: 0, mult: 0, won: 0 })
      setLoadOut(false)
      setLoadPct(0)
      setLoading(b.scr === 'game')
      if (b.scr === 'game') setGrid(spinGrid(GAMES[b.gid].weight))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t) }, [])

  /* masuk mesin: preload ubin + sampul, tahan minimal 1 dtk biar tidak sekadar kedip */
  useEffect(() => {
    if (!loading) return
    let alive = true
    setLoadPct(0)
    setLoadOut(false)
    const urls = [`/assets/ui/tileface.png`, `/assets/covers/${gid}.jpg?v=2`, ...SYMBOLS.map((s) => img(gid, s))]
    let done = 0
    const hit = () => { if (alive) done += 1 }
    urls.forEach((u) => {
      let counted = false
      const bump = () => { if (counted) return; counted = true; hit() }
      const im = new Image()
      im.onload = bump
      im.onerror = bump
      im.src = u
      if (im.complete) bump()
    })
    const t0 = Date.now()
    let poll = 0
    const tick = () => {
      if (!alive) return
      const elapsed = Date.now() - t0
      /* gabungkan progres aset + waktu supaya bar tetap mulus walau aset dari cache */
      setLoadPct(Math.min(96, Math.round((done / urls.length) * 96), Math.round(elapsed / 10.4)))
      if (done >= urls.length && elapsed >= 1000) {
        setLoadPct(100)
        setTimeout(() => { if (alive) setLoadOut(true) }, 180)
        return
      }
      poll = setTimeout(tick, 80)
    }
    poll = setTimeout(tick, 100)
    return () => { alive = false; clearTimeout(poll) }
  }, [loading, gid])

  useEffect(() => {
    if (!loadOut) return
    const t = setTimeout(() => { setLoading(false); setLoadOut(false) }, 300)
    return () => clearTimeout(t)
  }, [loadOut])
  // balik dari game: daftar mesin tetap di posisi scroll terakhir
  useEffect(() => {
    const el = listRef.current
    if (screen !== 'lobby' || !el) return
    el.scrollTop = listTop.current
  }, [screen])
  useEffect(() => {
    if (lv.lv > prevLv.current) {
      prevLv.current = lv.lv
      sound.level()
      toastMsg(`NAIK LEVEL ${lv.lv}`, 'gold')
    }
  }, [lv.lv])

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Escape') {
        if (modal) setModal(null)
        else if (screen === 'game') goLobby()
      }
      if (e.code === 'Space' && screen === 'game' && !modal && !loading) {
        e.preventDefault()
        spinRef.current?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, modal, loading])

  useEffect(() => () => {
    clearTimeout(autoTimer.current)
    clearTimeout(toastTimer.current)
  }, [])

  /* ---------------- helper ---------------- */
  function toastMsg(text, kind = 'info') {
    setToast({ text, kind, id: Date.now() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2300)
  }

  function waitClickable(ms) {
    return new Promise((resolve) => {
      let done = false
      const fin = () => { if (done) return; done = true; skipRef.current = null; resolve() }
      skipRef.current = fin
      setTimeout(fin, ms)
    })
  }
  const skipNow = () => skipRef.current?.()

  function openGame(id) {
    token.current++
    busy.current = false
    autoRef.current = 0
    setAuto(0)
    clearTimeout(autoTimer.current)
    setGid(id)
    setScreen('game')
    setGrid(spinGrid(GAMES[id].weight))
    setWin(0); setWinCells([]); setPopCells([]); setChain(0); setFloat(null)
    setRolling(Array(REELS).fill(false))
    setFs({ left: 0, mult: 0, won: 0 })
    setBigWin(null); setFsIntro(null); setFsSummary(null); setModal(null)
    setPrize(null)
    setLoadPct(0)
    setLoadOut(false)
    setLoading(true)
    sound.unlock()
    sound.click()
  }

  function goLobby() {
    /* dibuka di dalam iframe app induk: LOBI keluar lewat router app induk */
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'f55:exit' }, '*')
      return
    }
    token.current++
    busy.current = false
    autoRef.current = 0
    setAuto(0)
    clearTimeout(autoTimer.current)
    setScreen('lobby')
    setModal(null); setBigWin(null); setFsIntro(null); setFsSummary(null); setPrize(null)
    setWin(0); setWinCells([]); setPopCells([]); setChain(0); setFloat(null)
    setLoading(false); setLoadOut(false)
    sound.click()
  }

  function changeBet(d) {
    if (busy.current) return
    const i = BETS.indexOf(bet)
    const n = BETS[Math.min(BETS.length - 1, Math.max(0, i + d))]
    if (n !== bet) { setBet(n); sound.bet() }
  }

  function startAuto(n) {
    setModal(null)
    autoRef.current = n
    setAuto(n)
    if (!busy.current) spinRef.current?.()
  }

  function stopAuto() {
    autoRef.current = 0
    setAuto(0)
    clearTimeout(autoTimer.current)
    sound.click()
  }

  /* ---------------- beli free spin ---------------- */
  async function buyFreeSpins() {
    if (busy.current || fs.left > 0) return
    const cost = Math.round(bet * G.buy)
    if (bal < cost) {
      sound.error()
      toastMsg('Saldo kurang untuk beli free spin')
      setModal('shop')
      return
    }
    token.current++
    busy.current = true
    setModal(null)
    setBal((b) => b - cost)
    setStats((s) => ({ ...s, wagered: s.wagered + cost }))
    setWin(0); setWinCells([]); setPopCells([]); setFloat(null); setChain(0)
    setGrid(spinGrid(G.weight))
    setFs({ left: FS_SPINS, mult: G.fsMult, won: 0 })
    setFsIntro({ spins: FS_SPINS, mult: G.fsMult, kind: 'BUY' })
    sound.fs()
    await waitClickable(1800)
    setFsIntro(null)
    busy.current = false
    autoRef.current = FS_SPINS
    setAuto(FS_SPINS)
    spinRef.current?.()
  }

  /* ---------------- spin ---------------- */
  async function doSpin() {
    if (busy.current || screen !== 'game' || loading) return
    const free = fs.left > 0
    if (!free && bal < bet) {
      sound.error()
      toastMsg('Saldo kurang — klaim bonus dulu')
      autoRef.current = 0
      setAuto(0)
      setModal('daily')
      return
    }

    busy.current = true
    setSpinning(true)
    const my = ++token.current
    const fast = turbo
    const wait = (ms) => new Promise((r) => setTimeout(r, fast ? Math.max(80, ms * 0.55) : ms))
    const alive = () => my === token.current
    const fsLeftBefore = fs.left
    const fsMult = free ? fs.mult : 1
    const fsWonBefore = fs.won
    const price = bet
    const pool = jp

    setWin(0); setWinCells([]); setPopCells([]); setFloat(null); setChain(0); setFlashing(false)
    clearTimeout(prizeTimer.current)
    setPrize((p) => (p && p.kind === 'win' ? null : p))
    setFs((f) => (free ? { ...f, left: Math.max(0, f.left - 1) } : f))
    if (!free) setBal((b) => Math.max(0, b - bet))
    if (!free) setJp((p) => p + Math.max(1, Math.round(price * 0.04)))
    sound.unlock()
    sound.spin()

    try {
      const final = spinGrid(G.weight)
      const scatterCount = countScatters(final)
      const firstThree = final.slice(0, 3).flat().filter((s) => s === 'scatter').length
      const anticipate = scatterCount >= 3 && firstThree >= 2

      for (let c = 0; c < REELS; c++) {
        if (!alive()) return
        setRolling((r) => r.map((v, i) => (i === c ? true : v)))
        const iv = setInterval(() => {
          setGrid((g) => g.map((col, ci) => (ci === c
            ? Array.from({ length: ROWS }, () => pick(G.weight))
            : col)))
          sound.reel(c)
        }, 70)
        let d = [300, 360, 420, 480, 560][c]
        if (anticipate && c === 3) d += 650
        if (anticipate && c === 4) d += 1200
        await wait(d)
        clearInterval(iv)
        if (!alive()) return
        setGrid((g) => g.map((col, ci) => (ci === c ? final[c] : col)))
        setRolling((r) => r.map((v, i) => (i === c ? false : v)))
        sound.stop(c)
        if (anticipate && c === 2) {
          setFlashing(true)
          sound.anticipate()
        }
      }
      await wait(140)
      if (!alive()) return
      setFlashing(false)

      // ---- cascade ----
      let g = final
      let step = 0
      let round = 0
      while (step < 8 && alive()) {
        const res = evaluate(g, G.pays, price / 20, G.scale)
        if (!res.wins.length) break
        const mult = cascadeMult(step) * (free ? fsMult : 1)
        const amount = res.total * mult
        round += amount
        const cells = [...new Map(res.wins
          .flatMap((w) => w.cells)
          .map(([c, r]) => [`${c}-${r}`, [c, r]])).values()]
        const lead = res.wins.reduce((a, b) => (b.pay > a.pay ? b : a))
        const [fc, fr] = lead.cells[Math.floor(lead.cells.length / 2)]

        setWin(Math.round(round))
        setWinCells(cells)
        setChain(step + 1)
        setFloat({
          id: `${my}-${step}`,
          left: `${((fc + 0.5) / REELS) * 100}%`,
          top: `${((fr + 0.5) / ROWS) * 100}%`,
          amount: Math.round(amount),
          ways: lead.ways,
        })
        sound.win(step, amount >= price * 6)
        await wait(step === 0 ? 560 : 460)
        if (!alive()) return
        setPopCells(cells)
        setWinCells([])
        sound.pop()
        await wait(250)
        if (!alive()) return
        g = cascadeDrop(g, cells, G.weight)
        setGrid(g)
        setPopCells([])
        sound.drop()
        await wait(230)
        step++
      }

      const won = Math.round(round)
      const jackpot = won >= price * JP_MIN
      const total = won + (jackpot ? pool : 0)
      if (jackpot) setJp(JP_BASE)
      const fsWonAfter = fsWonBefore + (free ? total : 0)
      const reward = scatterReward(scatterCount)

      setWinCells([]); setPopCells([]); setChain(0); setWin(total)
      if (free && total > 0) setFs((f) => ({ ...f, won: f.won + total }))
      setBal((b) => b + total)
      setXp((x) => x + 1 + Math.floor(price / 2000))
      setStats((s) => ({
        spins: s.spins + 1,
        wins: s.wins + (total > 0 ? 1 : 0),
        wagered: s.wagered + (free ? 0 : price),
        won: s.won + total,
        best: Math.max(s.best, total),
      }))
      setHist((h) => [{ t: Date.now(), g: gid, bet: price, win: total }, ...h].slice(0, 30))
      const today = dayKey()
      setDaily((d) => {
        const base = d.day === today ? d : { ...d, day: today, spins: 0, wins: 0, fs: 0, claimed: [] }
        return {
          ...base,
          spins: base.spins + 1,
          wins: base.wins + (total > 0 ? 1 : 0),
          fs: base.fs + (reward ? 1 : 0),
        }
      })

      if (total > 0) sound.coin()
      const tier = jackpot ? 'JACKPOT' : total >= price * 100 ? 'SUPER' : total >= price * 40 ? 'MEGA' : total >= price * 15 ? 'BIG' : null
      if (tier) {
        setBigWin({ tier, amount: total, won, pool: jackpot ? pool : 0 })
        setBigAmt(0)
        if (jackpot) sound.jackpot()
        else sound.big()
        for (let i = 1; i <= 20; i++) {
          setBigAmt(Math.round((total * i) / 20))
          await wait(45)
        }
        await waitClickable(tier === 'JACKPOT' ? 3600 : tier === 'SUPER' ? 3000 : 2400)
        setBigWin(null)
        sound.click()
      }
      if (!alive()) return

      if (!tier && total > 0 && !reward && !(free && fsLeftBefore === 1)) {
        showPrize({
          kind: 'win', kicker: 'TOTAL MENANG', amount: total,
          sub: `×${multTxt(total / price)} dari taruhan`,
        }, 1500)
      }

      if (reward) {
        const nextMult = free ? Math.min(10, fsMult * 2) : G.fsMult
        setFs((f) => ({ ...f, left: f.left + reward.spins, mult: nextMult }))
        setFsIntro({ spins: reward.spins, mult: nextMult, kind: reward.kind })
        sound.fs()
        await waitClickable(2200)
        setFsIntro(null)
        if (!alive()) return
      }

      if (free && fsLeftBefore === 1 && !reward) {
        setFsSummary({ amount: fsWonAfter })
        setFs({ left: 0, mult: 0, won: 0 })
        autoRef.current = 0
        setAuto(0)
        clearTimeout(autoTimer.current)
      }
    } finally {
      if (my === token.current) {
        busy.current = false
        setSpinning(false)
        const left = Math.max(0, autoRef.current - 1)
        autoRef.current = left
        setAuto(left)
        if (left > 0) autoTimer.current = setTimeout(() => spinRef.current?.(), 520)
      }
    }
  }
  spinRef.current = doSpin

  /* ---------------- bonus ---------------- */
  function showPrize(p, ms = 2800) {
    clearTimeout(prizeTimer.current)
    setPrize({ id: Date.now(), ...p })
    prizeTimer.current = setTimeout(() => setPrize(null), ms)
  }

  function claimDaily() {
    if (!dailyReady) return
    const t = Date.now()
    const streak = t - daily.last < 48 * 3600e3 ? daily.streak + 1 : 1
    setBal((b) => b + dailyAmount)
    setDaily({ last: t, streak })
    setNow(t)
    sound.coin()
    sound.level()
    showPrize({
      kind: 'claim', kicker: 'HADIAH DIKLAIM', title: 'BONUS HARIAN',
      amount: dailyAmount, sub: `Streak ${streak} hari · masuk ke saldo`,
    }, 3200)
  }

  function claimMission(m) {
    const fresh = daily.day === dayKey()
    if (!fresh || (daily.claimed || []).includes(m.id) || (daily[m.stat] || 0) < m.need) return
    setDaily((d) => ({ ...d, claimed: [...(d.claimed || []), m.id] }))
    setBal((b) => b + m.reward)
    setXp((x) => x + 15)
    sound.coin()
    sound.level()
    showPrize({
      kind: 'claim', kicker: 'MISI SELESAI', title: 'HADIAH MISI',
      amount: m.reward, sub: m.label + ' · masuk ke saldo',
    }, 3000)
  }

  function buyPack(amount) {
    setBal((b) => b + amount)
    sound.coin()
    showPrize({
      kind: 'claim', kicker: 'KOIN MASUK', title: 'TOKO KOIN',
      amount, sub: 'Paket demo ditambahkan ke saldo',
    }, 2600)
  }

  function resetAll() {
    if (!window.confirm('Reset saldo, level, dan statistik? Tindakan ini tidak bisa dibatalkan.')) return
    localStorage.removeItem(SAVE)
    setBal(LINKED ? 0 : 500000); setBet(2500); setXp(0); setStats(EMPTY_STATS)
    setDaily({ ...DAILY0 }); setHist([]); setModal(null)
    setJp(JP_BASE); setJpFeed(null)
    prevLv.current = 1
    toastMsg('Progres direset')
  }

  /* ---------------- potongan UI ---------------- */
  const levelPct = Math.min(100, Math.round((lv.cur / lv.need) * 100))
  const dayOk = daily.day === dayKey(now)
  const dstat = (k) => (dayOk ? daily[k] || 0 : 0)
  const isClaimed = (id) => dayOk && (daily.claimed || []).includes(id)

  function renderPayTable() {
    return (
      <div className="pay">
        <div className="payHead"><span>SIMBOL</span><span>3</span><span>4</span><span>5</span></div>
        <div className="payList">
          {PAYABLE.slice().reverse().map((s) => (
            <div className="payRow" key={s}>
              <span className="payIco"><img src={img(G.id, s)} alt="" /></span>
              <b>{G.pays[s][0]}</b><b>{G.pays[s][1]}</b><b>{G.pays[s][2]}</b>
            </div>
          ))}
          <div className="payRow scatter">
            <span className="payIco"><img src={img(G.id, 'scatter')} alt="" /></span>
            <span className="payNote">3+ scatter = 10 / 12 / 15 free spin</span>
          </div>
        </div>
        <ul className="rules">
          <li>Grid <b>5 × 4 = 1024 ways</b>. Bayar dari reel paling kiri, minimal 3 reel berurutan.</li>
          <li>Nilai di atas <b>per ways</b> (koin). Total = nilai × jumlah ways.</li>
          <li>Simbol menang <b>meledak</b>, simbol di atasnya jatuh — bisa menang berulang (cascade).</li>
          <li>Multiplier cascade: <b>1× · 2× · 3× · 5× · 8×</b>.</li>
          <li><b>Wild</b> menggantikan semua simbol kecuali scatter.</li>
          <li>Free spin memberi multiplier <b>×{G.fsMult}</b>; retrigger menggandakannya (maks ×10).</li>
          <li><b>Beli free spin</b> kapan saja ({G.buy}× taruhan, RTP ±93%) — 10 spin dengan multiplier langsung.</li>
          <li><b>Jackpot progresif</b>: pool naik tiap spin berbayar. Menang ≥ {JP_MIN}× taruhan dalam satu spin = seluruh pool dibayar.</li>
          <li>RTP base ±91% (simulasi 120 ribu spin, di luar jackpot). Bukan uang asli.</li>
        </ul>
      </div>
    )
  }

  function renderModals() {
    return (
      <>
        <Modal open={modal === 'pay'} onClose={() => setModal(null)} title={`PAY TABLE · ${G.name}`} accent="#ffd700" wide>
          {renderPayTable()}
        </Modal>

        <Modal open={modal === 'auto'} onClose={() => setModal(null)} title="AUTO SPIN" accent="#ffd700">
          <div className="autoGrid">
            {[10, 25, 50, 100].map((n) => (
              <button key={n} onClick={() => startAuto(n)}><b>{n}</b><span>SPIN</span></button>
            ))}
          </div>
          <p className="hint">Auto berhenti saat saldo habis, free spin selesai, atau kamu tekan STOP.</p>
        </Modal>

        <Modal open={modal === 'bet'} onClose={() => setModal(null)} title="PILIH TARUHAN" accent="#ffd700">
          <div className="betGrid">
            {BETS.map((b) => (
              <button key={b} className={b === bet ? 'on' : ''}
                onClick={() => { setBet(b); setModal(null); sound.bet() }}>
                <b>{short(b)}</b><span>{fmt(b)}</span>
              </button>
            ))}
          </div>
          <p className="hint">Taruhan dipotong tiap spin. Free spin tidak memotong saldo.</p>
        </Modal>

        <Modal open={modal === 'buy'} onClose={() => setModal(null)} title="BELI FREE SPIN" accent="#ffd700">
          <div className="buyBox">
            <span className="eyebrow">PAKET BONUS</span>
            <b className="buyNum">{FS_SPINS}<i>SPIN</i></b>
            <div className="buySpec">
              <div><span>MULTIPLIER</span><b>×{G.fsMult}</b></div>
              <div><span>HARGA</span><b>{short(fsCost)}</b></div>
              <div><span>RTP</span><b>±93%</b></div>
            </div>
            <p className="hint">Langsung main {FS_SPINS} free spin dengan multiplier ×{G.fsMult}.
              Saldo kamu {short(bal)} · taruhan {short(bet)}.</p>
            <button className={`claimBtn${bal < fsCost ? ' off' : ''}`} onClick={bal < fsCost ? () => setModal('shop') : buyFreeSpins}>
              {bal < fsCost ? 'TAMBAH KOIN DULU' : `BELI · ${short(fsCost)}`}
            </button>
          </div>
        </Modal>

        <Modal open={modal === 'daily'} onClose={() => setModal(null)} title="BONUS HARIAN" accent="#ffd700">
          <div className="dailyBox">
            <div className="giftWrap">
              <Icon name="gift" size={52} />
            </div>
            <span className="eyebrow">{dailyReady ? 'SIAP DIKLAIM' : 'SUDAH DIKLAIM'}</span>
            <b className="dailyAmt">+{fmt(dailyAmount)}</b>
            <p className="hint">Streak <b>{daily.streak}</b> hari · klaim lagi dalam 20 jam<br />
              {dailyReady ? 'Bonus naik seiring level kamu.' : `Tersedia lagi dalam ${countdown}.`}</p>
            <button className={`claimBtn${dailyReady ? '' : ' off'}`} onClick={claimDaily} disabled={!dailyReady}>
              {dailyReady ? 'KLAIM SEKARANG' : 'TUNGGU DULU'}
            </button>
          </div>

          <div className="misList">
            <div className="misHead"><span>MISI HARIAN</span><em>reset tiap hari</em></div>
            {MISSIONS.map((m) => {
              const v = Math.min(m.need, dstat(m.stat))
              const done = v >= m.need
              const got = isClaimed(m.id)
              return (
                <div className={`misRow${got ? ' got' : ''}`} key={m.id}>
                  <div className="misTxt">
                    <b>{m.label}</b>
                    <span className="misBar"><i style={{ width: `${(v / m.need) * 100}%` }} /></span>
                    <em>{v}/{m.need}</em>
                  </div>
                  <button className="misBtn" disabled={!done || got} onClick={() => claimMission(m)}>
                    {got ? 'SELESAI' : `+${short(m.reward)}`}
                  </button>
                </div>
              )
            })}
          </div>
        </Modal>

        <Modal open={modal === 'shop'} onClose={() => setModal(null)} title="TOKO KOIN · DEMO" accent="#ffd700" wide>
          <div className="packs">
            {PACKS.map((p) => (
              <button className="pack" key={p.amount} onClick={() => buyPack(p.amount)}>
                <i className="packTag">{p.tag}</i>
                <span className="packCoins">
                  <Coin size={20} /><Coin size={30} /><Coin size={20} />
                </span>
                <b>{short(p.amount)}</b>
                <span>{p.label}</span>
                <em>GRATIS</em>
              </button>
            ))}
          </div>
          <p className="hint">Semua paket gratis — ini demo, tidak ada transaksi uang asli.</p>
        </Modal>

        <Modal open={modal === 'stats'} onClose={() => setModal(null)} title="STATISTIK" accent="#ffd700" wide>
          <div className="lvlRow">
            <span>LEVEL {lv.lv}</span>
            <div className="xpTrack"><i style={{ width: `${levelPct}%` }} /></div>
            <b>{lv.cur}/{lv.need}</b>
          </div>
          <div className="statGrid">
            <div><span>TOTAL SPIN</span><b>{fmt(stats.spins)}</b></div>
            <div><span>WIN RATE</span><b>{stats.spins ? Math.round((stats.wins / stats.spins) * 100) : 0}%</b></div>
            <div><span>TOTAL MENANG</span><b>{short(stats.won)}</b></div>
            <div><span>MENANG TERBESAR</span><b>{short(stats.best)}</b></div>
            <div><span>TOTAL TARUHAN</span><b>{short(stats.wagered)}</b></div>
            <div><span>RTP KAMU</span><b>{stats.wagered ? ((stats.won / stats.wagered) * 100).toFixed(1) : '0'}%</b></div>
          </div>
          <p className="hint">Statistik tersimpan di browser ini (localStorage).</p>

          <div className="histBox">
            <div className="histHead"><span>RIWAYAT SPIN</span><em>{hist.length} terakhir</em></div>
            {hist.length === 0 && <p className="hint">Belum ada spin.</p>}
            {hist.slice(0, 10).map((h, i) => (
              <div className="histRow" key={h.t + '-' + i}>
                <i>{GAMES[h.g] ? GAMES[h.g].tag : '—'}</i>
                <span>{new Date(h.t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                <em>{short(h.bet)}</em>
                <b className={h.win > 0 ? 'on' : ''}>{h.win > 0 ? '+' + short(h.win) : '·'}</b>
              </div>
            ))}
          </div>
        </Modal>

        <Modal open={modal === 'settings'} onClose={() => setModal(null)} title="SETELAN" accent="#ffd700">
          <div className="setRow">
            <span><b>Efek suara</b><em>SFX sintetis WebAudio</em></span>
            <Toggle on={sfx} onChange={() => { setSfx((v) => !v); sound.click() }} />
          </div>
          <div className="setRow">
            <span><b>Musik</b><em>Ambience pentatonik (loop)</em></span>
            <Toggle on={music} onChange={() => { setMusic((v) => !v); sound.click() }} />
          </div>
          <div className="setRow">
            <span><b>Turbo</b><em>Animasi & auto lebih cepat</em></span>
            <Toggle on={turbo} onChange={() => { setTurbo((v) => !v); sound.click() }} />
          </div>
          <button className="dangerBtn" onClick={resetAll}><Icon name="refresh" size={15} /> RESET PROGRES</button>
          <p className="hint">Aset: Vita Mahjong 3.46.1 (hasil rip). Engine 1024 ways, paytable demo — bukan uang asli.</p>
        </Modal>

        {/* tombol menu di kabinet (296,839) membuka navigasi cepat */}
        <Modal open={modal === 'menu'} onClose={() => setModal(null)} title="MENU CEPAT" accent="#ffd700">
          <div className="menuGrid">
            <button onClick={() => setModal(null)}><Icon name="play" size={16} /><b>LANJUT MAIN</b></button>
            <button onClick={goLobby}><Icon name="back" size={16} /><b>KEMBALI KE LOBI</b></button>
            <button onClick={() => setModal('bet')}><Icon name="sliders" size={16} /><b>UBAH TARUHAN</b></button>
            <button onClick={() => setModal('pay')}><Icon name="info" size={16} /><b>INFO &amp; PAYTABLE</b></button>
            <button onClick={() => setModal('buy')}><Icon name="star" size={16} /><b>BELI FREE SPIN</b></button>
            <button onClick={() => setModal('shop')}><Icon name="shop" size={16} /><b>TOKO KOIN</b></button>
            <button onClick={() => setModal('daily')}><Icon name="gift" size={16} /><b>BONUS HARIAN</b></button>
            <button onClick={() => setModal('settings')}><Icon name="sliders" size={16} /><b>SETELAN</b></button>
            <button onClick={() => {
              if (window.parent !== window) window.parent.postMessage({ type: 'f55:go', to: '/promotion' }, '*')
              else location.href = '/#/promotion'
            }}><Icon name="star" size={16} /><b>PROMOSI</b></button>
          </div>
          <p className="hint">Semua mesin memakai kabinet yang sama: 1024 ways, cascade ×8, free spin.</p>
        </Modal>
      </>
    )
  }

  function renderPrize() {
    if (!prize || bigWin || fsIntro) return null
    const win = prize.kind === 'win'
    return (
      <div key={prize.id} className={`prizeOverlay${win ? ' win' : ''}`}
        onClick={win ? undefined : () => { clearTimeout(prizeTimer.current); setPrize(null) }}>
        <div className="prizeCard">
          {!win && <span className="prizeGift"><Icon name="gift" size={26} /></span>}
          <span className="prizeKicker">{prize.kicker}</span>
          {prize.title && <b className="prizeTitle">{prize.title}</b>}
          <b className="prizeAmt">+{fmt(prize.amount)}</b>
          {prize.sub && <span className="prizeSub">{prize.sub}</span>}
          {!win && <span className="prizeTap">KETUK UNTUK LANJUT</span>}
        </div>
      </div>
    )
  }

  const stageStyle = { width: fit.w, height: fit.h, transform: `translate(-50%,-50%) scale(${fit.s})` }

  /* ---------------- LOBBY (desain HONGYUN) ---------------- */
  if (screen === 'lobby') {
    const list = Object.values(GAMES)
    return (
      <div className="lp">
        {/* urutan sama dengan portal: marquee teal -> header -> konten */}
        <div className="lp-mq-bar">
          <div className="lp-mq">
            <em className="lp-mq-tag"><Icon name="sound" size={12} /> INFO</em>
            <div className="lp-mq-mask">
              <div className="lp-mq-track">
                <span>MAHJONG WAYS × HONGYUN — 20 MESIN 1024 WAYS · MAINKAN GRATIS TANPA DEPOSIT · JACKPOT DEMO BERJALAN TIAP SPIN · ASET HASIL RIP VITA MAHJONG 3.46.1</span>
                <span aria-hidden="true">MAHJONG WAYS × HONGYUN — 20 MESIN 1024 WAYS · MAINKAN GRATIS TANPA DEPOSIT · JACKPOT DEMO BERJALAN TIAP SPIN · ASET HASIL RIP VITA MAHJONG 3.46.1</span>
              </div>
            </div>
          </div>
          <div className="lp-acct">
            <button className="lp-bal" onClick={() => setModal('shop')} aria-label="Tambah koin">
              <Coin size={14} />
              <Num value={bal} />
              <i><Icon name="plus" size={10} /></i>
            </button>
            <span className="lp-lv">LV {lv.lv}</span>
            <div className="lp-tools">
              <button className={`lp-tool bonus${dailyReady ? ' hasDot' : ''}`} onClick={() => setModal('daily')}>BONUS<i className="dot" /></button>
              <button className="lp-tool toko" onClick={() => setModal('shop')}>TOKO</button>
              <button className="lp-tool" onClick={() => setModal('stats')}>STATISTIK</button>
              <button className="lp-tool" onClick={() => setModal('settings')}>SETELAN</button>
            </div>
          </div>
        </div>

        <header className="lp-head">
          <div className="lp-head-in">
            <a className="lp-logo" href="/portal/index.html" aria-label="HONGYUN">
              <img src="/portal/images/logoweb.png" alt="HONGYUN" />
            </a>
            <nav className="lp-menu" aria-label="Menu HONGYUN">
              {PORTAL_MENU.map((m) => (
                <a key={m.label} href={m.href} className={`lp-mi${m.active ? ' on' : ''}`} aria-current={m.active ? 'page' : undefined}>
                  {m.ico === 'tile' ? <span className="lp-tile">{MAHJONG_TILE}</span> : <i className={`lp-mico lp-mico-${m.ico}`} />}
                  <label>{m.label}</label>
                </a>
              ))}
            </nav>
          </div>
        </header>

        {/* hero + shelf memakai kelas .mjx-* yang sama dengan portal (mahjong-entry.css) */}
        <div className="mjx-card">
          <div className="mjx-art">
            <img src="/assets/ui/hero-mahjong.jpg?v=1" alt="Mahjong Ways" width="196" height="168" decoding="async" />
          </div>
          <div className="mjx-copy">
            <span className="mjx-kicker">SLOT DEMO · 1024 WAYS</span>
            <h1 className="mjx-title">MAHJONG <b>WAYS</b></h1>
            <p className="mjx-sub">20 mesin, cascade sampai ×8, free spin sampai ×10. Tanpa uang asli.</p>
            <span className="lp-jp-line">JACKPOT <b><Num value={jp} /></b> <em>MIN {JP_MIN}× BET</em></span>
            <button type="button" className="mjx-cta" onClick={() => openGame('mw1')}>MAIN SEKARANG <span>→</span></button>
          </div>
          <span className="mjx-badge">DEMO</span>
        </div>

        <div className="lp-banner">
          <img src="/mahjong2.webp" alt="Banner Mahjong Ways" decoding="async" />
        </div>

        <div className="mjx-shelf lp-shelf" id="mesin">
          <header className="mjx-shelf-head">
            <div>
              <span className="mjx-kicker">SLOT DEMO · 20 MESIN</span>
              <h2 className="mjx-shelf-title">MAHJONG <b>WAYS</b></h2>
            </div>
            <button type="button" className="mjx-shelf-link" onClick={() => openGame('mw1')}>MAIN SEKARANG <span>→</span></button>
          </header>
          <div className="mjx-grid">
            {list.map((g) => (
              <button type="button" className="mjx-game" key={g.id} onClick={() => openGame(g.id)} aria-label={`${g.name} — ${g.sub}`}>
                <span className="mjx-cover">
                  <img src={`/assets/covers/${g.id}.jpg?v=2`} alt="" loading="lazy" decoding="async" />
                  <i className="mjx-ribbon">{g.tag}</i>
                  <i className="lp-badge1024">1024</i>
                </span>
                <span className="mjx-meta"><b>{g.name}</b><small>{g.sub}</small></span>
              </button>
            ))}
          </div>
          <p className="mjx-shelf-note">1024 ways · cascade sampai ×8 · free spin sampai ×10 · tanpa uang asli</p>
        </div>

        <div className="lp-help">
          <ul>
            <li><a href="/portal/promosi.html">PROMOSI</a></li>
            <li><a href="/portal/event.html">EVENT</a></li>
            <li><a href="/portal/togel.html">TOGEL</a></li>
            <li><a href="/portal/sport.html">SPORT</a></li>
            <li><a href="/portal/sabung.html">SABUNG</a></li>
            <li><a href="/portal/register.html">DAFTAR</a></li>
          </ul>
        </div>

        <footer className="lp-foot">
          <div className="lp-foot-guides">
            <img src="/portal/img.viva88athenae.com/assets/guidelines.png" alt="Panduan HONGYUN" width="640" />
          </div>
          <div className="lp-foot-prov">
            <img src="/portal/img.viva88athenae.com/assets/provider.png" alt="Bank dan e-wallet" />
          </div>
          <div className="lp-foot-group">
            <div className="lp-foot-copy">
              <span>&copy; 2015 - 2026 Copyright HONGYUN.</span>
              <span>All Rights Reserved.</span>
            </div>
            <div className="lp-foot-links">
              <a className="lp-foot-btn" href="/portal/index.html">PORTAL</a>
              <a className="lp-foot-btn" href="/portal/register.html">DAFTAR</a>
            </div>
          </div>
        </footer>

        <nav className="lp-tabs" aria-label="Menu cepat">
          <button onClick={() => setModal('daily')}>
            <span><Icon name="gift" size={20} />{dailyReady && <i className="dot" />}</span><b>BONUS</b>
          </button>
          <button onClick={() => setModal('shop')}><span><Icon name="shop" size={20} /></span><b>TOKO</b></button>
          <button onClick={() => setModal('stats')}><span><Icon name="chart" size={20} /></span><b>STATISTIK</b></button>
          <button onClick={() => setModal('settings')}><span><Icon name="sliders" size={20} /></span><b>SETELAN</b></button>
        </nav>

        {renderModals()}
        {renderPrize()}
        {toast && <div key={toast.id} className={`toast ${toast.kind}`}>{toast.text}</div>}
      </div>
    )
  }

  /* ---------------- SLOT: kabinet ala Mahjong Wins 2 ---------------- */
  const clockTxt = (() => {
    const d = new Date(now)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  })()

  /* ubin dipakai bersama oleh layout desktop & portrait */
  const tiles = grid.map((col, c) => (
    <div className={`mw2col${rolling[c] ? ' roll' : ''}`} key={c}>
      {col.map((s, r) => {
        const k = `${c}-${r}`
        return (
          <div className={`mw2tile${s === 'scatter' ? ' sc' : ''}${s === 'wild' ? ' wl' : ''}${winSet.has(k) ? ' win' : ''}${popSet.has(k) ? ' pop' : ''}`} key={r}>
            <img src={img(G.id, s)} alt="" draggable="false" />
          </div>
        )
      })}
    </div>
  ))

  const winFloat = float && (
    <span key={float.id} className="mw2float" style={{ left: float.left, top: float.top }}>
      +{fmt(float.amount)}<i>{float.ways} ways</i>
    </span>
  )

  const spinArrows = (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <g fill="none" stroke="#fff" strokeWidth="14">
        <path d="M26.2 47.7 A36 36 0 0 1 93.8 47.7" />
        <path d="M93.8 72.3 A36 36 0 0 1 26.2 72.3" />
      </g>
      <g fill="#fff">
        <path d="M99.6 63.7 L106 43.3 L81.6 52.1 Z" />
        <path d="M20.4 56.3 L14 76.7 L38.4 68 Z" />
      </g>
    </svg>
  )

  /* langkah cascade yang sedang berjalan: x1 -> x2 -> x3 -> x5 -> x8 */
  const stepMult = CASCADE_MULT[Math.min(chain, CASCADE_MULT.length - 1)]

  /* overlay sengaja di luar stage supaya modal/toast tidak ikut diskalakan */
  const overlays = (
    <>
      {loading && (
        <div className={`gLoad${loadOut ? ' out' : ''}`} role="status" aria-live="polite"
          onClick={() => setLoadOut(true)}>
          <div className="gLoadInner">
            <div className="gLoadArt"><img src={`/assets/covers/${G.id}.jpg?v=2`} alt="" /></div>
            <span className="gLoadKicker">HONGYUN · MAHJONG WAYS</span>
            <b className="gLoadName">{G.name}</b>
            <span className="gLoadSub">{G.sub} · 1024 WAYS</span>
            <div className="gLoadBar"><i style={{ width: `${loadPct}%` }} /></div>
            <div className="gLoadMeta">
              <span>{loadPct >= 100 ? 'SIAP' : 'MEMUAT MESIN'}</span>
              <b>{loadPct}%</b>
            </div>
          </div>
          <span className="gLoadFoot">ASET VITA MAHJONG 3.46.1 · DEMO OFFLINE</span>
        </div>
      )}

      {bigWin && (
        <div className={`bigOverlay${bigWin.tier === 'JACKPOT' ? ' jackpot' : ''}`} onClick={skipNow}>
          <i className="rays" />
          {bigWin.tier === 'JACKPOT' && (
            <div className="jpConfetti">
              {Array.from({ length: 16 }, (_, i) => (
                <i key={i} style={{
                  left: `${3 + ((i * 61) % 94)}%`,
                  animationDelay: `${(i % 8) * 0.09}s`,
                  animationDuration: `${1.7 + (i % 5) * 0.28}s`,
                }} />
              ))}
            </div>
          )}
          <div className="bigCard">
            <span className="bigKicker">{bigWin.tier === 'JACKPOT' ? 'PROGRESSIVE JACKPOT' : 'TOTAL KEMENANGAN'}</span>
            <b className={`bigTitle ${bigWin.tier.toLowerCase()}`}>
              {bigWin.tier === 'JACKPOT' ? 'JACKPOT' : bigWin.tier === 'SUPER' ? 'SUPER MEGA WIN' : bigWin.tier === 'MEGA' ? 'MEGA WIN' : 'BIG WIN'}
            </b>
            <span className="bigAmount">{fmt(bigAmt)}</span>
            {bigWin.tier === 'JACKPOT' && (
              <span className="bigSplit">POOL {fmt(bigWin.pool)} · WIN {fmt(bigWin.won)}</span>
            )}
            <em>×{fmt(Math.round(bigWin.amount / bet))} dari taruhan</em>
          </div>
          <div className="bigCoins"><Coin size={38} /><Coin size={56} /><Coin size={38} /></div>
          <div className="tapHint">tap untuk lanjut</div>
        </div>
      )}

      {renderPrize()}

      {fsIntro && (
        <div className="fsOverlay" onClick={skipNow}>
          <i className="fsRays" />
          <span className="fsKicker">{fsIntro.kind === 'BUY' ? 'BONUS SPIN' : `${fsIntro.kind} SCATTER`}</span>
          <b className="fsNum">{fsIntro.spins}</b>
          <span className="fsWord">FREE SPINS</span>
          <span className="fsMult">MULTIPLIER ×{fsIntro.mult}</span>
          <div className="tapHint">tap untuk lanjut</div>
        </div>
      )}

      {fsSummary && (
        <div className="overlay center">
          <div className="sheet summary">
            <div className="sheetBody">
              <span className="eyebrow">FREE SPINS SELESAI</span>
              <b className="sumAmt">+{fmt(fsSummary.amount)}</b>
              <p className="hint">Total kemenangan selama free spin.</p>
              <button className="claimBtn" onClick={() => setFsSummary(null)}>LANJUT</button>
            </div>
          </div>
        </div>
      )}

      {renderModals()}
      {toast && <div key={toast.id} className={`toast ${toast.kind}`}>{toast.text}</div>}
    </>
  )

  return (
    <div className="wrap mw2wrap">
      {fit.desk ? (
        <div className="stage mw2 desk" style={stageStyle}>
          <img className="mw2plate" src="/assets/mw2ui/plate.webp" alt="" draggable="false" />

          <div className={`mw2reels${flashing ? ' ant' : ''}`}>
            <div className="mw2board">{tiles}</div>
            {winFloat}
          </div>

          <b className="mw2val cred">Rp <Num value={bal} /></b>
          <button type="button" className="mw2val bett" onClick={() => setModal('bet')}
            aria-label="pilih taruhan"><span>Rp <Num value={bet} /></span></button>
          <span className="mw2clock">{clockTxt}</span>

          <button className={`mw2spin${spinning ? ' spin' : ''}${turbo ? ' turbo' : ''}`}
            onClick={() => spinRef.current?.()} aria-label="spin">{spinArrows}</button>

          <button className="mw2exit" onClick={goLobby}><Icon name="back" size={14} /> LOBI</button>
          <div className="mw2jpchip">JACKPOT <b><Num value={jp} /></b></div>

          <button className="mw2hot minus" onClick={() => changeBet(-1)} aria-label="kurangi taruhan" />
          <button className="mw2hot plus" onClick={() => changeBet(1)} aria-label="tambah taruhan" />
          <button className={`mw2hot auto${auto > 0 ? ' on' : ''}`}
            onClick={() => (auto > 0 ? stopAuto() : setModal('auto'))} aria-label="auto spin">
            <Icon name={auto > 0 ? 'stop' : 'infinity'} size={17} />
            <span>{auto > 0 ? `STOP ${auto}` : 'AUTO'}</span>
          </button>
          <button className="mw2hot menu" onClick={() => setModal('menu')} aria-label="menu" />
          <button className="mw2hot snd" onClick={() => { setSfx((v) => !v); sound.click() }} aria-label="suara" />
          <button className="mw2hot info" onClick={() => setModal('pay')} aria-label="info dan paytable" />
          <button className="mw2hot betb" onClick={() => setModal('bet')} aria-label="ubah taruhan" />
          <button className="mw2hot buyb" onClick={() => setModal('buy')} aria-label="beli free spin" />
          <button className="mw2hot turbob" onClick={() => { setTurbo((v) => !v); sound.click() }} aria-label="turbo" />

          {fs.left > 0 && <div className="mw2ribbon">SPIN GRATIS <b>{fs.left}</b><i>×{fs.mult}</i></div>}
          {fs.left > 0 && <b className="mw2multi">×{fs.mult}</b>}
        </div>
      ) : (
        <div className="stage mw2 mobi" style={stageStyle}>
          {/* awan emas + vignette: lapisan latar ala referensi mahjong-ways-ui */}
          <svg width="0" height="0" className="mw2defs" aria-hidden="true">
            <symbol id="mw2cloud" viewBox="0 0 240 160">
              <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M18 128c0-16 13-29 29-29 4-18 20-31 39-31 12 0 23 5 31 14 6-4 13-6 20-6 20 0 36 16 36 36 0 3-.3 6-1 9h-146c-.6-2-1-4-1-6z" />
                <path d="M30 128c8-14 24-22 40-20 6-14 20-23 35-23" />
                <path d="M96 152c10-12 26-17 40-13" />
                <path d="M178 152c-6-10-18-15-29-13" />
                <circle cx="196" cy="86" r="3" />
              </g>
            </symbol>
          </svg>
          <svg className="mw2cloud cl" viewBox="0 0 240 160" aria-hidden="true"><use href="#mw2cloud" /></svg>
          <svg className="mw2cloud cr" viewBox="0 0 240 160" aria-hidden="true"><use href="#mw2cloud" /></svg>
          <svg className="mw2cloud bl" viewBox="0 0 240 160" aria-hidden="true"><use href="#mw2cloud" /></svg>
          <svg className="mw2cloud br" viewBox="0 0 240 160" aria-hidden="true"><use href="#mw2cloud" /></svg>
          <span className="mw2vig" aria-hidden="true" />

          <header className="mw2top">
            <button className="mw2round mw2back" onClick={goLobby} aria-label="kembali"><Icon name="back" size={14} /><span>LOBI</span></button>
            <div className="mw2title">
              <img className="mw2logo" src={'/assets/covers/title/' + G.id + '.webp'} alt={G.name} draggable="false" />
              <i className="mw2ways-chip">1024 WAYS</i>
            </div>
            <button className="mw2round" onClick={() => { setSfx((v) => !v); sound.click() }} aria-label="suara">
              <Icon name={sfx ? 'sound' : 'mute'} size={16} />
            </button>
            <button className="mw2round" onClick={() => setModal('pay')} aria-label="paytable"><Icon name="info" size={16} /></button>
          </header>

          {/* pita jade multiplier cascade, sama seperti referensi */}
          <div className="mw2mr" aria-hidden="true">
            <div className="mw2mr-in">
              {CASCADE_MULT.map((n) => (
                <span key={n} className={n === stepMult ? 'on' : ''}>×{n}</span>
              ))}
            </div>
          </div>

          <div className={`mw2reels${flashing ? ' ant' : ''}`}>
            <div className="mw2board">
              {tiles}
              {winFloat}
            </div>
          </div>

          {/* dok bawah: free spin, saldo, kontrol, ticker menyatu */}
          <div className="mw2dock">
            <div className="mw2pills">
              <div className={`mw2fsp${fs.left > 0 ? ' on' : ''}`}>
                <span className="fs-text">{fs.left > 0 ? `FREE SPINS · ${fs.left}` : 'FREE SPINS!'}</span>
                <i className="fs-dot left" aria-hidden="true" />
                <i className="fs-dot right" aria-hidden="true" />
                {fs.left > 0 && <em className="fs-mult">×{G.fsMult}</em>}
              </div>
            </div>

            <div className="mw2panel">
              <div className="mw2cell">
                <svg className="mw2cell-ico" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.6a9.4 9.4 0 100 18.8 9.4 9.4 0 000-18.8zm0 4.3a5.1 5.1 0 110 10.2 5.1 5.1 0 010-10.2z" />
                  <path d="M12 7.6a4.4 4.4 0 100 8.8 4.4 4.4 0 000-8.8zM11 0h2v3.4h-2zM11 20.6h2V24h-2zM0 11h3.4v2H0zM20.6 11H24v2h-3.4z" />
                </svg>
                <Num value={bal} className="mw2cell-val" />
              </div>
              <div className="mw2cell">
                <svg className="mw2cell-ico" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2.4a7.6 7.6 0 110 15.2 7.6 7.6 0 010-15.2z" />
                  <path d="M13.5 6.4h-2.2c-1.7 0-3 1.2-3 2.8 0 1.4.9 2.3 2.4 2.7l1.4.4c.6.2.9.5.9 1 0 .5-.5.9-1.2.9h-2.9v2h2.3v1.7h2.2v-1.7c1.7-.2 2.9-1.3 2.9-2.9 0-1.4-.9-2.3-2.5-2.7l-1.4-.4c-.6-.2-.8-.4-.8-.9s.4-.8 1-.8h2.9z" />
                </svg>
                <Num value={bet} className="mw2cell-val" />
              </div>
              <div className="mw2cell">
                <svg className="mw2cell-ico" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2.4 8.2h19.2v4H2.4zM3.6 13.4h16.8v8.2H3.6z" />
                  <path d="M10.6 8.2h2.8v13.4h-2.8z" />
                  <path d="M12 2.2c-2.6 0-4.4 1.6-4.4 3.4 0 .9.5 1.6 1.3 2h3.1V2.2zm0 0c2.6 0 4.4 1.6 4.4 3.4 0 .9-.5 1.6-1.3 2h-3.1V2.2z" />
                </svg>
                <Num value={win} className="mw2cell-val win" />
              </div>
            </div>

            {/* kontrol ala referensi: turbo · − · putar · + · auto · menu */}
            <footer className="mw2bar">
              <button className={`mw2ctrl${turbo ? ' on' : ''}`} onClick={() => { setTurbo((v) => !v); sound.click() }} aria-label="turbo">
                <span className="mw2ring"><Icon name="bolt" size={18} /></span>
                <span className="mw2cap">TURBO</span>
              </button>
              <button className="mw2ctrl" onClick={() => changeBet(-1)} aria-label="kurangi taruhan">
                <span className="mw2ring"><i className="mw2minus" /></span>
              </button>
              <button className={`mw2spin${spinning ? ' spin' : ''}${turbo ? ' turbo' : ''}`}
                onClick={() => spinRef.current?.()} aria-label="spin">
                <span className="mw2spin-face">{spinArrows}</span>
              </button>
              <button className="mw2ctrl" onClick={() => changeBet(1)} aria-label="tambah taruhan">
                <span className="mw2ring"><i className="mw2plus" /></span>
              </button>
              <button className={`mw2ctrl${auto > 0 ? ' on' : ''}`}
                onClick={() => (auto > 0 ? stopAuto() : setModal('auto'))} aria-label="auto spin">
                <span className="mw2ring"><Icon name={auto > 0 ? 'stop' : 'infinity'} size={18} /></span>
                <span className="mw2cap">{auto > 0 ? `STOP ${auto}` : 'AUTO'}</span>
              </button>
              <button className="mw2ctrl mw2menu" onClick={() => setModal('menu')} aria-label="menu">
                <span className="mw2ring"><Icon name="sliders" size={20} /></span>
              </button>
            </footer>

            <div className="mw2tick">
              <span className="mw2tick-jp">JACKPOT <b><Num value={jp} /></b></span>
              <div className="mw2tick-mask">
                <div className="tick">
                  {ticker.concat(ticker).map((t, i) => (
                    <span key={i}>
                      {t.text || <><b>{t.name}</b> MENANG <i>×{fmt(t.mult)}</i> DI {t.machine}</>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <i className="mw2arc" aria-hidden="true" />

          {jpFeed && !bigWin && !fsIntro && (
            <div className="mw2drop" key={jpFeed.id}>
              <span>{jpFeed.name}</span><b>+{short(jpFeed.amt)}</b>
            </div>
          )}
        </div>
      )}

      {overlays}
    </div>
  )
}
