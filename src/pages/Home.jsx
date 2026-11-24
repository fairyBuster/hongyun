import React, { useEffect, useState } from 'react'
import { IconSprite, Modal, Svg, NavBar, TabBar, Customer } from '../components/Chrome.jsx'
import { CATEGORIES, ARCADE, BANNERS, NOTICE, MJ_GAMES, rupiah } from '../data.js'
import { NOTIFS, markNotifRead, notifRead } from '../logic.js'
import { loadWinners, localWithdrawals } from '../winners.js'

const card = (game, navigate, key) => (
  <div key={key} onClick={() => navigate('/game/' + game.id)}>
    <div className="item">
      <div className="gamePic">
        <img src={game.img} alt={game.name} loading="lazy" />
        {game.logo ? <img className="game-logo" src={game.logo} alt="" loading="lazy" /> : null}
        {game.tag || game.no ? <span className="arcade-tag">{game.tag || game.no}</span> : null}
      </div>
    </div>
    <div className="win-odds">
      <span>Peluang</span>
      <span>{game.odds}</span>
      <div className="win-p" style={{ width: game.odds }} />
    </div>
  </div>
)

const CAT_SUB = {
  slot: '20 mesin Mahjong Ways lokal (PG Soft). Nomor di tiap kartu adalah nomor mesinnya.',
  lotre: 'Togel 4D, 3D, dan 2D dengan undian langsung di perangkat ini.',
  sabung: 'Adu jago merah melawan jago biru, hasil acak 50/50 dengan bayaran ×1,9.',
  sport: 'Taruhan 1X2 dengan simulasi pertandingan 90 menit.',
  fish: 'Kategori tembak ikan belum tersedia di salinan ini.',
  kasino: 'Kategori kasino belum tersedia di salinan ini.',
  pvc: 'Lima permainan poker lokal: video poker, three card, Caribbean Stud, Hold\'em Duel, dan poker dadu.',
}

const CAT_TITLE = {
  lotre: 'Lotre',
  slot: 'Slot & Mahjong',
  fish: 'Tembak Ikan',
  sabung: 'Sabung Ayam',
  kasino: 'Kasino',
  sport: 'Sport',
  pvc: 'PVC',
}

export default function Home({ route, navigate, toast, user, balance, setBalance }) {
  const [cat, setCat] = useState('populer')
  const [slide, setSlide] = useState(0)
  const [modal, setModal] = useState(null)
  const [unread, setUnread] = useState(() => NOTIFS.length - notifRead().length)
  const [feed, setFeed] = useState(() => ({ items: localWithdrawals(user), source: 'lokal' }))

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % BANNERS.length), 4000)
    return () => clearInterval(t)
  }, [])

  /* muat data pemenang: backend dulu, lalu penarikan di perangkat */
  useEffect(() => {
    let on = true
    loadWinners(user).then((r) => {
      if (on) setFeed(r)
    })
    return () => {
      on = false
    }
  }, [user])

  const openNotif = () => {
    setModal('notif')
    markNotifRead(NOTIFS.map((n) => n.id))
    setUnread(0)
  }

  const catGames = cat === 'slot' ? MJ_GAMES : ARCADE.filter((g) => g.cat === cat)
  const isPopuler = cat === 'populer'

  /* pemenang terbaru: satu baris per pengguna (penarikan terakhirnya) */
  const seen = new Set()
  const recentWinners = []
  for (const w of feed.items) {
    const key = w.userKey || w.name
    if (seen.has(key)) continue
    seen.add(key)
    recentWinners.push(w)
    if (recentWinners.length >= 6) break
  }

  /* bagan hari ini: total penarikan per pengguna sejak 00:00 */
  const dayStart = new Date()
  dayStart.setHours(0, 0, 0, 0)
  const dailyMap = new Map()
  for (const w of feed.items) {
    if (w.at < dayStart.getTime()) continue
    const key = w.userKey || w.name
    const cur = dailyMap.get(key)
    if (cur) cur.amount += w.amount
    else dailyMap.set(key, { userKey: key, name: w.name, amount: w.amount })
  }
  const daily = [...dailyMap.values()].sort((a, b) => b.amount - a.amount).slice(0, 10)

  return (
    <>
      <IconSprite />
      <div className="content_home">
        <NavBar
          right={
            <div className="content__right">
              <div className="message" onClick={openNotif}>
                <Svg id="i-notif" />
                {unread > 0 ? <div className="point" /> : null}
              </div>
              <Svg id="i-down" className="down" onClick={() => setModal('download')} />
            </div>
          }
        />

        <div className="swiper_box">
          <div className="swiper my-swipe">
            <div
              className="swiper-wrapper"
              style={{ transform: `translateX(-${slide * 100}%)`, transition: 'transform .4s' }}
            >
              {BANNERS.map((b, i) => (
                <div className={'swiper-slide' + (i === slide ? ' swiper-slide-active' : '')} key={b}>
                  <img src={b} alt={'Banner HONGYUN ' + (i + 1)} onClick={() => navigate('/promotion')} />
                </div>
              ))}
            </div>
            <div className="hy-dots">
              {BANNERS.map((b, i) => (
                <i key={b} className={i === slide ? 'on' : ''} onClick={() => setSlide(i)} />
              ))}
            </div>
          </div>
        </div>

        <div className="noticeBar__container">
          <Svg id="i-announce" style={{ width: '.42rem', height: '.42rem' }} />
          <div className="noticeBar__container-body">
            <div className="noticeBar__container-body-text noticeTicker">
              <span>{NOTICE}</span>
              <span aria-hidden="true">{NOTICE}</span>
            </div>
          </div>
          <button className="hotIcon" onClick={() => navigate('/activity')}>
            Rincian
          </button>
        </div>

        <div className="home_menu">
          {CATEGORIES.map((c) => (
            <div className={'menu_item' + (cat === c.key ? ' active' : '')} key={c.key} onClick={() => setCat(c.key)}>
              <img className={c.cls} src={c.icon} alt={c.label} />
              <span>{c.label}</span>
            </div>
          ))}
        </div>

        <div className="home_container">
          {isPopuler ? (
            <div className="hot_container">
              <div className="title">MAHJONG WAYS</div>
              <div className="popular">
                <div className="list">{MJ_GAMES.map((g, i) => card(g, navigate, 'mj' + i))}</div>
              </div>
              <div className="title">TOGEL · ARENA · BOLA · POKER</div>
              <div className="popular">
                <div className="list">{ARCADE.map((g, i) => card(g, navigate, 'a' + i))}</div>
              </div>
            </div>
          ) : catGames.length ? (
            <div className="hot_container">
              <div className="hy-cat-head">
                <b>{CAT_TITLE[cat] || cat}</b>
                <em>{catGames.length} game</em>
              </div>
              {CAT_SUB[cat] ? <p className="hy-cat-sub">{CAT_SUB[cat]}</p> : null}
              <div className="popular">
                <div className="list">{catGames.map((g, i) => card(g, navigate, cat + i))}</div>
              </div>
            </div>
          ) : (
            <div className="hy-empty hy-empty--page">
              <Svg id="i-empty" style={{ width: '2.8rem', height: '1.9rem' }} />
              <b>Belum ada game {CAT_TITLE[cat] || cat}</b>
              <p>Kategori ini belum tersedia di salinan aplikasi. Semua game saat ini ada di menu Populer.</p>
              <button type="button" className="hy-btn" style={{ width: 'auto', padding: '0 .5rem' }} onClick={() => setCat('populer')}>
                Lihat Populer
              </button>
            </div>
          )}
        </div>

        <div className="luckyWinners__container">
          <h1>Informasi pemenang</h1>
          {recentWinners.length ? (
            <div className="luckyWinners__container-wrapper">
              <div>
                {recentWinners.map((w) => (
                  <div className="luckyWinners__container-wrapper__item" key={w.id}>
                    <div className="luckyWinners__container-wrapper__item-img">
                      <img src="/assets/png/avatar-BTjdxpts.png" alt="" />
                    </div>
                    <div className="luckyWinners__container-wrapper__item-info">
                      <h1>{w.name}</h1>
                    </div>
                    <div className="luckyWinners__container-wrapper__item-winType">
                      <span>WITHDRAW</span>
                    </div>
                    <div className="luckyWinners__container-wrapper__item-winAmount">
                      <h1>{rupiah(w.amount)}</h1>
                      <span>{w.method ? 'Penarikan · ' + w.method : 'Jumlah penarikan'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="hy-note hy-winners-empty">
              Belum ada penarikan. Bagian ini hanya menampilkan pengguna yang menarik dana.
            </p>
          )}
        </div>

        <div className={'dailyProfitRank' + (daily.length < 3 ? ' is-compact' : '')}>
          <div className="title">
            <b />
            Bagan pendapatan hari ini
          </div>
          {daily.length >= 3 ? (
            <div className="dailyProfitRank__content">
              <div className="dailyProfitRank__content-topThree">
                {daily.slice(0, 3).map((w, i) => (
                  <div className={'dailyProfitRank__content-topThree__item rank-' + (i + 1)} key={w.userKey}>
                    <div className="rank-border" />
                    <div>
                      <img src="/assets/png/avatar-BTjdxpts.png" alt="" />
                    </div>
                    <span>{w.name}</span>
                    <span>{rupiah(w.amount)}</span>
                  </div>
                ))}
              </div>
              {daily.length > 3 ? (
                <div className="dailyProfitRank__content-list">
                  {daily.slice(3).map((w, i) => (
                    <div className="dailyProfitRank__content-list__item" key={w.userKey}>
                      <span className="left-rank">{i + 4}</span>
                      <img src="/assets/png/avatar-BTjdxpts.png" alt="" />
                      <span className="middle-name">{w.name}</span>
                      <span className="right-box">{rupiah(w.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : daily.length ? (
            <div className="dailyProfitRank__content">
              <div className="dailyProfitRank__content-list">
                {daily.map((w, i) => (
                  <div className="dailyProfitRank__content-list__item" key={w.userKey}>
                    <span className="left-rank">{i + 1}</span>
                    <img src="/assets/png/avatar-BTjdxpts.png" alt="" />
                    <span className="middle-name">{w.name}</span>
                    <span className="right-box">{rupiah(w.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="hy-note hy-profit-empty">Belum ada penarikan hari ini.</p>
          )}
        </div>

        <div className="float">
          <div
            className="rewardCenter float-entry"
            style={{ backgroundImage: 'url(/assets/png/box_open-9_JHXIXH.png)' }}
            onClick={() => navigate('/activity')}
          />
          <div
            className="big-turntable float-entry"
            style={{ backgroundImage: 'url(/assets/png/chest_btn-DT0hDMLl.png)' }}
            onClick={() => navigate('/promotion')}
          />
          <div
            className="changlongEnter float-entry"
            style={{ backgroundImage: 'url(/assets/png/start-DEMPeNSN.png)' }}
            onClick={() => navigate('/activity')}
          />
        </div>
      </div>

      <Modal open={modal === 'notif'} title="Pemberitahuan" onClose={() => setModal(null)}>
        <div className="hy-notifs">
          {NOTIFS.map((n) => (
            <div className="hy-notif" key={n.id}>
              <div className="hy-notif__dot" />
              <div>
                <b>{n.title}</b>
                <p>{n.body}</p>
                <span>{n.date}</span>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={modal === 'download'} title="Unduh Aplikasi" onClose={() => setModal(null)}>
        <div className="hy-info">
          <p>
            Versi salinan antarmuka ini berjalan langsung di browser. Untuk memasang di layar utama ponsel:
          </p>
          <ol>
            <li>Buka menu browser (Chrome/Safari).</li>
            <li>Pilih “Tambahkan ke layar utama”.</li>
            <li>Beri nama HONGYUN lalu simpan.</li>
          </ol>
          <p className="hy-note">File APK resmi hanya dibagikan melalui Customer Service. Jangan mengunduh dari sumber tidak dikenal.</p>
        </div>
        <div className="hy-row-actions">
          <button
            type="button"
            className="hy-btn"
            onClick={() => {
              setModal(null)
              window.dispatchEvent(new CustomEvent('hy:chat'))
            }}
          >
            Hubungi CS
          </button>
          <button type="button" className="hy-btn hy-btn--ghost" onClick={() => setModal(null)}>
            Tutup
          </button>
        </div>
      </Modal>

      <Customer toast={toast} />
      <TabBar route={route} navigate={navigate} toast={toast} balance={balance} setBalance={setBalance} />
    </>
  )
}
