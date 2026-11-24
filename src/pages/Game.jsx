import React, { useEffect, useMemo, useRef } from 'react'
import { IconSprite, NavBar, TabBar } from '../components/Chrome.jsx'
import { ARCADE, MJ_GAMES } from '../data.js'
import Arcade from './Arcade.jsx'
import Poker from './Poker.jsx'
import { gameKey, read, write } from '../logic.js'

function Mahjong({ id, navigate, toast, balance, setBalance, user }) {
  /* Hanya 20 mesin Mahjong Ways lokal yang bisa dimainkan; id lain jatuh ke mw1. */
  const mj = MJ_GAMES.find((g) => g.id === id) || MJ_GAMES[0]
  const startBal = useRef(balance)

  /* Jembatan pesan dari mesin di iframe (game.html): tombol LOBI dan banner
     promo diteruskan ke router app, supaya tidak membuka /portal/* yang
     tidak ada di salinan ini. */
  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data
      if (!d || typeof d !== 'object') return
      if (d.type === 'f55:exit') navigate('/')
      else if (d.type === 'f55:go' && typeof d.to === 'string' && d.to.charAt(0) === '/') navigate(d.to)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [navigate])

  /* Saldo mesin disimpan per akun (mj.v2:<id>) supaya koin tidak tercampur
     antar akun. Data lama tanpa akun dipindahkan ke akun aktif sekali. */
  const account = user?.phone || ''
  const saveKey = gameKey(account)
  useMemo(() => {
    if (!account) return
    const legacy = read('mj.v2', null)
    let s = read(saveKey, null)
    if (!s) {
      s = legacy || { bal: startBal.current }
      if (legacy) localStorage.removeItem('mj.v2')
    }
    write(saveKey, { ...s, bal: startBal.current })
  }, [account, saveKey])

  /* Saldo app mendorong saldo awal ke mesin, lalu polling membawa
     kemenangan dan sisa taruhan kembali ke saldo akun. */
  useEffect(() => {
    const sync = () => {
      const s = read(saveKey, null)
      if (s && typeof s.bal === 'number') setBalance((prev) => (s.bal !== prev ? s.bal : prev))
    }
    const t = setInterval(sync, 1200)
    return () => {
      clearInterval(t)
      sync()
    }
  }, [saveKey, setBalance])

  /* Mesin mahjong (mw1..mw20) dijalankan dari dokumen terpisah game.html:
     CSS panggung game global, jadi harus diisolasi lewat iframe. */
  return (
    <>
      <IconSprite />
      <div className="game-launch game-launch--mj">
        <NavBar variant="white" title={mj.name} back={() => navigate('/')} logo={false} />
        <iframe
          className="game-launch__frame"
          src={import.meta.env.BASE_URL + 'game.html?u=' + encodeURIComponent(account) + '#game/' + mj.id}
          title={mj.name}
          allow="autoplay; fullscreen; accelerometer; gyroscope"
          allowFullScreen
        />
      </div>
      <TabBar route={'/game/' + mj.id} navigate={navigate} toast={toast} balance={balance} setBalance={setBalance} />
    </>
  )
}

export default function Game({ id, navigate, toast, balance, setBalance, bet, setBet, user }) {
  const arcade = ARCADE.find((g) => g.id === id)
  if (arcade && arcade.kind === 'poker') {
    return (
      <Poker
        id={arcade.id}
        navigate={navigate}
        toast={toast}
        balance={balance}
        setBalance={setBalance}
        bet={bet}
        setBet={setBet}
      />
    )
  }
  if (arcade) {
    return (
      <Arcade
        id={arcade.id}
        navigate={navigate}
        toast={toast}
        balance={balance}
        setBalance={setBalance}
        bet={bet}
        setBet={setBet}
      />
    )
  }
  return <Mahjong id={id} navigate={navigate} toast={toast} balance={balance} setBalance={setBalance} user={user} />
}
