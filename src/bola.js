// Data Bola 1X2 asli. Laga, tim, tanggal, dan skor akhir diambil dari
// openfootball/football.json (hasil resmi liga). Odds dihitung dari rating
// serang/pertahanan tiap tim, bukan angka acak atau odds pasar.
// File JSON pendukung ada di public/assets/bola/*.json.
export const BOLA_LEAGUES = [
  { id: 'epl', name: 'Premier League', country: 'Inggris', file: '/assets/bola/epl.json' },
  { id: 'laliga', name: 'LaLiga', country: 'Spanyol', file: '/assets/bola/laliga.json' },
  { id: 'seriea', name: 'Serie A', country: 'Italia', file: '/assets/bola/seriea.json' },
  { id: 'bundesliga', name: 'Bundesliga', country: 'Jerman', file: '/assets/bola/bundesliga.json' },
  { id: 'ligue1', name: 'Ligue 1', country: 'Prancis', file: '/assets/bola/ligue1.json' },
]

const FACT = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880]
const MARGIN = 1.06
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const pois = (k, lambda) => (Math.exp(-lambda) * Math.pow(lambda, k)) / FACT[k]

/* peluang 1X2 dari dua rata-rata gol (Poisson), lalu dikonversi ke odds desimal */
function oddsOf(league, m) {
  const [hf, af, avg] = league.avg
  const [attH, defH] = league.teams[m.home] || [1, 1]
  const [attA, defA] = league.teams[m.away] || [1, 1]
  const lh = clamp(attH * defA * avg * hf, 0.2, 4.6)
  const la = clamp(attA * defH * avg * af, 0.2, 4.6)
  let home = 0
  let draw = 0
  let away = 0
  for (let i = 0; i <= 9; i++) {
    const pi = pois(i, lh)
    for (let j = 0; j <= 9; j++) {
      const p = pi * pois(j, la)
      if (i > j) home += p
      else if (i === j) draw += p
      else away += p
    }
  }
  const price = (p) => +clamp(1 / (Math.max(p, 1e-4) * MARGIN), 1.03, 20).toFixed(2)
  return { home: price(home), draw: price(draw), away: price(away) }
}

const prepare = (raw, meta) => {
  const league = { ...meta, ...raw, matches: [] }
  league.matches = raw.matches.map(([date, home, away, fh, fa, hh, ha], i) => {
    const item = {
      id: meta.id + '-' + i,
      date,
      home,
      away,
      ft: [fh, fa],
      ht: hh === undefined ? null : [hh, ha],
    }
    item.odds = oddsOf(league, item)
    return item
  })
  return league
}

let loading = null

/* sekali muat per sesi; force=true untuk coba ulang setelah gagal */
export function loadBola(force = false) {
  if (loading && !force) return loading
  loading = Promise.all(
    BOLA_LEAGUES.map((l) =>
      fetch(l.file)
        .then((r) => {
          if (!r.ok) throw new Error('HTTP ' + r.status)
          return r.json()
        })
        .then((j) => prepare(j, l)),
    ),
  )
  loading = loading.catch((e) => {
    loading = null
    throw e
  })
  return loading
}

export const outcomeOf = (ft) => (ft[0] > ft[1] ? 'home' : ft[0] < ft[1] ? 'away' : 'draw')

/* rencana gol 90 menit mengikuti skor akhir (dan skor babak pertama) yang asli */
export function goalPlan(m) {
  let h = 2166136261
  const key = m.date + '|' + m.home + '|' + m.away
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619)
  const rng = () => {
    h = (h + 0x6d2b79f5) >>> 0
    let t = Math.imul(h ^ (h >>> 15), h | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const plan = []
  const add = (team, n, lo, hi) => {
    for (let i = 0; i < n; i++) plan.push({ team, min: lo + Math.floor(rng() * (hi - lo + 1)) })
  }
  const [fh, fa] = m.ft
  if (m.ht && m.ht[0] <= fh && m.ht[1] <= fa) {
    add('home', m.ht[0], 1, 45)
    add('away', m.ht[1], 1, 45)
    add('home', fh - m.ht[0], 46, 90)
    add('away', fa - m.ht[1], 46, 90)
  } else {
    add('home', fh, 1, 90)
    add('away', fa, 1, 90)
  }
  return plan.sort((a, b) => a.min - b.min)
}

const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export const dateText = (iso) => {
  const [y, mo, d] = iso.split('-').map(Number)
  return d + ' ' + MONTH[mo - 1] + ' ' + y
}
