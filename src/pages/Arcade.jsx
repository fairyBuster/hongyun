import React, { useEffect, useRef, useState } from 'react'
import { Customer, IconSprite, NavBar, TabBar } from '../components/Chrome.jsx'
import { ARCADE, rupiah } from '../data.js'
import { read, timeText, write } from '../logic.js'
import '../arcade.css'
import { loadBola, outcomeOf, goalPlan, dateText } from '../bola.js'

const STAKES = [1000, 5000, 10000, 25000, 50000]
const HIST_KEY = 'f55.arcade'
const PAY = { '4D': 3000, '3D': 400, '2D': 70 }
const SIDE_LABEL = { home: 'Tuan Rumah', draw: 'Seri', away: 'Tamu' }

const histOf = (id) => read(HIST_KEY, {})[id] || []
const saveHist = (id, item) => {
  const all = read(HIST_KEY, {})
  all[id] = [item, ...(all[id] || [])].slice(0, 12)
  write(HIST_KEY, all)
  return all[id]
}
const rnd = (n) => Math.floor(Math.random() * n)
const initials = (name) => {
  const words = name.split(' ').filter(Boolean)
  return words.length > 1
    ? (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

/* crest klub resmi; kalau berkasnya belum ada tetap tampil inisial */
function Crest({ logos, team, size }) {
  const src = logos && logos[team]
  return (
    <span className={'bl-crest' + (size ? ' ' + size : '') + (src ? ' has' : '')}>
      {src ? <img src={src} alt={'Logo ' + team} loading="lazy" /> : initials(team)}
    </span>
  )
}

/* ---------- komponen kecil ---------- */
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

function History({ items, empty, render }) {
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
              <span className="arc-hist__mid">{render(h)}</span>
              <b className={h.win > 0 ? 'in' : 'out'}>{h.win > 0 ? '+' + rupiah(h.win) : '-' + rupiah(h.stake)}</b>
            </div>
          ))}
        </div>
      ) : (
        <p className="arc-empty">{empty}</p>
      )}
    </section>
  )
}

function Rooster({ tone }) {
  return (
    <svg className={'sb-bird rg rg--' + tone} viewBox="-135 -125 270 225" aria-hidden="true">
      <path d="M-44,-18 C-92,-34 -114,-76 -104,-114 C-80,-96 -62,-74 -40,-58 Z" fill="var(--r3)" />
      <path d="M-46,-6 C-98,-10 -126,-44 -122,-82 C-94,-62 -70,-48 -42,-38 Z" fill="var(--r2)" />
      <path d="M-44,8 C-92,20 -114,-6 -118,-40 C-88,-24 -64,-16 -38,-12 Z" fill="var(--r3)" />
      <path d="M-8,40 l-4,36 M16,40 l6,36" stroke="#f2b53c" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path
        d="M-12,76 l-14,9 M-12,76 l0,13 M-12,76 l13,9 M22,76 l-14,9 M22,76 l0,13 M22,76 l14,9"
        stroke="#f2b53c"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="0" cy="0" rx="62" ry="46" transform="rotate(-8)" fill="var(--r1)" stroke="rgba(255,255,255,.22)" strokeWidth="2" />
      <path d="M18,-26 C46,-16 50,16 28,34 C12,22 8,-10 18,-26 Z" fill="#fff" opacity=".1" />
      <path d="M-24,-14 C4,-30 40,-16 44,6 C28,26 -8,28 -28,10 Z" fill="var(--r2)" />
      <path d="M-14,2 C6,-8 28,-2 34,8" stroke="rgba(255,255,255,.28)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M32,-16 C44,-46 58,-60 76,-62 L86,-34 C66,-28 56,-8 52,6 Z" fill="var(--r1)" />
      <circle cx="84" cy="-56" r="21" fill="var(--r1)" />
      <path d="M70,-74 q0,-14 9,-9 q3,-14 11,-9 q6,-11 12,-1 q5,8 -2,13 z" fill="#e03434" />
      <path d="M102,-58 l20,7 -20,7 z" fill="#f2b53c" />
      <path d="M98,-46 q7,9 2,17 q-9,-1 -11,-10 z" fill="#e03434" />
      <circle cx="90" cy="-60" r="4.6" fill="#141014" />
      <circle cx="91.4" cy="-61.6" r="1.6" fill="#fff" />
    </svg>
  )
}

/* ---------- Togel 4D / 3D / 2D ---------- */
function Togel({ toast, balance, setBalance, bet, setBet }) {
  const [mode, setMode] = useState('4D')
  const len = mode === '4D' ? 4 : mode === '3D' ? 3 : 2
  const [digits, setDigits] = useState(['', '', '', ''])
  const [reels, setReels] = useState(['–', '–', '–', '–'])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [hist, setHist] = useState(() => histOf('togel'))
  const inputs = useRef([])
  const roll = useRef(null)
  const finish = useRef(null)

  useEffect(
    () => () => {
      clearInterval(roll.current)
      clearTimeout(finish.current)
    },
    [],
  )

  const setDigit = (i, raw) => {
    const v = raw.replace(/\D/g, '').slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[i] = v
      return next
    })
    if (v && i < len - 1) inputs.current[i + 1]?.focus()
  }

  const randomize = () => {
    if (busy) return
    setDigits([0, 1, 2, 3].map(() => String(rnd(10))))
  }

  const changeMode = (m) => {
    if (busy || m === mode) return
    setMode(m)
    setDigits(['', '', '', ''])
    setReels(['–', '–', '–', '–'])
    setResult(null)
  }

  const pick = digits.slice(0, len).join('')
  const ready = pick.length === len

  const play = () => {
    if (busy) return
    if (!ready) return toast('Isi ' + len + ' digit dulu')
    const stake = Number(bet) || 0
    if (stake > balance) return toast('Saldo tidak cukup, silakan deposit')
    setBusy(true)
    setResult(null)
    setBalance((b) => b - stake)
    const final = [0, 1, 2, 3].map(() => rnd(10))
    roll.current = setInterval(() => setReels([0, 1, 2, 3].map(() => String(rnd(10)))), 60)
    finish.current = setTimeout(() => {
      clearInterval(roll.current)
      setReels(final.map(String))
      const drawn = final.join('')
      const hit = drawn.slice(4 - len) === pick
      const win = hit ? stake * PAY[mode] : 0
      if (win) setBalance((b) => b + win)
      const entry = { at: Date.now(), mode, pick, drawn, stake, win }
      setResult(entry)
      setHist(saveHist('togel', entry))
      setBusy(false)
      toast(hit ? 'Tembus ' + mode + '! Menang ' + rupiah(win) : 'Belum tembus, coba angka lain')
    }, 1500)
  }

  return (
    <>
      <section className="arc-panel">
        <div className="tg-modes">
          {Object.keys(PAY).map((m) => (
            <button key={m} type="button" className={mode === m ? 'on' : ''} disabled={busy} onClick={() => changeMode(m)}>
              <b>{m}</b>
              <i>×{PAY[m].toLocaleString('en-US')}</i>
            </button>
          ))}
        </div>

        <div className="tg-label">Masukkan angka {mode}</div>
        <div className="tg-digits">
          {Array.from({ length: len }, (_, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              className="tg-digit"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digits[i]}
              disabled={busy}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus()
              }}
            />
          ))}
          <button type="button" className="tg-dice" onClick={randomize} disabled={busy}>
            ACAK
          </button>
        </div>

        <div className="tg-reels">
          {reels.map((r, i) => (
            <div key={i} className={'tg-reel' + (busy ? ' spin' : '')}>
              {r}
            </div>
          ))}
        </div>

        {result ? (
          <div className={'tg-result ' + (result.win ? 'win' : 'lose')}>
            <b>{result.win ? 'MENANG' : 'BELUM TEMBUS'}</b>
            <span>
              {result.mode} {result.pick} → {result.drawn}
            </span>
            <em>{result.win ? '+' + rupiah(result.win) : '-' + rupiah(result.stake)}</em>
          </div>
        ) : (
          <p className="arc-note">
            Hadiah {mode} tepat = taruhan × {PAY[mode].toLocaleString('en-US')} · undian memakai 4 digit terakhir.
          </p>
        )}

        <StakeBar bet={bet} setBet={setBet} locked={busy} />
        <button type="button" className="arc-cta" disabled={busy || !ready} onClick={play}>
          {busy ? 'Mengundi...' : ready ? 'Pasang ' + rupiah(bet) + ' & Undi' : 'Isi ' + len + ' digit'}
        </button>
      </section>
      <History items={hist} empty="Belum ada undian di perangkat ini." render={(h) => h.mode + ' · ' + h.pick + ' → ' + h.drawn} />
    </>
  )
}

/* ---------- Sabung Ayam ---------- */
function Sabung({ toast, balance, setBalance, bet, setBet }) {
  const [side, setSide] = useState('red')
  const [phase, setPhase] = useState('idle')
  const [hp, setHp] = useState({ red: 100, blue: 100 })
  const [log, setLog] = useState('Pilih jago lalu tekan Mulai Adu.')
  const [winner, setWinner] = useState(null)
  const [hist, setHist] = useState(() => histOf('sabung'))
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const reset = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setPhase('idle')
    setWinner(null)
    setHp({ red: 100, blue: 100 })
    setLog('Pilih jago lalu tekan Mulai Adu.')
  }

  const play = () => {
    if (phase === 'fight') return
    const stake = Number(bet) || 0
    if (stake > balance) return toast('Saldo tidak cukup, silakan deposit')
    timers.current.forEach(clearTimeout)
    timers.current = []
    setPhase('fight')
    setWinner(null)
    setHp({ red: 100, blue: 100 })
    setBalance((b) => b - stake)
    setLog('Wasit melepas kedua jago...')
    const winSide = Math.random() < 0.5 ? 'red' : 'blue'
    const loseSide = winSide === 'red' ? 'blue' : 'red'
    const name = (s) => (s === 'red' ? 'Jago Merah' : 'Jago Biru')
    const steps = [
      [700, loseSide, 18, name(winSide) + ' menyerang sayap lawan!'],
      [1350, winSide, 12, name(loseSide) + ' membalas dengan patukan!'],
      [2000, loseSide, 24, name(winSide) + ' melompat dan mencakar!'],
      [2650, loseSide, 100, 'KO! ' + name(loseSide) + ' jatuh. ' + name(winSide) + ' menang!'],
    ]
    steps.forEach(([at, who, dmg, text], idx) => {
      timers.current.push(
        setTimeout(() => {
          setHp((prev) => ({ ...prev, [who]: Math.max(0, prev[who] - dmg) }))
          setLog(text)
          if (idx === steps.length - 1) {
            setPhase('done')
            setWinner(winSide)
            const won = winSide === side
            const win = won ? Math.round(stake * 1.9) : 0
            if (win) setBalance((b) => b + win)
            const entry = { at: Date.now(), side, winSide, stake, win }
            setHist(saveHist('sabung', entry))
            toast(won ? 'Jago Anda menang! +' + rupiah(win) : 'Jago Anda kalah, coba lagi')
          }
        }, at),
      )
    })
  }

  const fighterCls = (s) =>
    'sb-fighter' +
    (side === s ? ' pick' : '') +
    (phase === 'done' && winner === s ? ' win' : '') +
    (phase === 'done' && winner && winner !== s ? ' ko' : '')

  return (
    <>
      <section className={'arc-panel sb-panel ' + phase}>
        <div className="sb-arena">
          <div className={fighterCls('red')} onClick={() => phase === 'idle' && setSide('red')}>
            <Rooster tone="red" />
            <b>JAGO MERAH</b>
            <div className="sb-hp">
              <i style={{ width: hp.red + '%' }} />
            </div>
          </div>
          <div className="sb-vs">VS</div>
          <div className={fighterCls('blue')} onClick={() => phase === 'idle' && setSide('blue')}>
            <Rooster tone="blue" />
            <b>JAGO BIRU</b>
            <div className="sb-hp">
              <i style={{ width: hp.blue + '%' }} />
            </div>
          </div>
        </div>
        <p className="sb-log">{log}</p>
        <p className="arc-note">
          Pilihan Anda <b>{side === 'red' ? 'Jago Merah' : 'Jago Biru'}</b> · bayaran ×1,9 · hasil acak 50/50.
        </p>
        <StakeBar bet={bet} setBet={setBet} locked={phase === 'fight'} />
        <button type="button" className="arc-cta" disabled={phase === 'fight'} onClick={phase === 'done' ? reset : play}>
          {phase === 'fight' ? 'Adu berlangsung...' : phase === 'done' ? 'Adu Lagi' : 'Pasang ' + rupiah(bet) + ' & Mulai Adu'}
        </button>
      </section>
      <History
        items={hist}
        empty="Belum ada adu ayam di perangkat ini."
        render={(h) => (h.side === 'red' ? 'Merah' : 'Biru') + ' · menang ' + (h.winSide === 'red' ? 'Merah' : 'Biru')}
      />
    </>
  )
}

/* ---------- Bola 1X2 ---------- */
function Bola({ toast, balance, setBalance, bet, setBet }) {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [li, setLi] = useState(0)
  const [mi, setMi] = useState(0)
  const [pickSide, setPickSide] = useState('home')
  const [phase, setPhase] = useState('idle')
  const [score, setScore] = useState({ home: 0, away: 0 })
  const [min, setMin] = useState(0)
  const [feed, setFeed] = useState([])
  const [result, setResult] = useState(null)
  const [hist, setHist] = useState(() => histOf('bola'))
  const timer = useRef(null)

  useEffect(() => {
    let on = true
    loadBola()
      .then((d) => on && setData(d))
      .catch(() => on && setErr('Data laga gagal dimuat. Periksa koneksi lalu coba lagi.'))
    return () => {
      on = false
    }
  }, [])

  useEffect(() => () => clearInterval(timer.current), [])

  const league = data ? data[li] : null
  /* semua crest liga, dipakai baris riwayat yang tidak menyimpan id liga */
  const allLogos = data ? Object.assign({}, ...data.map((l) => l.logos || {})) : {}
  const matches = league ? league.matches.slice(-10).reverse() : []
  const m = matches[mi] || matches[0]

  /* kembali ke keadaan siap tanpa memindah liga/laga */
  const stop = () => {
    clearInterval(timer.current)
    setPhase('idle')
    setScore({ home: 0, away: 0 })
    setMin(0)
    setFeed([])
    setResult(null)
  }

  const retry = () => {
    setErr('')
    loadBola(true)
      .then(setData)
      .catch(() => setErr('Data laga gagal dimuat. Periksa koneksi lalu coba lagi.'))
  }

  const pickLeague = (i) => {
    if (phase === 'live' || i === li) return
    setLi(i)
    setMi(0)
    stop()
  }

  const pickMatch = (i) => {
    if (phase === 'live' || i === mi) return
    setMi(i)
    stop()
  }

  const play = () => {
    if (!m || phase === 'live') return
    const stake = Number(bet) || 0
    if (stake > balance) return toast('Saldo tidak cukup, silakan deposit')
    const odds = m.odds
    setBalance((b) => b - stake)
    setPhase('live')
    setScore({ home: 0, away: 0 })
    setMin(0)
    setFeed([])
    setResult(null)

    const goals = goalPlan(m)
    let clock = 0
    let sc = { home: 0, away: 0 }
    const events = []
    timer.current = setInterval(() => {
      clock += 1
      setMin(clock)
      goals
        .filter((g) => g.min === clock)
        .forEach((g) => {
          sc = { ...sc, [g.team]: sc[g.team] + 1 }
          setScore(sc)
          events.unshift({ min: clock, name: g.team === 'home' ? m.home : m.away })
          setFeed(events.slice(0, 5))
        })
      if (clock >= 90) {
        clearInterval(timer.current)
        setPhase('done')
        const outcome = outcomeOf(m.ft)
        const win = outcome === pickSide ? Math.round(stake * odds[pickSide]) : 0
        if (win) setBalance((b) => b + win)
        const entry = {
          at: Date.now(),
          pickSide,
          outcome,
          stake,
          win,
          score: { home: m.ft[0], away: m.ft[1] },
          match: { home: m.home, away: m.away, date: m.date, league: league.name, season: league.season },
        }
        setResult(entry)
        setHist(saveHist('bola', entry))
        toast(win ? 'Taruhan menang! +' + rupiah(win) : 'Taruhan kalah, coba lagi')
      }
    }, 55)
  }

  if (err)
    return (
      <section className="arc-panel">
        <div className="arc-panel__head">
          <b>Data laga</b>
          <span>gagal</span>
        </div>
        <p className="arc-empty">{err}</p>
        <button type="button" className="arc-cta bl-retry" onClick={retry}>
          Coba Lagi
        </button>
      </section>
    )

  if (!data)
    return (
      <section className="arc-panel">
        <div className="bl-league">
          <span>Memuat liga...</span>
          <span>DATA ASLI</span>
        </div>
        <div className="bl-load">
          <span />
          <span />
          <span />
        </div>
        <p className="arc-note">Mengambil hasil resmi openfootball/football.json.</p>
      </section>
    )

  return (
    <>
      <section className="arc-panel">
        <div className="bl-league">
          <span>
            {league.name} · {league.season}
          </span>
          <span>{phase === 'live' ? 'LIVE' : phase === 'done' ? 'SELESAI' : 'SIAP'}</span>
        </div>
        <p className="bl-src">
          Sumber: {league.src} · {league.sample.old + league.sample.now} hasil resmi
        </p>

        <div className="bl-leagues">
          {data.map((l, i) => (
            <button
              key={l.id}
              type="button"
              className={i === li ? 'on' : ''}
              disabled={phase === 'live' && i !== li}
              onClick={() => pickLeague(i)}
            >
              {l.name}
            </button>
          ))}
        </div>

        {m ? (
          <>
            <div className="bl-score">
              <div className="bl-team home">
                <Crest logos={league.logos} team={m.home} size="big" />
                <b>{m.home}</b>
              </div>
              <div className="bl-mid">
                <div className="score">
                  {score.home} - {score.away}
                </div>
                <span className="min">{phase === 'live' ? min + "'" : phase === 'done' ? '90′' : '00′'}</span>
              </div>
              <div className="bl-team away">
                <Crest logos={league.logos} team={m.away} size="big" />
                <b>{m.away}</b>
              </div>
            </div>
            <p className="bl-when">{dateText(m.date)} · laga asli, skor akhir mengikuti hasil resmi</p>

            <div className="bl-odds">
              {['home', 'draw', 'away'].map((k) => (
                <button
                  key={k}
                  type="button"
                  className={'bl-odd' + (pickSide === k ? ' on' : '')}
                  disabled={phase !== 'idle'}
                  onClick={() => setPickSide(k)}
                >
                  <span>{SIDE_LABEL[k]}</span>
                  <b>{m.odds[k].toFixed(2)}</b>
                </button>
              ))}
            </div>
            <p className="bl-note">Odds model Poisson dari hasil resmi musim ini + musim lalu (bukan odds pasar).</p>

            <div className={'bl-pitch' + (phase === 'live' ? ' live' : '')}>
              <span className="bl-ball" />
            </div>

            {feed.length ? (
              <div className="bl-feed">
                {feed.map((f, i) => (
                  <div key={i}>
                    <b>{f.min}'</b> GOL! {f.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="arc-note">
                {phase === 'done'
                  ? 'Skor akhir resmi ' + m.ft[0] + '-' + m.ft[1] + '.'
                  : 'Pilih 1 · X · 2 lalu pasang taruhan. Skor mengikuti hasil asli.'}
              </p>
            )}

            {phase === 'done' && result ? (
              <div className={'tg-result ' + (result.win ? 'win' : 'lose')}>
                <b>{result.win ? 'MENANG' : 'KALAH'}</b>
                <span>
                  {result.match.home} {result.score.home}-{result.score.away} {result.match.away} · pilihan{' '}
                  {SIDE_LABEL[result.pickSide]}
                </span>
                <em>{result.win ? '+' + rupiah(result.win) : '-' + rupiah(result.stake)}</em>
              </div>
            ) : null}

            <StakeBar bet={bet} setBet={setBet} locked={phase === 'live'} />
            <button type="button" className="arc-cta" disabled={phase === 'live'} onClick={phase === 'done' ? stop : play}>
              {phase === 'live'
                ? 'Pertandingan berjalan...'
                : phase === 'done'
                  ? 'Pertandingan Baru'
                  : 'Pasang ' + rupiah(bet) + ' & Kick Off'}
            </button>

            <div className="bl-pick">Laga terbaru · pilih pertandingan</div>
            <div className="bl-fixtures">
              {matches.map((x, i) => (
                <button
                  key={x.id}
                  type="button"
                  className={i === mi ? 'on' : ''}
                  disabled={phase === 'live' && i !== mi}
                  onClick={() => pickMatch(i)}
                >
                  <span className="bl-fx-row">
                    <Crest logos={league.logos} team={x.home} size="mini" />
                    <b>{x.home}</b>
                  </span>
                  <span className="bl-fx-row">
                    <Crest logos={league.logos} team={x.away} size="mini" />
                    <em>{x.away}</em>
                  </span>
                  <span className="bl-fx-date">{dateText(x.date)}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="arc-empty">Belum ada laga berskor untuk liga ini.</p>
        )}
      </section>
      <History
        items={hist}
        empty="Belum ada taruhan bola di perangkat ini."
        render={(h) =>
          h.match ? (
            <span className="bl-hist">
              <Crest logos={allLogos} team={h.match.home} size="mini" />
              <span className="bl-hist__name">{h.match.home}</span>
              <b>
                {h.score.home}-{h.score.away}
              </b>
              <span className="bl-hist__name">{h.match.away}</span>
              <Crest logos={allLogos} team={h.match.away} size="mini" />
            </span>
          ) : (
            h.score.home + '-' + h.score.away
          )
        }
      />
    </>
  )
}

/* ---------- halaman ---------- */
export default function Arcade({ id, navigate, toast, balance, setBalance, bet, setBet }) {
  const game = ARCADE.find((g) => g.id === id) || ARCADE[0]
  const shared = { toast, balance, setBalance, bet, setBet }
  return (
    <>
      <IconSprite />
      <div className="arcade">
        <NavBar variant="white" title={game.name} back={() => navigate('/')} logo={false} />
        <header
          className="arc-hero"
          style={{
            backgroundImage: 'url(' + game.img + ')',
            /* artwork bola fokus ke bagian bawah: bola dan lapangan */
            backgroundPosition: game.id === 'bola' ? 'center 78%' : 'center',
          }}
        >
          <div className="arc-hero__shade" />
          <div className="arc-hero__text">
            <span>HONGYUN ARCADE</span>
            <h1>{game.name}</h1>
            <p>{game.desc}</p>
          </div>
          <div className="arc-hero__bal">
            <span>Saldo</span>
            <b>{rupiah(balance)}</b>
          </div>
        </header>
        <main className="arc-main">
          {game.id === 'togel' ? <Togel {...shared} /> : game.id === 'sabung' ? <Sabung {...shared} /> : <Bola {...shared} />}
        </main>
      </div>
      <Customer toast={toast} />
      <TabBar route={'/game/' + game.id} navigate={navigate} />
    </>
  )
}
