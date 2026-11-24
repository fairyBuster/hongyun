// Logika bersama aplikasi HONGYUN: transaksi, klaim harian, undian,
// pengaturan, notifikasi, dan data pendukung modal. Semua tersimpan di
// localStorage supaya tetap ada setelah halaman dimuat ulang.
export const K = {
  tx: 'f55.tx',
  bank: 'f55.bank',
  claims: 'f55.claims',
  settings: 'f55.settings',
  chat: 'f55.chat',
  notifRead: 'f55.notifRead',
  feedback: 'f55.feedback',
  remember: 'f55.remember',
  pendingDep: 'f55.pendingDep',
  cc: 'f55.cc',
}

/* ---------- identitas akun aktif ---------- */
/* Data uang (transaksi, klaim, rekening, deposit tertunda) disimpan per
   akun: f55.tx:<id>, f55.claims:<id>, ... supaya tidak tercampur saat
   satu perangkat dipakai bergantian oleh beberapa akun. */
export const activeAccount = () => {
  try {
    const u = JSON.parse(localStorage.getItem('f55.user') || 'null')
    return (u && u.phone) || ''
  } catch {
    return ''
  }
}

export const userKey = (id, base) => (id ? base + ':' + id : base)

/* kode undangan unik per akun, dipakai halaman Promosi */
export const refCode = (id) => {
  const s = String(id || '')
  if (!s) return ''
  if (s.includes('@')) {
    let h = 0
    for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) % 1679616
    return 'HY' + h.toString(36).toUpperCase().padStart(4, '0')
  }
  return 'HY' + (s.replace(/\D/g, '').slice(-6) || '0000')
}

const SCOPED = new Set([K.tx, K.bank, K.claims, K.pendingDep, K.feedback])
const keyOf = (key) => (SCOPED.has(key) ? userKey(activeAccount(), key) : key)

/* ---------- baca / tulis ---------- */
export const read = (key, def) => {
  try {
    const k = keyOf(key)
    const v = localStorage.getItem(k)
    if (v !== null) return JSON.parse(v)
    /* data lama dengan kunci global dipindahkan ke akun aktif sekali */
    if (k !== key) {
      const legacy = localStorage.getItem(key)
      if (legacy !== null) {
        localStorage.setItem(k, legacy)
        localStorage.removeItem(key)
        return JSON.parse(legacy)
      }
    }
    return def
  } catch {
    return def
  }
}
export const write = (key, value) => {
  try {
    localStorage.setItem(keyOf(key), JSON.stringify(value))
  } catch {}
}

export const dateKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const yesterdayKey = () => dateKey(new Date(Date.now() - 86400000))

export const timeText = (ts) => {
  const d = new Date(ts)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(
    d.getHours(),
  ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

/* salin ke clipboard dengan cadangan untuk browser lama */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {}
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
    return true
  } catch {
    return false
  }
}

/* ---------- transaksi ---------- */
/* kind: deposit | withdraw | bonus | wheel
   status: success | pending | process | cancel
   amount selalu positif; arah dilihat dari kind (withdraw = keluar) */
export const txAll = () => read(K.tx, [])

export const addTx = (tx) => {
  const item = { id: newId(), at: Date.now(), status: 'success', ...tx }
  write(K.tx, [item, ...txAll()].slice(0, 150))
  return item
}

export const updateTx = (id, patch) => {
  write(K.tx, txAll().map((t) => (t.id === id ? { ...t, ...patch } : t)))
}

export const txOf = (kind) => txAll().filter((t) => t.kind === kind)

export const bonusTx = () => txAll().filter((t) => t.kind === 'bonus' || t.kind === 'wheel')

export const sumTx = (list, status = 'success') =>
  list.reduce((a, t) => a + (!status || t.status === status ? t.amount : 0), 0)

export const statusText = {
  success: 'Berhasil',
  pending: 'Menunggu',
  process: 'Diproses',
  cancel: 'Dibatalkan',
}

/* ---------- klaim & undian ---------- */
export const claims = () => read(K.claims, {})

export const CHECKIN = [2000, 3000, 5000, 8000, 12000, 18000, 25000]

export function checkinState() {
  const c = claims().checkin || {}
  const done = c.last === dateKey()
  const streak = c.streak || 0
  const nextStreak = done ? streak : c.last === yesterdayKey() ? streak + 1 : 1
  return { done, streak, nextStreak, last: c.last || '', total: c.total || 0 }
}

export function claimCheckin() {
  const st = checkinState()
  if (st.done) return { ok: false, msg: 'Sudah check-in hari ini' }
  const value = CHECKIN[(st.nextStreak - 1) % 7]
  const c = claims()
  write(K.claims, {
    ...c,
    checkin: {
      last: dateKey(),
      streak: st.nextStreak,
      total: (c.checkin?.total || 0) + value,
    },
  })
  addTx({ kind: 'bonus', label: `Check-in hari ke-${st.nextStreak}`, amount: value })
  return { ok: true, value, streak: st.nextStreak }
}

/* kode penukaran hadiah */
export const CODES = {
  HONGYUN2026: 25000,
  MAHJONG10: 10000,
  WELCOME5: 5000,
  SPIN777: 7777,
}

export function redeemCode(code) {
  const key = String(code || '').trim().toUpperCase()
  if (!CODES[key]) return { ok: false, msg: 'Kode tidak valid' }
  const c = claims()
  const redeemed = c.redeemed || []
  if (redeemed.includes(key)) return { ok: false, msg: 'Kode sudah pernah ditukar' }
  write(K.claims, { ...c, redeemed: [...redeemed, key] })
  addTx({ kind: 'bonus', label: 'Kode hadiah ' + key, amount: CODES[key] })
  return { ok: true, value: CODES[key], code: key }
}

/* rabat taruhan 0,5% dari total taruhan mesin mahjong */
export const gameKey = (id) => userKey(id, 'mj.v2')

export function gameSave() {
  return read(gameKey(activeAccount()), null) || read('mj.v2', null)
}
export function gameStats() {
  const s = gameSave()?.stats || {}
  return { spins: s.spins || 0, wins: s.wins || 0, wagered: s.wagered || 0, won: s.won || 0, best: s.best || 0 }
}
export function rebateState() {
  const st = gameStats()
  const due = Math.max(0, Math.floor(st.wagered * 0.005) - (claims().rebate || 0))
  return { wagered: st.wagered, due }
}
export function claimRebate() {
  const r = rebateState()
  if (r.due <= 0) return { ok: false, msg: 'Belum ada rabat yang bisa diklaim' }
  const c = claims()
  write(K.claims, { ...c, rebate: (c.rebate || 0) + r.due })
  addTx({ kind: 'bonus', label: 'Rabat taruhan 0,5%', amount: r.due })
  return { ok: true, value: r.due }
}

/* komisi undangan: dihitung dari deposit anggota, diklaim sekali ke saldo */
export const commissionClaimed = () => Number(claims().commission) || 0

export function claimCommission(total) {
  const due = Math.max(0, Math.floor(Number(total) || 0) - commissionClaimed())
  if (due <= 0) return { ok: false, msg: 'Belum ada komisi yang bisa diklaim' }
  const c = claims()
  write(K.claims, { ...c, commission: (c.commission || 0) + due })
  addTx({ kind: 'bonus', label: 'Komisi undangan', amount: due })
  return { ok: true, value: due }
}

/* ---------- bank ---------- */
export const BANKS = ['BCA', 'BRI', 'BNI', 'Mandiri', 'CIMB Niaga', 'Permata', 'Danamon']
export const getBank = () => read(K.bank, null)
export const saveBank = (bank) => write(K.bank, bank)
export const maskNo = (no) => {
  const s = String(no || '')
  return s.length > 4 ? s.slice(0, 4) + ' •••• ' + s.slice(-4) : s
}

/* ---------- pengaturan & profil ---------- */
export const settings = () =>
  read(K.settings, { push: true, sfx: true, music: true, vibrate: true, lang: 'id' })
export const saveSettings = (patch) => write(K.settings, { ...settings(), ...patch })

/* ---------- deposit tertunda ---------- */
export function getPendingDeposit() {
  const p = read(K.pendingDep, null)
  if (!p) return null
  if (!p.exp || p.exp <= Date.now()) {
    localStorage.removeItem(keyOf(K.pendingDep))
    return null
  }
  return p
}
export const setPendingDeposit = (p) => write(K.pendingDep, p)
export const clearPendingDeposit = () => localStorage.removeItem(keyOf(K.pendingDep))

/* ---------- notifikasi & pengumuman ---------- */
export const NOTIFS = [
  {
    id: 'welcome',
    title: 'Selamat datang di HONGYUN',
    body: 'Akun anda aktif. Klaim bonus harian lewat menu Aktivitas.',
    date: '24 Nov 2026',
  },
  {
    id: 'deposit',
    title: 'Bonus deposit perdana 100%',
    body: 'Deposit pertama minimal Rp20.000 dan dapatkan bonus hingga Rp1.000.000. Cek syarat di menu Promosi.',
    date: '23 Nov 2026',
  },
  {
    id: 'maint',
    title: 'Pemeliharaan sistem',
    body: 'Pemeliharaan rutin setiap Senin 03:00–04:00 WIB. Transaksi dapat tertunda sementara.',
    date: '22 Nov 2026',
  },
  {
    id: 'security',
    title: 'Keamanan akun',
    body: 'Jangan bagikan kata sandi atau kode OTP kepada siapa pun, termasuk yang mengaku CS HONGYUN.',
    date: '20 Nov 2026',
  },
]
export const notifRead = () => read(K.notifRead, [])
export const markNotifRead = (ids) => write(K.notifRead, Array.from(new Set([...notifRead(), ...ids])))

/* ---------- konten modal ---------- */
export const VIP_TIERS = [
  { name: 'Bronze', min: 0, note: 'Level awal semua member' },
  { name: 'Silver', min: 5000000, note: 'Komisi +0,3% dan bonus mingguan' },
  { name: 'Gold', min: 25000000, note: 'Komisi +0,6% dan prioritas CS' },
  { name: 'Platinum', min: 100000000, note: 'Manajer pribadi dan hadiah eksklusif' },
]

export const TOURNEYS = [
  {
    id: 'mj-weekly',
    name: 'Mahjong Weekly Race',
    prize: 'Rp25.000.000',
    period: '24 – 30 Nov 2026',
    status: 'Berlangsung',
    game: 'mw1',
  },
  {
    id: 'slot-scatter',
    name: 'Slot Scatter Hunt',
    prize: 'Rp10.000.000',
    period: '1 – 7 Des 2026',
    status: 'Segera',
    game: 'mw3',
  },
]

export const PRODUCT_CODE = (uid) => 'HY-' + String(uid || '0000').slice(-4) + '-A1'

export const GUIDE_STEPS = [
  'Daftar dengan nomor ponsel aktif, lalu masuk ke akun anda.',
  'Buka menu Akun → Deposit, pilih metode QRIS / Virtual Account / LinkAja.',
  'Isi nominal minimal Rp20.000 lalu selesaikan pembayaran sebelum waktu habis.',
  'Pilih permainan di Beranda (Mahjong Ways atau slot lain) dan atur nominal taruhan.',
  'Tarik kemenangan lewat menu Penarikan setelah rekening bank ditautkan.',
]

export const PROMO_DESC = [
  'Ajak teman mendaftar dengan link undangan anda. Semakin banyak anggota aktif, semakin besar komisi harian yang masuk.',
  'Buka Mystery Box setiap hari untuk kesempatan mendapatkan hadiah kejutan dan saldo tambahan.',
  'Deposit pertama anda mendapatkan bonus hingga 100%. Klaim otomatis setelah deposit pertama berhasil.',
  'Putar roda keberuntungan setiap hari. Hadiah langsung masuk ke saldo tanpa syarat tambahan.',
  'Menangkan berturut-turut dan dapatkan bonus winstreak yang dihitung dari total kemenangan sesi.',
  'Bonus spin khusus permainan slot dengan tambahan 20% dari nilai kemenangan putaran tertentu.',
  'Saldo darurat untuk permainan slot: dapatkan pengembalian 10% saat saldo menipis.',
  'Rabat taruhan realtime 0,5% dari total taruhan, dibagikan setiap hari ke saldo anda.',
  'Hindari penipuan yang mengatasnamakan HONGYUN. Semua transaksi hanya lewat menu resmi aplikasi.',
  'Bonus misteri jackpot untuk member aktif dengan total taruhan tertentu setiap minggunya.',
  'Tidak menemukan tim tutor kami? Hubungi Customer Service 24 jam melalui tombol chat di kanan bawah.',
  'Event Super & Black Scatter Pragmatic Play dengan hadiah tambahan untuk scatter hitam.',
]

