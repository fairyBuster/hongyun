// Papan pemenang = data pengguna yang menarik dana (withdraw).
// Sumber utama: backend (GET /api/winners). Selama backend belum siap,
// dipakai riwayat penarikan nyata di perangkat ini supaya tidak ada data karangan.
//
// Kontrak backend (alamat bisa ditimpa lewat env VITE_WINNERS_API):
//   GET /api/winners
//   200 -> [{ name|nickname|phone, amount, at, method, id?, user? }]
//          atau { items: [...] } / { data: [...] }
//   Kirim hanya penarikan yang sudah diproses/disetujui, urut terbaru.
import { txAll } from './logic.js'

const API = (import.meta.env.VITE_WINNERS_API || '/api/winners').trim()
const LIMIT = 30
const CACHE_MS = 20000

/* samarkan nama/telepon: "Member1111" -> "Mem***11", "081234567890" -> "0812***890" */
const mask = (raw) => {
  const s = String(raw || '').trim()
  if (!s) return 'Member***'
  if (s.includes('*')) return s
  if (/^\d{6,}$/.test(s)) return s.slice(0, 4) + '***' + s.slice(-3)
  const words = s.split(/\s+/).filter(Boolean)
  if (words.length > 1) return words[0].slice(0, 3) + '***' + words[1].slice(0, 3).toUpperCase()
  return s.slice(0, 3) + '***' + s.slice(-2).toUpperCase()
}

const toTime = (v) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v > 1e12 ? v : v * 1000
  const t = Date.parse(v)
  return Number.isFinite(t) ? t : 0
}

const bankOf = (tx) => {
  const label = String(tx.label || '')
  const i = label.lastIndexOf('·')
  if (i >= 0) return label.slice(i + 1).trim()
  return String(tx.method || '').replace(/[\d*•\s]/g, '')
}

/* fallback: penarikan yang tercatat di perangkat (status proses/berhasil, bukan batal) */
export function localWithdrawals(user) {
  const name = mask(user?.nickname || user?.phone || 'Member')
  const key = String(user?.phone || user?.uid || 'me')
  return txAll()
    .filter((t) => t.kind === 'withdraw' && t.status !== 'cancel' && Number(t.amount) > 0)
    .map((t) => ({
      id: t.id,
      userKey: key,
      name,
      amount: Number(t.amount),
      at: Number(t.at) || 0,
      method: bankOf(t),
    }))
}

const fromBackend = (list) =>
  list
    .filter((o) => o && typeof o === 'object')
    .map((o, i) => {
      const raw = o.name || o.nickname || o.phone || o.user || 'Member'
      return {
        id: String(o.id || 'b' + i),
        userKey: String(o.user || o.phone || o.nickname || raw),
        name: mask(raw),
        amount: Number(o.amount ?? o.total ?? 0),
        at: toTime(o.at ?? o.time ?? o.createdAt),
        method: String(o.method || o.bank || '').trim().toUpperCase(),
      }
    })
    .filter((o) => o.amount > 0)

let cache = { at: 0, items: null, ok: false }

async function fetchBackend() {
  const now = Date.now()
  if (cache.ok && now - cache.at < CACHE_MS) return cache.items
  const ctrl = new AbortController()
  const timeout = setTimeout(() => ctrl.abort(), 2500)
  try {
    const r = await fetch(API, { headers: { Accept: 'application/json' }, signal: ctrl.signal })
    if (!r.ok) return null
    if (!(r.headers.get('content-type') || '').includes('json')) return null
    const j = await r.json()
    const list = Array.isArray(j) ? j : Array.isArray(j?.items) ? j.items : Array.isArray(j?.data) ? j.data : null
    if (!list) return null
    const items = fromBackend(list)
    cache = { at: now, items, ok: true }
    return items
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

/* items terbaru dulu; source 'backend' bila data berasal dari API */
export async function loadWinners(user) {
  const backend = await fetchBackend()
  const items = (backend ?? localWithdrawals(user)).sort((a, b) => b.at - a.at).slice(0, LIMIT)
  return { items, source: backend ? 'backend' : 'lokal' }
}
