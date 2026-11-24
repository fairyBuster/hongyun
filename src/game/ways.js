// Engine "ways" ala Mahjong Ways: 5 reel x 4 baris = 1024 ways, plus cascade
// (simbol menang meledak, sisanya jatuh, multiplier naik tiap cascade).
// Paytable & RTP bikinan sendiri (aslinya di server PG Soft).

export const REELS = 5
export const ROWS = 4
export const WAYS = 1024

// multiplier cascade per langkah (langkah 1 = win pertama)
export const CASCADE_MULT = [1, 2, 3, 5, 8]

export const GAMES = {
  mw1: {
    id: 'mw1',
    name: 'Mahjong Ways',
    sub: 'Fortune Fruits',
    tag: 'Klasik',
    bg: ['#0d2a1f', '#050f0b'],
    accent: '#e8c46a',
    accent2: '#9be3b4',
    ink: '#f7efd8',
    fsMult: 2,
    scale: 0.1300,
    pays: {
      s1: [5, 12, 40], s2: [6, 15, 50], s3: [8, 20, 70], s4: [10, 30, 100],
      s5: [12, 40, 140], s6: [15, 50, 180], s7: [20, 70, 240],
      s8: [30, 120, 500], s9: [50, 200, 900], wild: [100, 400, 2000],
    },
    weight: { s1: 14, s2: 13, s3: 12, s4: 11, s5: 10, s6: 9, s7: 8, s8: 6, s9: 4, wild: 1, scatter: 2 },
  },
  mw2: {
    id: 'mw2',
    name: 'Mahjong Ways 2',
    sub: 'Animal Spirits',
    tag: 'Gacor',
    bg: ['#2a1208', '#100602'],
    accent: '#f0a63c',
    accent2: '#ffd9a0',
    ink: '#fdf1de',
    fsMult: 3,
    scale: 0.1153,
    pays: {
      s1: [4, 10, 32], s2: [5, 12, 40], s3: [7, 18, 60], s4: [9, 26, 90],
      s5: [12, 34, 120], s6: [16, 44, 160], s7: [22, 64, 220],
      s8: [34, 130, 560], s9: [60, 240, 1100], wild: [120, 500, 2500],
    },
    weight: { s1: 13, s2: 13, s3: 12, s4: 11, s5: 10, s6: 9, s7: 8, s8: 6, s9: 3, wild: 1, scatter: 2 },
  },
  mw3: {
    id: 'mw3',
    name: 'Mahjong Ways 3',
    sub: 'Zodiac Gold',
    tag: 'Jackpot',
    bg: ['#111a3a', '#05070f'],
    accent: '#9db4ff',
    accent2: '#e8d9a8',
    ink: '#eef2ff',
    fsMult: 4,
    scale: 0.0865,
    pays: {
      s1: [5, 14, 45], s2: [6, 16, 55], s3: [8, 22, 75], s4: [11, 32, 110],
      s5: [14, 44, 150], s6: [18, 55, 190], s7: [25, 75, 260],
      s8: [40, 150, 620], s9: [70, 280, 1250], wild: [140, 600, 2800],
    },
    weight: { s1: 14, s2: 13, s3: 12, s4: 11, s5: 10, s6: 9, s7: 8, s8: 5, s9: 3, wild: 1, scatter: 2 },
  },
  mw4: {
    id: 'mw4',
    name: 'Mahjong Ways 4',
    sub: 'Lucky Panda',
    tag: 'Jade',
    bg: ['#0c2b24', '#04120e'],
    accent: '#7ee0a6',
    accent2: '#d8ffe8',
    ink: '#eefaf1',
    fsMult: 2,
    scale: 0.1279,
    pays: {
      s1: [5, 12, 40], s2: [6, 15, 50], s3: [8, 20, 70], s4: [10, 30, 100],
      s5: [12, 40, 140], s6: [15, 50, 180], s7: [20, 70, 240],
      s8: [30, 120, 500], s9: [52, 205, 930], wild: [105, 410, 2050],
    },
    weight: { s1: 14, s2: 13, s3: 12, s4: 11, s5: 10, s6: 9, s7: 8, s8: 6, s9: 4, wild: 1, scatter: 2 },
  },
  mw5: {
    id: 'mw5',
    name: 'Mahjong Ways 5',
    sub: 'Ocean Fortune',
    tag: 'Samudra',
    bg: ['#0a1c34', '#03080f'],
    accent: '#74c6f2',
    accent2: '#c8ecff',
    ink: '#eaf6ff',
    fsMult: 3,
    scale: 0.1162,
    pays: {
      s1: [4, 11, 36], s2: [5, 13, 45], s3: [7, 18, 62], s4: [9, 27, 92],
      s5: [12, 36, 125], s6: [16, 46, 165], s7: [22, 66, 225],
      s8: [34, 128, 545], s9: [58, 230, 1040], wild: [115, 470, 2350],
    },
    weight: { s1: 13, s2: 13, s3: 12, s4: 11, s5: 10, s6: 9, s7: 8, s8: 6, s9: 3, wild: 1, scatter: 2 },
  },
  mw6: {
    id: 'mw6',
    name: 'Mahjong Ways 6',
    sub: 'Blossom Gold',
    tag: 'Sakura',
    bg: ['#2b0f1d', '#11040a'],
    accent: '#f79ac0',
    accent2: '#ffe0ee',
    ink: '#fff0f6',
    fsMult: 4,
    scale: 0.0853,
    pays: {
      s1: [6, 13, 44], s2: [7, 16, 54], s3: [9, 21, 74], s4: [11, 31, 108],
      s5: [14, 42, 148], s6: [18, 54, 188], s7: [24, 74, 255],
      s8: [38, 145, 600], s9: [60, 250, 1150], wild: [125, 520, 2450],
    },
    weight: { s1: 14, s2: 13, s3: 12, s4: 11, s5: 10, s6: 9, s7: 8, s8: 5, s9: 3, wild: 1, scatter: 2 },
  },
}

/* ---------------- katalog mesin tambahan (mw7..mw20) ----------------
 * Paytable & bobot dipinjam dari 3 mesin utama (tier volatilitas),
 * scale RTP-nya sama karena matematikanya identik. */
const TIER = {
  low: { pays: GAMES.mw1.pays, weight: GAMES.mw1.weight, scale: 0.1300 },
  mid: { pays: GAMES.mw2.pays, weight: GAMES.mw2.weight, scale: 0.1153 },
  high: { pays: GAMES.mw3.pays, weight: GAMES.mw3.weight, scale: 0.0865 },
}

// [id, sub, tag, accent, accent2, bg, fsMult, tier]
const MORE = [
  ['mw7', 'Butterfly Bliss', 'Kupu', '#c9a6ff', '#efe2ff', ['#1e1233', '#08040f'], 2, 'low'],
  ['mw8', 'Fortune Cat', 'Kucing', '#ffb27a', '#ffe6cf', ['#2c1608', '#0f0602'], 3, 'mid'],
  ['mw9', 'Lucky Puppy', 'Anjing', '#f5c96a', '#fff0c8', ['#2a1f06', '#0f0b02'], 2, 'low'],
  ['mw10', 'Mythic Realm', 'Mitos', '#ff8f6b', '#ffd9cc', ['#2b0d0a', '#0f0403'], 4, 'high'],
  ['mw11', 'Zodiac Wheel', 'Zodiak', '#a9b8ff', '#e2e8ff', ['#121734', '#05060f'], 3, 'mid'],
  ['mw12', 'Jade Garden', 'Hijau', '#9fe28a', '#e4ffd8', ['#10250f', '#040c04'], 2, 'low'],
  ['mw13', 'Retro Riches', 'Retro', '#ffd166', '#fff2c8', ['#26143a', '#0b0512'], 4, 'high'],
  ['mw14', 'Golden Journey', 'Jelajah', '#f0b76a', '#ffe6c2', ['#2a1a08', '#0e0702'], 3, 'mid'],
  ['mw15', 'Sweet Snack', 'Manis', '#ff9bc0', '#ffe0ee', ['#2d0f1f', '#10040a'], 2, 'low'],
  ['mw16', 'Lucky Emoji', 'Emoji', '#ffe066', '#fff8cc', ['#241f05', '#0c0a02'], 3, 'mid'],
  ['mw17', 'Animal Kingdom', 'Satwa', '#d9b382', '#f4e2c8', ['#26190c', '#0c0703'], 4, 'high'],
  ['mw18', 'Beauty Gold', 'Glow', '#ff9ed8', '#ffe2f2', ['#2a0f22', '#0d040b'], 2, 'low'],
  ['mw19', 'Mahjong Classic', 'Suit', '#e8c46a', '#fff0c8', ['#0d2a1f', '#050f0b'], 3, 'mid'],
  ['mw20', 'Retro Neon', 'Neon', '#7df0e0', '#d6fff8', ['#0a2430', '#02080c'], 4, 'high'],
]

for (const [id, sub, tag, accent, accent2, bg, fsMult, tier] of MORE) {
  GAMES[id] = {
    id, name: `Mahjong Ways ${id.slice(2)}`, sub, tag, bg, accent, accent2,
    ink: '#f7f2e8', fsMult, scale: TIER[tier].scale,
    pays: TIER[tier].pays, weight: TIER[tier].weight,
  }
}

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
