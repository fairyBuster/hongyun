import React, { useEffect, useRef, useState } from 'react'
import { Customer, IconSprite, NavBar, TabBar } from '../components/Chrome.jsx'
import { ARCADE, rupiah } from '../data.js'
import { activeAccount, read, timeText, userKey, write } from '../logic.js'
import {
  RANK_TEXT,
  SUITS,
  cmpDice,
  cmpHand,
  diceHand,
  draw,
  evaluate3,
  evaluate5,
  evaluate7,
  isRed,
  newDeck,
  rollDice,
  shuffle,
  videoPayout,
} from '../poker.js'
import '../arcade.css'
import '../poker.css'

const STAKES = [1000, 5000, 10000, 25000, 50000]
const HKEY = () => userKey(activeAccount(), 'f55.pvc')
const GTYPE = {
  'pvc-videopoker': 'video',
  'pvc-threecard': 'three',
  'pvc-caribbean': 'stud',
  'pvc-holdem': 'holdem',
  'pvc-dice': 'dice',
}

const histOf = (gid) => (read(HKEY(), {}) || {})[gid] || []
const pushHist = (gid, item) => {
  const all = read(HKEY(), {}) || {}
  all[gid] = [item, ...(all[gid] || [])].slice(0, 12)
  write(HKEY(), all)
  return all[gid]
}

/* ---------- komponen bersama ---------- */
function StakeBar({ bet, setBet, locked }) {
  return (
    <div className="arc-stakes">
      {STAKES.map((v) => (
        <button
          key={v}
          type="button"
          className={'arc-stake' + (bet === v ? ' on' : '')}
          disabled={locked}
          onClick={() => setBet(v)}
        >
          {v / 1000}K
        </button>
      ))}
    </div>
  )
}

function History({ items, empty }) {
  return (
    <section className="arc-panel">
      <div className="arc-panel__head">
        <b>Riwayat</b>
        <span>{items.length}/12</span>
      </div>
      {items.length ? (
        <div className="arc-hist">
          {items.map((h, i) => (
            <div className="arc-hist__row" key={h.at + '-' + i}>
              <span className="arc-hist__time">{timeText(h.at)}</span>
              <span className="arc-hist__mid">
                {h.pick}
                <em>{h.mode}</em>
              </span>
              <b className={h.win > 0 ? 'in' : h.win < 0 ? 'out' : 'flat'}>
                {h.win > 0 ? '+' + rupiah(h.win) : h.win < 0 ? '-' + rupiah(-h.win) : 'Seri'}
              </b>
            </div>
          ))}
        </div>
      ) : (
        <p className="arc-empty">{empty}</p>
      )}
    </section>
  )
}

function Card({ c, held, onClick, disabled }) {
  const Tag = onClick ? 'button' : 'span'
  const back = c === 'back'
  const slot = c === null || c === undefined
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={
        'pc-card' +
        (back ? ' back' : '') +
        (slot ? ' slot' : '') +
        (held ? ' held' : '') +
        (!slot && !back && isRed(c) ? ' red' : '')
      }
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
      data-suit={!slot && !back ? SUITS[c.s] : undefined}
      aria-label={slot || back ? 'Kartu tertutup' : RANK_TEXT[c.r] + ' ' + SUITS[c.s]}
    >
      {!slot && !back ? (
        <>
          <b>{RANK_TEXT[c.r]}</b>
          <i>{SUITS[c.s]}</i>
          {held ? <em>SIMPAN</em> : null}
        </>
      ) : null}
    </Tag>
  )
}

function HandRow({ label, cards, hand, tone }) {
  return (
    <div className={'pc-hand' + (tone ? ' ' + tone : '')}>
      <div className="pc-hand__top">
        <span>{label}</span>
        {hand ? <b>{hand}</b> : null}
      </div>
      <div className="pc-cards">
        {(cards || []).map((c, i) => (
          <Card key={(c && c.id) || 'c' + i} c={c} />
        ))}
      </div>
    </div>
  )
}

const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

function Die({ v, hidden, on, onClick, disabled }) {
  return (
    <button
      type="button"
      className={'pc-die' + (on ? ' on' : '') + (hidden ? ' back' : '')}
      onClick={onClick}
      disabled={disabled}
      aria-label={hidden ? 'Dadu tertutup' : 'Dadu ' + v}
    >
      {hidden ? (
        <b>?</b>
      ) : (
        <span className="pc-die__grid">
          {Array.from({ length: 9 }, (_, i) => (
            <i key={i} className={PIPS[v] && PIPS[v].includes(i) ? 'p' : ''} />
          ))}
        </span>
      )}
    </button>
  )
}

function ResultOverlay({ result, onAgain, onClose }) {
  if (!result) return null
  const label = result.kind === 'win' ? 'MENANG' : result.kind === 'lose' ? 'KALAH' : 'SERI'
  return (
    <div className={'pc-overlay ' + result.kind} role="dialog" aria-modal="true" aria-label={label}>
      <div className="pc-overlay__box">
        <em>{label}</em>
        <b>{result.net > 0 ? '+' + rupiah(result.net) : result.net < 0 ? '-' + rupiah(-result.net) : 'Taruhan kembali'}</b>
        <p>{result.note}</p>
        {result.detail ? <small>{result.detail}</small> : null}
        <div className="pc-overlay__btns">
          <button type="button" className="arc-cta" onClick={onAgain}>
            Main Lagi
          </button>
          <button type="button" className="pc-ghost" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

function Setup({ title, stake, hint, bet, setBet, locked }) {
  return (
    <section className="arc-panel">
      <div className="arc-panel__head">
        <b>{title}</b>
        <span>Taruhan {rupiah(stake)}</span>
      </div>
      <StakeBar bet={bet} setBet={setBet} locked={locked} />
      <p className="arc-note">{hint}</p>
    </section>
  )
}

function Table({ children }) {
  return <section className="pc-table">{children}</section>
}

/* ---------- 1. Video Poker: Jacks or Better ---------- */
const VP_ROWS = [
  { label: 'Royal Flush', x: 250, hit: (h) => h.cat === 8 && h.kickers[0] === 14 },
  { label: 'Straight Flush', x: 50, hit: (h) => h.cat === 8 && h.kickers[0] !== 14 },
  { label: 'Four of a Kind', x: 25, hit: (h) => h.cat === 7 },
  { label: 'Full House', x: 9, hit: (h) => h.cat === 6 },
  { label: 'Flush', x: 6, hit: (h) => h.cat === 5 },
  { label: 'Straight', x: 4, hit: (h) => h.cat === 4 },
  { label: 'Three of a Kind', x: 3, hit: (h) => h.cat === 3 },
  { label: 'Two Pair', x: 2, hit: (h) => h.cat === 2 },
  { label: 'Jacks or Better', x: 1, hit: (h) => h.cat === 1 && h.kickers[0] >= 11 },
]

function PayTable({ hand }) {
  return (
    <div className="pc-pay">
      {VP_ROWS.map((r) => (
        <div key={r.label} className={hand && r.hit(hand) ? 'on' : ''}>
          <span>{r.label}</span>
          <b>×{r.x}</b>
        </div>
      ))}
    </div>
  )
}

function VideoPoker({ toast, balance, setBalance, bet, setBet }) {
  const stake = Number(bet) || STAKES[0]
  const [phase, setPhase] = useState('idle')
  const [cards, setCards] = useState([])
  const [held, setHeld] = useState([])
  const [hand, setHand] = useState(null)
  const [result, setResult] = useState(null)
  const [hist, setHist] = useState(() => histOf('pvc-videopoker'))
  const deck = useRef([])

  const start = () => {
    if (phase === 'draw') return
    if (stake > balance) return toast('Saldo tidak cukup, silakan deposit')
    setBalance((b) => b - stake)
    deck.current = shuffle(newDeck())
    setCards(draw(deck.current, 5))
    setHeld([false, false, false, false, false])
    setHand(null)
    setResult(null)
    setPhase('draw')
  }

  const toggle = (i) => {
    if (phase !== 'draw') return
    setHeld((h) => h.map((v, k) => (k === i ? !v : v)))
  }

  const exchange = () => {
    if (phase !== 'draw') return
    const next = cards.map((c, i) => (held[i] ? c : draw(deck.current, 1)[0]))
    const h = evaluate5(next)
    const mult = videoPayout(h)
    const credit = mult * stake
    setCards(next)
    setHand(h)
    setBalance((b) => b + credit)
    const entry = { at: Date.now(), mode: 'Video Poker', pick: h.name, stake, win: credit - stake }
    const kind = credit > stake ? 'win' : credit === stake ? 'push' : 'lose'
    setHist(pushHist('pvc-videopoker', entry))
    setResult({
      kind,
      net: credit - stake,
      note: mult ? h.name + ' · bayaran ×' + mult : h.name + ' · belum membayar',
      detail: 'Taruhan ' + rupiah(stake) + ' · kembali ' + rupiah(credit),
    })
    setPhase('done')
    toast(kind === 'win' ? 'Menang ' + rupiah(credit) : kind === 'push' ? 'Seri, taruhan kembali' : 'Belum beruntung, coba lagi')
  }

  return (
    <>
      <Setup
        title="Video Poker"
        stake={stake}
        bet={bet}
        setBet={setBet}
        locked={phase === 'draw'}
        hint={phase === 'draw' ? 'Klik kartu untuk menandai SIMPAN, lalu tukar sisanya.' : 'Bagikan lima kartu, simpan yang bagus, tukar sisanya.'}
      />
      <Table>
        <div className="pc-table__label">JACKS OR BETTER</div>
        <div className="pc-cards pc-cards--big">
          {cards.length
            ? cards.map((c, i) => (
                <Card key={c.id} c={c} held={held[i]} onClick={() => toggle(i)} disabled={phase !== 'draw'} />
              ))
            : [0, 1, 2, 3, 4].map((i) => <Card key={i} c={null} />)}
        </div>
        <div className="pc-handline">
          <span>Kartu Anda</span>
          <b>{hand ? hand.name : phase === 'draw' ? 'Pilih kartu yang disimpan' : 'Tekan bagikan untuk mulai'}</b>
        </div>
        <div className="pc-actions">
          {phase === 'draw' ? (
            <button type="button" className="arc-cta" onClick={exchange}>
              Tukar Kartu {held.some(Boolean) ? '(simpan ' + held.filter(Boolean).length + ')' : ''}
            </button>
          ) : (
            <button type="button" className="arc-cta" onClick={start}>
              {phase === 'done' ? 'Bagikan Lagi · ' + rupiah(stake) : 'Bagikan Kartu · ' + rupiah(stake)}
            </button>
          )}
        </div>
      </Table>
      <section className="arc-panel">
        <div className="arc-panel__head">
          <b>Tabel Bayaran</b>
          <span>× taruhan</span>
        </div>
        <PayTable hand={hand} />
      </section>
      <History items={hist} empty="Belum ada permainan video poker." />
      <ResultOverlay
        result={result}
        onAgain={() => {
          setResult(null)
          start()
        }}
        onClose={() => setResult(null)}
      />
    </>
  )
}

/* ---------- 2. Three Card Poker ---------- */
function ThreeCard({ toast, balance, setBalance, bet, setBet }) {
  const stake = Number(bet) || STAKES[0]
  const [phase, setPhase] = useState('idle')
  const [player, setPlayer] = useState([])
  const [dealer, setDealer] = useState([])
  const [result, setResult] = useState(null)
  const [hist, setHist] = useState(() => histOf('pvc-threecard'))
  const ph = useRef(null)
  const dh = useRef(null)

  const start = () => {
    if (phase === 'decide') return
    if (stake > balance) return toast('Saldo tidak cukup, silakan deposit')
    setBalance((b) => b - stake)
    const deck = shuffle(newDeck())
    const p = draw(deck, 3)
    const d = draw(deck, 3)
    ph.current = evaluate3(p)
    dh.current = evaluate3(d)
    setPlayer(p)
    setDealer(d)
    setResult(null)
    setPhase('decide')
  }

  const settle = (credit, kind, note, paid) => {
    setBalance((b) => b + credit)
    setPhase('done')
    const entry = { at: Date.now(), mode: 'Three Card', pick: ph.current.name, stake: paid, win: credit - paid }
    setHist(pushHist('pvc-threecard', entry))
    setResult({
      kind,
      net: credit - paid,
      note,
      detail: 'Anda: ' + ph.current.name + ' · Bandar: ' + dh.current.name,
    })
  }

  const fold = () => {
    if (phase !== 'decide') return
    setPhase('done')
    const entry = { at: Date.now(), mode: 'Three Card', pick: 'Lipat', stake, win: -stake }
    setHist(pushHist('pvc-threecard', entry))
    setResult({
      kind: 'lose',
      net: -stake,
      note: 'Anda melipat. Ante hangus.',
      detail: 'Kartu bandar: ' + dh.current.name,
    })
  }

  const call = () => {
    if (phase !== 'decide') return
    if (stake > balance) return toast('Saldo tidak cukup untuk Call')
    setBalance((b) => b - stake)
    const paid = stake * 2
    const p = ph.current
    const d = dh.current
    const qualify = d.cat >= 1 || (d.cat === 0 && d.kickers[0] >= 12)
    const bonus = p.cat === 5 ? 5 : p.cat === 4 ? 4 : p.cat === 3 ? 1 : 0
    let credit = 0
    let kind = 'lose'
    let note = ''
    if (!qualify) {
      credit = stake * 3 + bonus * stake
      kind = 'win'
      note = 'Bandar tidak lolos syarat Q tinggi. Ante dibayar 1:1, Play kembali.'
    } else {
      const c = cmpHand(p, d)
      if (c > 0) {
        credit = stake * 4 + bonus * stake
        kind = 'win'
        note = 'Kartu Anda mengalahkan bandar.'
      } else if (c === 0) {
        credit = paid
        kind = 'push'
        note = 'Kartu seri, taruhan dikembalikan.'
      } else {
        note = 'Kartu bandar lebih tinggi.'
      }
    }
    if (bonus) note += ' Bonus ' + bonus + '× dibayar dari ante.'
    settle(credit, kind, note, paid)
    toast(kind === 'win' ? 'Menang ' + rupiah(credit) + ' di Three Card' : kind === 'push' ? 'Seri, taruhan kembali' : 'Kalah, coba lagi')
  }

  return (
    <>
      <Setup
        title="Three Card Poker"
        stake={stake}
        bet={bet}
        setBet={setBet}
        locked={phase === 'decide'}
        hint="Bandar wajib Q tinggi atau lebih. Straight, Three of a Kind, dan Straight Flush dapat bonus dari ante."
      />
      <Table>
        <HandRow
          label="BANDAR"
          cards={phase === 'decide' ? ['back', 'back', 'back'] : dealer}
          hand={phase === 'decide' ? null : dh.current ? dh.current.name : null}
        />
        <div className="pc-vs">VS</div>
        <HandRow
          label="ANDA"
          cards={player.length ? player : [null, null, null]}
          hand={player.length ? ph.current.name : null}
          tone="mine"
        />
        <div className="pc-actions">
          {phase === 'decide' ? (
            <>
              <button type="button" className="pc-ghost" onClick={fold}>
                Lipat
              </button>
              <button type="button" className="arc-cta" onClick={call}>
                Call 1× · {rupiah(stake)}
              </button>
            </>
          ) : (
            <button type="button" className="arc-cta" onClick={start}>
              {phase === 'done' ? 'Bagikan Lagi · ' + rupiah(stake) : 'Bagikan Kartu · ' + rupiah(stake)}
            </button>
          )}
        </div>
        <p className="pc-mini">Ante sudah dipotong saat kartu dibagikan. Call menambah taruhan yang sama.</p>
      </Table>
      <History items={hist} empty="Belum ada permainan three card." />
      <ResultOverlay
        result={result}
        onAgain={() => {
          setResult(null)
          start()
        }}
        onClose={() => setResult(null)}
      />
    </>
  )
}

/* ---------- 3. Caribbean Stud ---------- */
const STUD_ROWS = [
  ['Royal Flush', 100],
  ['Straight Flush', 50],
  ['Four of a Kind', 20],
  ['Full House', 7],
  ['Flush', 5],
  ['Straight', 4],
  ['Three of a Kind', 3],
  ['Two Pair', 2],
  ['Pair atau lebih rendah', 1],
]

const studMult = (h) => {
  if (h.cat === 8) return h.kickers[0] === 14 ? 100 : 50
  if (h.cat === 7) return 20
  if (h.cat === 6) return 7
  if (h.cat === 5) return 5
  if (h.cat === 4) return 4
  if (h.cat === 3) return 3
  if (h.cat === 2) return 2
  return 1
}

function Caribbean({ toast, balance, setBalance, bet, setBet }) {
  const stake = Number(bet) || STAKES[0]
  const [phase, setPhase] = useState('idle')
  const [player, setPlayer] = useState([])
  const [dealer, setDealer] = useState([])
  const [result, setResult] = useState(null)
  const [hist, setHist] = useState(() => histOf('pvc-caribbean'))
  const ph = useRef(null)
  const dh = useRef(null)

  const start = () => {
    if (phase === 'decide') return
    if (stake > balance) return toast('Saldo tidak cukup, silakan deposit')
    setBalance((b) => b - stake)
    const deck = shuffle(newDeck())
    const p = draw(deck, 5)
    const d = draw(deck, 5)
    ph.current = evaluate5(p)
    dh.current = evaluate5(d)
    setPlayer(p)
    setDealer(d)
    setResult(null)
    setPhase('decide')
  }

  const finish = (credit, kind, note, paid) => {
    setBalance((b) => b + credit)
    setPhase('done')
    const entry = { at: Date.now(), mode: 'Caribbean Stud', pick: ph.current.name, stake: paid, win: credit - paid }
    setHist(pushHist('pvc-caribbean', entry))
    setResult({
      kind,
      net: credit - paid,
      note,
      detail: 'Anda: ' + ph.current.name + ' · Bandar: ' + dh.current.name,
    })
  }

  const fold = () => {
    if (phase !== 'decide') return
    setPhase('done')
    const entry = { at: Date.now(), mode: 'Caribbean Stud', pick: 'Lipat', stake, win: -stake }
    setHist(pushHist('pvc-caribbean', entry))
    setResult({
      kind: 'lose',
      net: -stake,
      note: 'Anda melipat. Ante hangus.',
      detail: 'Kartu bandar: ' + dh.current.name,
    })
  }

  const call = () => {
    if (phase !== 'decide') return
    if (stake * 2 > balance) return toast('Saldo tidak cukup untuk Call 2×')
    setBalance((b) => b - stake * 2)
    const paid = stake * 3
    const p = ph.current
    const d = dh.current
    const qualify = d.cat >= 1 || (d.cat === 0 && d.kickers[0] === 14 && d.kickers[1] === 13)
    let credit = 0
    let kind = 'lose'
    let note = ''
    if (!qualify) {
      credit = stake * 4
      kind = 'win'
      note = 'Bandar tidak lolos A-K tinggi. Ante dibayar 1:1, Call kembali.'
    } else {
      const c = cmpHand(p, d)
      if (c > 0) {
        const mult = studMult(p)
        credit = stake * 5 + mult * stake
        kind = 'win'
        note = 'Ante dibayar ' + mult + ':1, Call dibayar 1:1.'
      } else if (c === 0) {
        credit = paid
        kind = 'push'
        note = 'Kartu seri, taruhan dikembalikan.'
      } else {
        note = 'Kartu bandar lebih tinggi.'
      }
    }
    finish(credit, kind, note, paid)
    toast(kind === 'win' ? 'Menang ' + rupiah(credit) + ' di Caribbean Stud' : kind === 'push' ? 'Seri, taruhan kembali' : 'Kalah, coba lagi')
  }

  return (
    <>
      <Setup
        title="Caribbean Stud"
        stake={stake}
        bet={bet}
        setBet={setBet}
        locked={phase === 'decide'}
        hint="Satu kartu bandar terbuka. Bandar wajib A-K tinggi; Call menambah dua kali ante."
      />
      <Table>
        <HandRow
          label="BANDAR"
          cards={phase === 'decide' ? [dealer[0], 'back', 'back', 'back', 'back'] : dealer}
          hand={phase === 'decide' ? 'Kartu terbuka: ' + (dealer[0] ? RANK_TEXT[dealer[0].r] : '-') : dh.current ? dh.current.name : null}
        />
        <div className="pc-vs">VS</div>
        <HandRow label="ANDA" cards={player.length ? player : [null, null, null, null, null]} hand={player.length ? ph.current.name : null} tone="mine" />
        <div className="pc-actions">
          {phase === 'decide' ? (
            <>
              <button type="button" className="pc-ghost" onClick={fold}>
                Lipat
              </button>
              <button type="button" className="arc-cta" onClick={call}>
                Call 2× · {rupiah(stake * 2)}
              </button>
            </>
          ) : (
            <button type="button" className="arc-cta" onClick={start}>
              {phase === 'done' ? 'Bagikan Lagi · ' + rupiah(stake) : 'Bagikan Kartu · ' + rupiah(stake)}
            </button>
          )}
        </div>
        <p className="pc-mini">Ante dipotong saat kartu dibagikan; Call 2× dipotong saat memutuskan.</p>
      </Table>
      <section className="arc-panel">
        <div className="arc-panel__head">
          <b>Bayaran Ante</b>
          <span>hanya jika menang</span>
        </div>
        <div className="pc-pay">
          {STUD_ROWS.map(([label, x]) => (
            <div key={label}>
              <span>{label}</span>
              <b>{x}:1</b>
            </div>
          ))}
        </div>
      </section>
      <History items={hist} empty="Belum ada permainan Caribbean Stud." />
      <ResultOverlay
        result={result}
        onAgain={() => {
          setResult(null)
          start()
        }}
        onClose={() => setResult(null)}
      />
    </>
  )
}

/* ---------- 4. Texas Hold'em Duel ---------- */
function Holdem({ toast, balance, setBalance, bet, setBet }) {
  const stake = Number(bet) || STAKES[0]
  const [phase, setPhase] = useState('idle')
  const [hole, setHole] = useState([])
  const [dealer, setDealer] = useState([])
  const [board, setBoard] = useState([])
  const [shown, setShown] = useState(0)
  const [result, setResult] = useState(null)
  const [hist, setHist] = useState(() => histOf('pvc-holdem'))
  const holeRef = useRef([])
  const dealerRef = useRef([])
  const boardRef = useRef([])
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const start = () => {
    if (phase === 'decide' || phase === 'runout') return
    if (stake > balance) return toast('Saldo tidak cukup, silakan deposit')
    timers.current.forEach(clearTimeout)
    timers.current = []
    setBalance((b) => b - stake)
    const deck = shuffle(newDeck())
    const p = draw(deck, 2)
    const d = draw(deck, 2)
    const b = draw(deck, 5)
    holeRef.current = p
    dealerRef.current = d
    boardRef.current = b
    setHole(p)
    setDealer(d)
    setBoard(b)
    setShown(0)
    setResult(null)
    setPhase('decide')
  }

  const settle = () => {
    const p = evaluate7([...holeRef.current, ...boardRef.current])
    const d = evaluate7([...dealerRef.current, ...boardRef.current])
    const c = cmpHand(p, d)
    const paid = stake * 2
    const pot = stake * 4
    const rake = Math.round(pot * 0.05)
    let credit = 0
    let kind = 'lose'
    let note = ''
    if (c > 0) {
      credit = pot - rake
      kind = 'win'
      note = 'Kartu Anda menang, pot dibayarkan setelah rake 5%.'
    } else if (c === 0) {
      credit = paid
      kind = 'push'
      note = 'Kartu seri, taruhan dikembalikan.'
    } else {
      note = 'Kartu bandar lebih tinggi.'
    }
    setBalance((x) => x + credit)
    setPhase('done')
    const entry = { at: Date.now(), mode: "Hold'em Duel", pick: p.name, stake: paid, win: credit - paid }
    setHist(pushHist('pvc-holdem', entry))
    setResult({
      kind,
      net: credit - paid,
      note,
      detail: 'Anda: ' + p.name + ' · Bandar: ' + d.name + ' · Pot ' + rupiah(pot),
    })
    toast(kind === 'win' ? 'Menang ' + rupiah(credit) + ' di Hold\'em Duel' : kind === 'push' ? 'Seri, taruhan kembali' : 'Kalah, coba lagi')
  }

  const fold = () => {
    if (phase !== 'decide') return
    setPhase('done')
    const entry = { at: Date.now(), mode: "Hold'em Duel", pick: 'Lipat', stake, win: -stake }
    setHist(pushHist('pvc-holdem', entry))
    setResult({
      kind: 'lose',
      net: -stake,
      note: 'Anda melipat. Ante hangus.',
    })
  }

  const call = () => {
    if (phase !== 'decide') return
    if (stake > balance) return toast('Saldo tidak cukup untuk Call')
    setBalance((b) => b - stake)
    setPhase('runout')
    const steps = [
      [500, 3],
      [1050, 4],
      [1600, 5],
      [2300, null],
    ]
    steps.forEach(([at, n]) => {
      timers.current.push(
        setTimeout(() => {
          if (n === null) settle()
          else setShown(n)
        }, at),
      )
    })
  }

  const reveal = phase === 'done'
  return (
    <>
      <Setup
        title="Texas Hold'em Duel"
        stake={stake}
        bet={bet}
        setBet={setBet}
        locked={phase === 'decide' || phase === 'runout'}
        hint="Dua kartu hole, lima kartu meja. Lipat atau Call 1×; pot dipotong rake 5% saat menang."
      />
      <Table>
        <HandRow label="BANDAR" cards={dealer.length ? (reveal ? dealer : ['back', 'back']) : [null, null]} hand={reveal ? 'Kartu bandar' : null} />
        <div className="pc-board">
          <span>MEJA</span>
          <div className="pc-cards">
            {(board.length ? board : [null, null, null, null, null]).map((c, i) => (
              <Card key={(c && c.id) || 'b' + i} c={i < shown ? c : null} />
            ))}
          </div>
          <em>{shown === 0 ? 'Belum ada kartu' : shown === 3 ? 'Flop' : shown === 4 ? 'Turn' : 'River'}</em>
        </div>
        <HandRow label="ANDA" cards={hole.length ? hole : [null, null]} hand={reveal && shown === 5 && hole.length ? evaluate7([...hole, ...board]).name : null} tone="mine" />
        <div className="pc-actions">
          {phase === 'decide' ? (
            <>
              <button type="button" className="pc-ghost" onClick={fold}>
                Lipat
              </button>
              <button type="button" className="arc-cta" onClick={call}>
                Call 1× · {rupiah(stake)}
              </button>
            </>
          ) : phase === 'runout' ? (
            <button type="button" className="arc-cta" disabled>
              Membuka kartu...
            </button>
          ) : (
            <button type="button" className="arc-cta" onClick={start}>
              {phase === 'done' ? 'Bagikan Lagi · ' + rupiah(stake) : 'Bagikan Kartu · ' + rupiah(stake)}
            </button>
          )}
        </div>
        <p className="pc-mini">Ante dipotong saat kartu dibagikan; Call 1× menambah taruhan yang sama.</p>
      </Table>
      <History items={hist} empty="Belum ada duel Hold'em." />
      <ResultOverlay
        result={result}
        onAgain={() => {
          setResult(null)
          start()
        }}
        onClose={() => setResult(null)}
      />
    </>
  )
}

/* ---------- 5. Poker Dice ---------- */
function dealerReroll(vals) {
  /* bandar memutar ulang semua dadu yang tidak membentuk pasangan */
  const count = {}
  vals.forEach((v) => {
    count[v] = (count[v] || 0) + 1
  })
  let best = 0
  Object.keys(count).forEach((k) => {
    if (count[k] > best) best = count[k]
  })
  if (best < 2) return rollDice(5)
  return vals.map((v) => (count[v] === best ? v : 1 + Math.floor(Math.random() * 6)))
}

function PokerDice({ toast, balance, setBalance, bet, setBet }) {
  const stake = Number(bet) || STAKES[0]
  const [phase, setPhase] = useState('idle')
  const [mine, setMine] = useState([])
  const [theirs, setTheirs] = useState([])
  const [final, setFinal] = useState([])
  const [sel, setSel] = useState([])
  const [result, setResult] = useState(null)
  const [hist, setHist] = useState(() => histOf('pvc-dice'))
  const rerolled = useRef(false)

  const start = () => {
    if (phase === 'hold') return
    if (stake > balance) return toast('Saldo tidak cukup, silakan deposit')
    setBalance((b) => b - stake)
    setMine(rollDice(5))
    setTheirs(rollDice(5))
    setFinal([])
    setSel([false, false, false, false, false])
    rerolled.current = false
    setResult(null)
    setPhase('hold')
  }

  const toggle = (i) => {
    if (phase !== 'hold' || rerolled.current) return
    setSel((s) => s.map((v, k) => (k === i ? !v : v)))
  }

  const settle = (vals) => {
    const d0 = dealerReroll(theirs)
    const p = diceHand(vals)
    const d = diceHand(d0)
    const c = cmpDice(p, d)
    const credit = c > 0 ? Math.round(stake * 1.9) : c === 0 ? stake : 0
    setFinal(d0)
    setSel([false, false, false, false, false])
    setBalance((b) => b + credit)
    setPhase('done')
    const entry = { at: Date.now(), mode: 'Poker Dice', pick: p.name, stake, win: credit - stake }
    setHist(pushHist('pvc-dice', entry))
    setResult({
      kind: c > 0 ? 'win' : c < 0 ? 'lose' : 'push',
      net: credit - stake,
      note: c > 0 ? 'Dadu Anda lebih tinggi, bayaran ×1,9.' : c < 0 ? 'Dadu bandar lebih tinggi.' : 'Nilai dadu sama, taruhan kembali.',
      detail: 'Anda: ' + p.name + ' · Bandar: ' + d.name,
    })
    toast(c > 0 ? 'Menang ' + rupiah(credit) + ' di Poker Dice' : c === 0 ? 'Seri, taruhan kembali' : 'Kalah, coba lagi')
  }

  const reroll = () => {
    if (phase !== 'hold' || rerolled.current) return
    const picked = sel.filter(Boolean).length
    if (!picked) return
    const next = mine.map((v, i) => (sel[i] ? 1 + Math.floor(Math.random() * 6) : v))
    setMine(next)
    setSel([false, false, false, false, false])
    rerolled.current = true
    settle(next)
  }

  const reveal = phase === 'done'
  return (
    <>
      <Setup
        title="Poker Dice"
        stake={stake}
        bet={bet}
        setBet={setBet}
        locked={phase === 'hold'}
        hint="Lima dadu, satu kali putar ulang. Klik dadu yang ingin diganti, lalu putar ulang atau bandingkan. Menang dibayar ×1,9."
      />
      <Table>
        <div className="pc-hand">
          <div className="pc-hand__top">
            <span>BANDAR</span>
            <b>{reveal && final.length ? diceHand(final).name : 'Dadu tertutup'}</b>
          </div>
          <div className="pc-dice">
            {(final.length ? final : [1, 1, 1, 1, 1]).map((v, i) => (
              <Die key={i} v={v} hidden={!reveal} />
            ))}
          </div>
        </div>
        <div className="pc-vs">VS</div>
        <div className="pc-hand mine">
          <div className="pc-hand__top">
            <span>ANDA</span>
            <b>{mine.length ? diceHand(mine).name : '-'}</b>
          </div>
          <div className="pc-dice">
            {(mine.length ? mine : [1, 1, 1, 1, 1]).map((v, i) => (
              <Die
                key={i}
                v={v}
                on={sel[i]}
                onClick={() => toggle(i)}
                disabled={phase !== 'hold' || rerolled.current || !mine.length}
              />
            ))}
          </div>
        </div>
        <div className="pc-actions">
          {phase === 'hold' && !rerolled.current ? (
            <>
              <button type="button" className="pc-ghost" onClick={() => settle(mine)}>
                Bandingkan
              </button>
              <button type="button" className="arc-cta" onClick={reroll} disabled={!sel.some(Boolean)}>
                Putar Ulang ({sel.filter(Boolean).length})
              </button>
            </>
          ) : (
            <button type="button" className="arc-cta" onClick={start}>
              {phase === 'done' ? 'Lempar Lagi · ' + rupiah(stake) : 'Lempar Dadu · ' + rupiah(stake)}
            </button>
          )}
        </div>
        <p className="pc-mini">Bandar juga mendapat satu putar ulang otomatis. Seri mengembalikan taruhan.</p>
      </Table>
      <History items={hist} empty="Belum ada permainan poker dadu." />
      <ResultOverlay
        result={result}
        onAgain={() => {
          setResult(null)
          start()
        }}
        onClose={() => setResult(null)}
      />
    </>
  )
}

/* ---------- panduan ---------- */
const GUIDE = {
  video: [
    'Tekan Bagikan Kartu: lima kartu terbuka dan taruhan langsung dipotong.',
    'Klik kartu untuk menandai SIMPAN, lalu tekan Tukar Kartu untuk mengganti sisanya.',
    'Pasangan hanya membayar mulai Jack ke atas. Royal Flush membayar ×250 taruhan.',
    'Kartu diacak ulang setiap ronde; hasil tidak dapat diulang atau diatur.',
  ],
  three: [
    'Ante dipotong saat tiga kartu dibagikan. Kartu bandar masih tertutup.',
    'Pilihan: Lipat (ante hangus) atau Call sebesar 1× ante untuk melanjutkan.',
    'Bandar lolos syarat jika punya Q tinggi atau lebih baik.',
    'Bonus ante: Straight ×1, Three of a Kind ×4, Straight Flush ×5.',
  ],
  stud: [
    'Ante dipotong saat lima kartu dibagikan; satu kartu bandar terbuka.',
    'Pilihan: Lipat (ante hangus) atau Call 2× ante untuk melihat semua kartu.',
    'Bandar lolos syarat dengan pair atau A-K tinggi.',
    'Saat menang, ante dibayar sesuai tabel di atas dan Call dibayar 1:1.',
  ],
  holdem: [
    'Ante dipotong saat dua kartu hole dibagikan. Bandar juga memegang dua kartu.',
    'Pilihan: Lipat (ante hangus) atau Call 1× untuk membuka flop, turn, dan river.',
    'Pemenang ditentukan dari kombinasi terbaik lima kartu dari tujuh kartu.',
    'Pot dipotong rake 5% saat Anda menang; seri mengembalikan taruhan.',
  ],
  dice: [
    'Lima dadu dilempar bersamaan; klik dadu yang ingin diganti.',
    'Satu kali putar ulang per ronde, boleh satu dadu atau semuanya.',
    'Urutan tangan: five of a kind, four, full house, straight, three, two pair, pair, high card.',
    'Kemenangan dibayar ×1,9; bandar punya satu putar ulang otomatis dan seri mengembalikan taruhan.',
  ],
}

function Guide({ gid }) {
  return (
    <section className="arc-panel pc-guide">
      <div className="arc-panel__head">
        <b>Aturan Main</b>
        <span>SIMULASI</span>
      </div>
      <ul>
        {GUIDE[GTYPE[gid]].map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <p className="arc-note">Semua ronde berjalan lokal di perangkat ini. Tidak ada uang sungguhan.</p>
    </section>
  )
}

/* ---------- halaman ---------- */
export default function Poker({ id, navigate, toast, balance, setBalance, bet, setBet }) {
  const game = ARCADE.find((g) => g.id === id) || ARCADE.find((g) => g.kind === 'poker')
  const shared = { toast, balance, setBalance, bet, setBet }
  const body =
    game.id === 'pvc-videopoker' ? (
      <VideoPoker {...shared} />
    ) : game.id === 'pvc-threecard' ? (
      <ThreeCard {...shared} />
    ) : game.id === 'pvc-caribbean' ? (
      <Caribbean {...shared} />
    ) : game.id === 'pvc-holdem' ? (
      <Holdem {...shared} />
    ) : (
      <PokerDice {...shared} />
    )
  return (
    <>
      <IconSprite />
      <div className="arcade pc-page">
        <NavBar variant="white" title={game.name} back={() => navigate('/')} logo={false} />
        <header className="arc-hero" style={{ backgroundImage: 'url(' + game.img + ')' }}>
          <div className="arc-hero__shade" />
          <div className="arc-hero__text">
            <span>{game.tag} · HONGYUN ARCADE</span>
            <h1>{game.name}</h1>
            <p>{game.desc}</p>
          </div>
          <div className="arc-hero__bal">
            <span>Saldo</span>
            <b>{rupiah(balance)}</b>
          </div>
        </header>
        <main className="arc-main">
          {body}
          <Guide gid={game.id} />
        </main>
      </div>
      <Customer toast={toast} />
      <TabBar route={'/game/' + game.id} navigate={navigate} />
    </>
  )
}
