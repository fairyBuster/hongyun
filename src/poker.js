/* ---------- mesin kartu & dadu untuk permainan PVC ----------
   Semua fungsi murni (tanpa efek samping) supaya mudah diuji.
   Kartu: { id, r: 2..14 (14 = As), s: 'S' | 'H' | 'D' | 'C' } */

export const SUITS = { S: '\u2660', H: '\u2665', D: '\u2666', C: '\u2663' }
export const SUIT_NAME = { S: 'Sekop', H: 'Hati', D: 'Wajik', C: 'Keriting' }
export const RANK_TEXT = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: 'J', 12: 'Q', 13: 'K', 14: 'A',
}

export const cardText = (c) => RANK_TEXT[c.r] + SUITS[c.s]
export const isRed = (c) => c.s === 'H' || c.s === 'D'

/* 52 kartu baru, urut per suit lalu rank */
export function newDeck() {
  const deck = []
  for (const s of ['S', 'H', 'D', 'C']) {
    for (let r = 2; r <= 14; r += 1) deck.push({ id: s + r, r, s })
  }
  return deck
}

/* Fisher-Yates; mengembalikan array baru */
export function shuffle(deck) {
  const out = deck.slice()
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = out[i]
    out[i] = out[j]
    out[j] = t
  }
  return out
}

export const draw = (deck, n) => deck.splice(deck.length - n, n)

/* ---------- evaluasi 5 kartu ---------- */
const byRankDesc = (a, b) => b.r - a.r

function straightHigh(ranks) {
  const uniq = [...new Set(ranks)].sort((a, b) => a - b)
  if (uniq.length !== 5) return 0
  if (uniq[4] - uniq[0] === 4) return uniq[4]
  /* roda: A-2-3-4-5 dihitung straight lima tinggi */
  if (uniq[0] === 2 && uniq[1] === 3 && uniq[2] === 4 && uniq[3] === 5 && uniq[4] === 14) return 5
  return 0
}

/* hasil: { cat, name, kickers } — cat makin besar makin kuat */
export function evaluate5(cards) {
  if (!cards || cards.length !== 5) throw new Error('evaluate5 butuh 5 kartu')
  const ranks = cards.map((c) => c.r)
  const sorted = ranks.slice().sort((a, b) => b - a)
  const flush = cards.every((c) => c.s === cards[0].s)
  const high = straightHigh(ranks)

  const count = {}
  for (const r of ranks) count[r] = (count[r] || 0) + 1
  const groups = Object.keys(count)
    .map((r) => ({ r: Number(r), n: count[r] }))
    .sort((a, b) => b.n - a.n || b.r - a.r)

  if (flush && high) {
    return {
      cat: 8,
      name: high === 14 ? 'Royal Flush' : 'Straight Flush',
      kickers: [high],
    }
  }
  if (groups[0].n === 4) {
    return { cat: 7, name: 'Four of a Kind', kickers: [groups[0].r, groups[1].r] }
  }
  if (groups[0].n === 3 && groups[1].n === 2) {
    return { cat: 6, name: 'Full House', kickers: [groups[0].r, groups[1].r] }
  }
  if (flush) return { cat: 5, name: 'Flush', kickers: sorted }
  if (high) return { cat: 4, name: 'Straight', kickers: [high] }
  if (groups[0].n === 3) {
    const rest = groups.filter((g) => g.n === 1).map((g) => g.r).sort((a, b) => b - a)
    return { cat: 3, name: 'Three of a Kind', kickers: [groups[0].r, ...rest] }
  }
  if (groups[0].n === 2 && groups[1].n === 2) {
    const pairs = [groups[0].r, groups[1].r].sort((a, b) => b - a)
    const kicker = groups.find((g) => g.n === 1).r
    return { cat: 2, name: 'Two Pair', kickers: [pairs[0], pairs[1], kicker] }
  }
  if (groups[0].n === 2) {
    const rest = groups.filter((g) => g.n === 1).map((g) => g.r).sort((a, b) => b - a)
    return { cat: 1, name: 'Pair', kickers: [groups[0].r, ...rest] }
  }
  return { cat: 0, name: 'High Card', kickers: sorted }
}

/* +1 kalau a lebih kuat, -1 kalau b lebih kuat, 0 seri */
export function cmpHand(a, b) {
  if (a.cat !== b.cat) return a.cat > b.cat ? 1 : -1
  const n = Math.max(a.kickers.length, b.kickers.length)
  for (let i = 0; i < n; i += 1) {
    const x = a.kickers[i] || 0
    const y = b.kickers[i] || 0
    if (x !== y) return x > y ? 1 : -1
  }
  return 0
}

/* kombinasi 5 dari 7 kartu, ambil yang terbaik */
export function evaluate7(cards) {
  if (!cards || cards.length !== 7) throw new Error('evaluate7 butuh 7 kartu')
  let best = null
  let bestCards = null
  for (let a = 0; a < 3; a += 1) {
    for (let b = a + 1; b < 4; b += 1) {
      for (let c = b + 1; c < 5; c += 1) {
        for (let d = c + 1; d < 6; d += 1) {
          for (let e = d + 1; e < 7; e += 1) {
            const five = [cards[a], cards[b], cards[c], cards[d], cards[e]]
            const hand = evaluate5(five)
            if (!best || cmpHand(hand, best) > 0) {
              best = hand
              bestCards = five.slice().sort(byRankDesc)
            }
          }
        }
      }
    }
  }
  return { ...best, best: bestCards }
}

/* ---------- evaluasi 3 kartu (Three Card Poker) ---------- */
export function evaluate3(cards) {
  if (!cards || cards.length !== 3) throw new Error('evaluate3 butuh 3 kartu')
  const ranks = cards.map((c) => c.r)
  const sorted = ranks.slice().sort((a, b) => b - a)
  const flush = cards.every((c) => c.s === cards[0].s)
  const uniq = [...new Set(ranks)].sort((a, b) => a - b)
  let high = 0
  if (uniq.length === 3 && uniq[2] - uniq[0] === 2) high = uniq[2]
  else if (uniq.length === 3 && uniq[0] === 2 && uniq[1] === 3 && uniq[2] === 14) high = 3

  const count = {}
  for (const r of ranks) count[r] = (count[r] || 0) + 1
  const groups = Object.keys(count)
    .map((r) => ({ r: Number(r), n: count[r] }))
    .sort((a, b) => b.n - a.n || b.r - a.r)

  if (flush && high) return { cat: 5, name: 'Straight Flush', kickers: [high] }
  if (groups[0].n === 3) return { cat: 4, name: 'Three of a Kind', kickers: [groups[0].r] }
  if (high) return { cat: 3, name: 'Straight', kickers: [high] }
  if (flush) return { cat: 2, name: 'Flush', kickers: sorted }
  if (groups[0].n === 2) {
    const kicker = groups.find((g) => g.n === 1).r
    return { cat: 1, name: 'Pair', kickers: [groups[0].r, kicker] }
  }
  return { cat: 0, name: 'High Card', kickers: sorted }
}

/* ---------- dadu poker ---------- */
export const DIE_FACES = [1, 2, 3, 4, 5, 6]

export function rollDice(n = 5) {
  return Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 6))
}

/* hasil: { cat, name, ranks, vals } — vals urut untuk tampilan */
export function diceHand(vals) {
  const dice = vals.slice().sort((a, b) => a - b)
  const count = {}
  for (const v of dice) count[v] = (count[v] || 0) + 1
  const groups = Object.keys(count)
    .map((v) => ({ v: Number(v), n: count[v] }))
    .sort((a, b) => b.n - a.n || b.v - a.v)
  const seq = dice.join('')
  const straight = seq === '12345' || seq === '23456'

  if (groups[0].n === 5) {
    return { cat: 7, name: 'Five of a Kind', ranks: [groups[0].v], vals: dice }
  }
  if (groups[0].n === 4) {
    return { cat: 6, name: 'Four of a Kind', ranks: [groups[0].v, groups[1].v], vals: dice }
  }
  if (groups[0].n === 3 && groups[1].n === 2) {
    return { cat: 5, name: 'Full House', ranks: [groups[0].v, groups[1].v], vals: dice }
  }
  if (straight) {
    /* 1-2-3-4-5 kalah dari 2-3-4-5-6 */
    return { cat: 4, name: 'Straight', ranks: [dice[4]], vals: dice }
  }
  if (groups[0].n === 3) {
    const rest = groups.filter((g) => g.n === 1).map((g) => g.v).sort((a, b) => b - a)
    return { cat: 3, name: 'Three of a Kind', ranks: [groups[0].v, ...rest], vals: dice }
  }
  if (groups[0].n === 2 && groups[1].n === 2) {
    const pairs = [groups[0].v, groups[1].v].sort((a, b) => b - a)
    const kicker = groups.find((g) => g.n === 1).v
    return { cat: 2, name: 'Two Pair', ranks: [pairs[0], pairs[1], kicker], vals: dice }
  }
  if (groups[0].n === 2) {
    const rest = groups.filter((g) => g.n === 1).map((g) => g.v).sort((a, b) => b - a)
    return { cat: 1, name: 'Pair', ranks: [groups[0].v, ...rest], vals: dice }
  }
  return { cat: 0, name: 'High Card', ranks: dice.slice().reverse(), vals: dice }
}

export function cmpDice(a, b) {
  if (a.cat !== b.cat) return a.cat > b.cat ? 1 : -1
  const n = Math.max(a.ranks.length, b.ranks.length)
  for (let i = 0; i < n; i += 1) {
    const x = a.ranks[i] || 0
    const y = b.ranks[i] || 0
    if (x !== y) return x > y ? 1 : -1
  }
  return 0
}

/* ---------- tabel bayar Video Poker (Jacks or Better) ----------
   pengali terhadap taruhan; 0 = tidak menang */
export function videoPayout(hand) {
  if (!hand) return 0
  if (hand.cat === 8) return hand.kickers[0] === 14 ? 250 : 50
  if (hand.cat === 7) return 25
  if (hand.cat === 6) return 9
  if (hand.cat === 5) return 6
  if (hand.cat === 4) return 4
  if (hand.cat === 3) return 3
  if (hand.cat === 2) return 2
  if (hand.cat === 1) return hand.kickers[0] >= 11 ? 1 : 0
  return 0
}
