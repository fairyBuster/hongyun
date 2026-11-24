// Engine "ways" ala Mahjong Ways: 5 reel x 4 baris = 1024 ways, plus cascade
// (simbol menang meledak, sisanya jatuh, multiplier naik tiap cascade).
// Paytable & RTP bikinan sendiri (aslinya di server PG Soft).

export const REELS = 5
export const ROWS = 4
export const WAYS = 1024

// multiplier cascade per langkah (langkah 1 = win pertama)
export const CASCADE_MULT = [1, 2, 3, 5, 8]

/* ---------------- 20 mesin Mahjong Ways ----------------
 * Line-up, nama, dan palet diambil dari project mahjong-ways-ui (themes.js).
 * Matematikanya tetap satu engine: 5x4, 1024 ways, paytable per tier. */
const TIER = {
  low: {
    fsMult: 2, scale: 0.1300,
    pays: {
      s1: [5, 12, 40], s2: [6, 15, 50], s3: [8, 20, 70], s4: [10, 30, 100],
      s5: [12, 40, 140], s6: [15, 50, 180], s7: [20, 70, 240],
      s8: [30, 120, 500], s9: [50, 200, 900], wild: [100, 400, 2000],
    },
    weight: { s1: 14, s2: 13, s3: 12, s4: 11, s5: 10, s6: 9, s7: 8, s8: 6, s9: 4, wild: 1, scatter: 2 },
  },
  mid: {
    fsMult: 3, scale: 0.1153,
    pays: {
      s1: [4, 10, 32], s2: [5, 12, 40], s3: [7, 18, 60], s4: [9, 26, 90],
      s5: [12, 34, 120], s6: [16, 44, 160], s7: [22, 64, 220],
      s8: [34, 130, 560], s9: [60, 240, 1100], wild: [120, 500, 2500],
    },
    weight: { s1: 13, s2: 13, s3: 12, s4: 11, s5: 10, s6: 9, s7: 8, s8: 6, s9: 3, wild: 1, scatter: 2 },
  },
  high: {
    fsMult: 4, scale: 0.0865,
    pays: {
      s1: [5, 14, 45], s2: [6, 16, 55], s3: [8, 22, 75], s4: [11, 32, 110],
      s5: [14, 44, 150], s6: [18, 55, 190], s7: [25, 75, 260],
      s8: [40, 150, 620], s9: [70, 280, 1250], wild: [140, 600, 2800],
    },
    weight: { s1: 14, s2: 13, s3: 12, s4: 11, s5: 10, s6: 9, s7: 8, s8: 5, s9: 3, wild: 1, scatter: 2 },
  },
}

// [nama, sub, tag, bg1, bg2, rib1, rib2, tier]
const THEMES = [
  ['MAHJONG WAYS', 'Merah klasik', 'Klasik', '#ef7a4a', '#6b0d12', '#3fd8b4', '#056456', 'low'],
  ['MAHJONG WAYS II', 'Giok laut', 'Jade', '#1f9d84', '#043c37', '#ffe08f', '#8a5a12', 'mid'],
  ['MAHJONG WAYS GOLD', 'Merah emas', 'Gold', '#8e1f2b', '#3d070c', '#f2c14e', '#8a5a12', 'high'],
  ['MAHJONG WAYS R', 'Rose', 'Rose', '#b8467a', '#3a0b24', '#ffd4e6', '#8e2b55', 'low'],
  ['HU WAYS', 'Hu', 'Hu', '#2a1414', '#0d0405', '#ffcf6b', '#8f4c0c', 'mid'],
  ['MAHJONG WAYS 2', 'Hijau daun', 'Green', '#5f9e4a', '#12300c', '#f6e7b0', '#7d5f14', 'high'],
  ['MAHJONG WAYS BLACK', 'Hitam emas', 'Black', '#2b2b2b', '#080808', '#e8bd6b', '#6d4708', 'low'],
  ['HU COIN', 'Koin emas', 'Coin', '#c9962e', '#3d2705', '#7a1010', '#3d0607', 'mid'],
  ['MAHJONG WINS 3', 'Merah cabai', 'Wins', '#c0392b', '#3c0407', '#ffd166', '#8a5a12', 'low'],
  ['MAHJONG WINS GXFC', 'Kuning merah', 'GXFC', '#f2b13c', '#7a3f08', '#e5484d', '#8d1211', 'high'],
  ['MAHJONG WAYS 2 PG', 'Giok PG', 'PG', '#1f9d84', '#06322c', '#ffe08f', '#7d4a0c', 'mid'],
  ['MAHJONG WAYS MINI', 'Biru mini', 'Mini', '#8fb6d9', '#16283d', '#ffd9a0', '#8a5a12', 'low'],
  ['TONG CHEONG SOON KEE', 'Kayu cokelat', 'TCSK', '#7a5a3a', '#241207', '#cde0a8', '#4e6234', 'high'],
  ['MAHJONG WAYS CLASSIC', 'Klasik', 'Classic', '#ef7a4a', '#5c1010', '#3fd8b4', '#056456', 'mid'],
  ['MAHJONG WAYS 2 JADE', 'Giok pucat', 'Jade', '#1f9d84', '#04241f', '#e9f2ff', '#5b7a9e', 'low'],
  ['HU GOLD', 'Emas cerah', 'Gold', '#d9a43c', '#4a2a05', '#b8241f', '#6d0c0d', 'mid'],
  ['MAHJONG WAYS R GOLD', 'Rose emas', 'R Gold', '#a9852f', '#2b1e06', '#d8e0b0', '#5d6b3a', 'high'],
  ['MAHJONG WINS 3 DARK', 'Merah gelap', 'Dark', '#5f1a1a', '#1a0405', '#e8bd6b', '#5c3a08', 'low'],
  ['MAHJONG WAYS II JADE', 'Giok tua', 'Jade', '#2f7d5c', '#06231a', '#ffe08f', '#8a5a12', 'mid'],
  ['MAHJONG WAYS GOLD 2', 'Emas koin', 'Gold', '#c9962e', '#2e1d05', '#7a1010', '#3d0607', 'high'],
]

// 10 wajah tile asli (public/assets/tiles) per mesin, urut themes.js; wild = item ke-10
const SYMS = [
  ['Sou2', 'Sou3', 'Sou4', 'Pin2', 'Pin4', 'Pin8', 'Man8', 'Hatsu', 'Chun', 'Haku'],
  ['Chun', 'Hatsu', 'Man8', 'Pin9', 'Sou9', 'Pin6', 'Man5', 'Haku', 'Sou6', 'Pin3'],
  ['Chun', 'Hatsu', 'Man8', 'Pin9', 'Sou9', 'Pin6', 'Man5', 'Haku', 'Sou6', 'Pin3'],
  ['Pin6', 'Pin8', 'Pin9', 'Sou6', 'Sou8', 'Man5', 'Hatsu', 'Chun', 'Haku', 'Nan'],
  ['Chun', 'Man8', 'Man5', 'Pin9', 'Pin8', 'Sou9', 'Sou7', 'Hatsu', 'Haku', 'Ton'],
  ['Sou2', 'Sou3', 'Sou4', 'Sou5', 'Sou6', 'Sou7', 'Sou8', 'Sou9', 'Hatsu', 'Haku'],
  ['Sou4', 'Sou6', 'Sou8', 'Pin2', 'Pin5', 'Man4', 'Chun', 'Haku', 'Ton', 'Nan'],
  ['Man8', 'Man5', 'Man4', 'Chun', 'Hatsu', 'Pin8', 'Sou8', 'Haku', 'Nan', 'Ton'],
  ['Man2', 'Man4', 'Man8', 'Pin4', 'Pin6', 'Sou4', 'Sou6', 'Chun', 'Hatsu', 'Haku'],
  ['Pin2', 'Pin3', 'Pin4', 'Sou2', 'Sou3', 'Man2', 'Chun', 'Haku', 'Ton', 'Nan'],
  ['Pin9', 'Pin8', 'Sou8', 'Sou4', 'Man4', 'Man8', 'Ton', 'Nan', 'Haku', 'Hatsu'],
  ['Sou3', 'Sou5', 'Sou7', 'Pin3', 'Pin5', 'Man2', 'Haku', 'Hatsu', 'Chun', 'Ton'],
  ['Sou2', 'Sou6', 'Pin5', 'Pin9', 'Man2', 'Man5', 'Ton', 'Nan', 'Haku', 'Hatsu'],
  ['Sou2', 'Sou3', 'Sou4', 'Sou5', 'Sou6', 'Sou7', 'Sou8', 'Sou9', 'Hatsu', 'Haku'],
  ['Pin4', 'Pin8', 'Sou5', 'Sou9', 'Man8', 'Hatsu', 'Chun', 'Haku', 'Man2', 'Pin2'],
  ['Pin2', 'Pin3', 'Pin4', 'Pin5', 'Pin6', 'Pin8', 'Pin9', 'Man8', 'Chun', 'Hatsu'],
  ['Haku', 'Hatsu', 'Chun', 'Pin4', 'Pin8', 'Sou4', 'Sou8', 'Man4', 'Man8', 'Ton'],
  ['Sou9', 'Sou7', 'Pin6', 'Pin9', 'Man5', 'Man8', 'Chun', 'Hatsu', 'Haku', 'Nan'],
  ['Man5', 'Man8', 'Pin9', 'Pin8', 'Sou5', 'Sou9', 'Chun', 'Hatsu', 'Haku', 'Nan'],
  ['Ton', 'Nan', 'Man4', 'Man8', 'Pin3', 'Pin6', 'Sou3', 'Sou7', 'Chun', 'Haku'],
]
// scatter tiap mesin: naga/angin di luar pool supaya wajahnya tidak dobel
const SCAT = ['Ton', 'Ton', 'Ton', 'Ton', 'Nan', 'Chun', 'Hatsu', 'Pin9', 'Ton', 'Hatsu', 'Chun', 'Nan', 'Chun', 'Chun', 'Ton', 'Haku', 'Nan', 'Ton', 'Ton', 'Hatsu']

export const GAMES = {}
THEMES.forEach(([name, sub, tag, bg1, bg2, rib1, rib2, tier], i) => {
  const id = 'mw' + (i + 1)
  const t = TIER[tier]
  GAMES[id] = {
    id, name, sub, tag, bg: [bg1, bg2], accent: rib1, accent2: rib2, ink: '#f7f2e8', syms: SYMS[i], scatter: SCAT[i],
    fsMult: t.fsMult, scale: t.scale, pays: t.pays, weight: t.weight,
  }
})

// payout 1 sesi free spin (skala 1) per mesin — tools/fs_buy_sim.mjs
const FS_EV = {
  mw1: 140.84, mw2: 193.88, mw3: 302.96, mw4: 137.78, mw5: 200.87, mw6: 316.8,
  mw7: 131.3, mw8: 197.56, mw9: 144.59, mw10: 350.13, mw11: 193.95, mw12: 130.27,
  mw13: 309.41, mw14: 185.2, mw15: 141.21, mw16: 203.52, mw17: 313.44, mw18: 128.66,
  mw19: 192.61, mw20: 337.62,
}

// harga Beli Free Spin (dalam × bet), target RTP beli ±93%
for (const g of Object.values(GAMES)) {
  g.buy = Math.max(5, Math.ceil((g.scale * FS_EV[g.id]) / 0.93))
}

export const SYMBOLS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 'wild', 'scatter']
export const PAYABLE = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 'wild']

export function pick(weight, rnd = Math.random) {
  const keys = Object.keys(weight)
  const total = keys.reduce((a, k) => a + weight[k], 0)
  let r = rnd() * total
  for (const k of keys) {
    r -= weight[k]
    if (r <= 0) return k
  }
  return keys[keys.length - 1]
}

export function spinGrid(weight, rnd = Math.random) {
  return Array.from({ length: REELS }, () =>
    Array.from({ length: ROWS }, () => pick(weight, rnd)))
}

// ways: untuk tiap simbol, cari panjang run dari reel 0, ways = perkalian jumlah simbol per reel
export function evaluate(grid, pays, coin = 1, scale = 1) {
  const wins = []
  for (const sym of PAYABLE) {
    const counts = grid.map((col) =>
      col.filter((s) => s === sym || (sym !== 'wild' && s === 'wild')).length)
    let run = 0
    for (const c of counts) {
      if (c > 0) run++
      else break
    }
    if (run < 3) continue
    const ways = counts.slice(0, run).reduce((a, b) => a * b, 1)
    const pay = (pays[sym] || [0, 0, 0])[Math.min(run, 5) - 3]
    if (!pay) continue
    const cells = []
    for (let c = 0; c < run; c++) {
      for (let r = 0; r < ROWS; r++) {
        const s = grid[c][r]
        if (s === sym || (sym !== 'wild' && s === 'wild')) cells.push([c, r])
      }
    }
    wins.push({ sym, run, ways, pay: pay * ways * coin * scale, cells })
  }
  const scatters = grid.flat().filter((s) => s === 'scatter').length
  return { wins, scatters, total: wins.reduce((a, w) => a + w.pay, 0) }
}

// buang sel yang menang, simbol di atasnya jatuh, atas diisi simbol baru
export function cascadeDrop(grid, cells, weight, rnd = Math.random) {
  const gone = new Set(cells.map(([c, r]) => c + '-' + r))
  return grid.map((col, c) => {
    const keep = []
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!gone.has(c + '-' + r)) keep.push(col[r])
    }
    const out = new Array(ROWS)
    for (let i = 0; i < ROWS; i++) {
      out[ROWS - 1 - i] = i < keep.length ? keep[i] : pick(weight, rnd)
    }
    return out
  })
}

export function countScatters(grid) {
  let n = 0
  for (const col of grid) for (const s of col) if (s === 'scatter') n++
  return n
}

export const scatterReward = (n) => (n >= 5 ? { spins: 15, kind: 'SUPER' }
  : n === 4 ? { spins: 12, kind: 'MEGA' }
    : n === 3 ? { spins: 10, kind: 'FREE' } : null)

export const cascadeMult = (step) => CASCADE_MULT[Math.min(step, CASCADE_MULT.length - 1)]

export const fmt = (n) => Math.round(n).toLocaleString('id-ID')

export const short = (n) => {
  const v = Math.round(n)
  if (v >= 1e9) return (v / 1e9).toFixed(1).replace('.', ',') + 'B'
  if (v >= 1e6) return (v / 1e6).toFixed(1).replace('.', ',') + 'M'
  if (v >= 1e4) return (v / 1e3).toFixed(0) + 'K'
  return fmt(v)
}
