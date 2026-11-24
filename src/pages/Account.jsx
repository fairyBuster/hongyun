import React, { useState } from 'react'
import { IconSprite, Modal, Svg, TxList, TabBar, Customer } from '../components/Chrome.jsx'
import { MJ_GAMES, rupiah } from '../data.js'
import {
  K,
  NOTIFS,
  PRODUCT_CODE,
  TOURNEYS,
  VIP_TIERS,
  GUIDE_STEPS,
  bonusTx,
  copyText,
  gameKey,
  gameSave,
  gameStats,
  markNotifRead,
  notifRead,
  read,
  saveSettings,
  settings,
  statusText,
  sumTx,
  timeText,
  txAll,
  txOf,
  write,
} from '../logic.js'

const FIN = [
  ['i-bet', 'Taruhan', 'Riwayat taruhan'],
  ['i-tr', 'Transaksi', 'Riwayat transaksi'],
  ['i-in', 'Deposit', 'Riwayat deposit'],
  ['i-out', 'Penarikan', 'Riwayat Penarikan'],
]

const SETTINGS = [
  ['i-bell', 'Pemberitahuan'],
  ['i-gift', 'Hadiah'],
  ['i-coupon', 'Kupon deposit saya'],
  ['i-trophy', 'turnamen saya'],
  ['i-code', 'Kode produk'],
  ['i-stats', 'Statistik permainan'],
  ['i-lang', 'Bahasa'],
]

const HELP = [
  ['i-settings', 'Pengaturan'],
  ['i-feedback', 'Masukan'],
  ['i-announce', 'Pengumuman'],
  ['i-service', 'Pelayanan pelanggan'],
  ['i-guide', 'Panduan Pemula'],
  ['i-about', 'Tentang kami'],
]

const AVATARS = ['/assets/png/1-Cz2mt-nl.png', '/assets/png/avatar-BTjdxpts.png']

export default function Account({ route, navigate, toast, user, balance, setBalance, logout, updateUser }) {
  const [modal, setModal] = useState(null)
  const [nick, setNick] = useState(user?.nickname || '')
  const [fb, setFb] = useState('')
  const [fbSent, setFbSent] = useState(false)
  const [prefs, setPrefs] = useState(() => settings())
  const [, setVer] = useState(0)
  const refresh = () => setVer((v) => v + 1)

  const tx = txAll()
  const deposits = txOf('deposit')
  const withdraws = txOf('withdraw')
  const gifts = bonusTx()
  const stats = gameStats()
  const hist = gameSave()?.hist || []
  const unread = Math.max(0, NOTIFS.length - notifRead().length)
  const avatar = user?.avatar || AVATARS[0]

  const spend = sumTx(deposits) + stats.wagered
  const tierIdx = VIP_TIERS.reduce((acc, t, i) => (spend >= t.min ? i : acc), 0)
  const tier = VIP_TIERS[tierIdx]
  const nextTier = VIP_TIERS[tierIdx + 1]
  const vipPct = nextTier ? Math.min(100, Math.round(((spend - tier.min) / (nextTier.min - tier.min)) * 100)) : 100
  const winRate = stats.spins ? Math.round((stats.wins / stats.spins) * 100) : 0
  const rtp = stats.wagered ? ((stats.won / stats.wagered) * 100).toFixed(1) : '0.0'

  const copy = async (text, label) => {
    const ok = await copyText(text)
    toast(ok ? label + ' disalin' : 'Gagal menyalin')
  }

  const open = (name) => {
    if (name === 'notif' || name === 'announce') markNotifRead(NOTIFS.map((n) => n.id))
    setModal(name)
  }

  const saveNick = () => {
    const v = nick.trim()
    if (v.length < 3) return toast('Nama panggilan minimal 3 karakter')
    if (v.length > 16) return toast('Nama panggilan maksimal 16 karakter')
    if (updateUser) updateUser({ nickname: v })
    toast('Nama panggilan diperbarui')
    setModal(null)
  }

  const pickAvatar = (src) => {
    if (updateUser) updateUser({ avatar: src })
    toast('Avatar diperbarui')
    setModal(null)
  }

  const togglePref = (key) => {
    const val = !prefs[key]
    setPrefs((p) => ({ ...p, [key]: val }))
    saveSettings({ [key]: val })
    if (key === 'sfx' || key === 'music') {
      const raw = gameSave()
      if (raw && Object.prototype.hasOwnProperty.call(raw, key)) write(gameKey(user?.phone), { ...raw, [key]: val })
    }
    refresh()
  }

  const sendFeedback = () => {
    const t = fb.trim()
    if (t.length < 5) return toast('Tulis masukan minimal 5 karakter')
    write(K.feedback, [{ text: t, at: Date.now() }, ...read(K.feedback, [])].slice(0, 30))
    setFb('')
    setFbSent(true)
    toast('Masukan terkirim. Terima kasih!')
    refresh()
  }

  const settingVal = (label) => {
    if (label === 'Pemberitahuan') return unread > 0 ? String(unread) : 'Aktif'
    if (label === 'Hadiah') return String(gifts.length)
    if (label === 'turnamen saya') return String(TOURNEYS.length)
    if (label === 'Bahasa') return 'Bahasa Indonesia'
    return ''
  }

  const settingClick = (label) => {
    if (label === 'Pemberitahuan') open('notif')
    else if (label === 'Hadiah') open('gift')
    else if (label === 'Kupon deposit saya') open('coupon')
    else if (label === 'turnamen saya') open('tourney')
    else if (label === 'Kode produk') open('product')
    else if (label === 'Statistik permainan') open('stats')
    else open('lang')
  }

  const helpClick = (label) => {
    if (label === 'Pengaturan') open('settings')
    else if (label === 'Masukan') {
      setFbSent(false)
      open('feedback')
    } else if (label === 'Pengumuman') open('announce')
    else if (label === 'Pelayanan pelanggan') open('cs')
    else if (label === 'Panduan Pemula') open('guide')
    else open('about')
  }

  return (
    <>
      <IconSprite />
      <div className="userInfo__container">
        <div className="userInfo__container-content">
          <div className="userInfo__container-content-wrapper">
            <div className="userInfo__container-content__avatar">
              <img className="userAvatar" src={avatar} alt="" onClick={() => setModal('avatar')} />
            </div>
            <div className="userInfo__container-content__name">
              <div className="userInfo__container-content-nickname">
                <h3>{user?.nickname}</h3>
                <div
                  className="n0"
                  onClick={() => {
                    setNick(user?.nickname || '')
                    setModal('nick')
                  }}
                >
                  <Svg id="i-edit" style={{ width: '.5rem', height: '.5rem' }} />
                </div>
              </div>
              <div className="userInfo__container-content-uid" onClick={() => copy(user?.uid || '', 'UID')}>
                <span>UID</span>
                <span>|</span>
                <span>{user?.uid}</span>
                <Svg id="i-copy" style={{ width: '.3rem', height: '.3rem' }} />
              </div>
              <div className="userInfo__container-content-logintime">
                <span>Login terakhir:</span>
                <span>{user?.loginAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="userinfo-content">
        <div className="totalSavings__container">
          <div className="totalSavings__container-header">
            <div className="totalSavings__container-header-box">
              <div className="balance_info">
                <div className="totalSavings__container-header__title">
                  <span>Jumlah saldo</span>
                </div>
                <p className="totalSavings__container-header__subtitle">{rupiah(balance)}</p>
              </div>
            </div>
          </div>
          <div className="totalSavings__container-content">
            <div className="totalSavings__container-content-item" onClick={() => open('wallet')}>
              <div>
                <Svg id="i-wallet" />
                <span>Dompet</span>
              </div>
            </div>
            <div className="totalSavings__container-content-item" onClick={() => navigate('/wallet/Recharge')}>
              <div>
                <Svg id="i-in" />
                <span>Deposit</span>
              </div>
            </div>
            <div className="totalSavings__container-content-item" onClick={() => navigate('/wallet/Withdraw')}>
              <div>
                <Svg id="i-out" />
                <span>Penarikan</span>
              </div>
            </div>
            <div className="totalSavings__container-content-item" onClick={() => open('vip')}>
              <div>
                <Svg id="i-vip" />
                <span>VIP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="financialServices__container">
          <div className="financialServices__container-box">
            {FIN.map(([icon, title, sub]) => (
              <div
                key={title}
                onClick={() => {
                  if (title === 'Taruhan') open('fin-bet')
                  else if (title === 'Transaksi') open('fin-tx')
                  else if (title === 'Deposit') open('fin-dep')
                  else open('fin-with')
                }}
              >
                <Svg id={icon} />
                <div className="financialServices__container-box-para">
                  <h3>{title}</h3>
                  <span>{sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="settingPanel__container">
          <div className="settingPanel__container-items">
            {SETTINGS.map(([icon, label]) => {
              const val = settingVal(label)
              return (
                <div
                  className="settingPanel__container-items__item ar-1px-b"
                  key={label}
                  onClick={() => settingClick(label)}
                >
                  <div className="settingPanel__container-items__title">
                    <Svg id={icon} />
                    <span>{label}</span>
                  </div>
                  <div className="settingPanel__container-items-right">
                    {val ? <h5>{val}</h5> : null}
                    <i className="van-badge__wrapper van-icon van-icon-arrow" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="serviceCenter-wrap">
          <div className="serviceCenter__container">
            <h1>Pusat Bantuan</h1>
            <div className="serviceCenter__container-items">
              {HELP.map(([icon, label]) => (
                <div className="serviceCenter__container-items__item" key={label} onClick={() => helpClick(label)}>
                  <Svg id={icon} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="serviceCenter-wrap-header">
            <button onClick={() => setModal('logout')}>
              <Svg id="i-logout" />
              Keluar
            </button>
          </div>
        </div>
      </div>

      <Modal open={modal === 'avatar'} title="Ubah Avatar" onClose={() => setModal(null)}>
        <div className="hy-avatars">
          {AVATARS.map((src) => (
            <button
              type="button"
              key={src}
              className={'hy-avatar' + (avatar === src ? ' active' : '')}
              onClick={() => pickAvatar(src)}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
        <p className="hy-note">Pilih salah satu avatar. Perubahan langsung tersimpan di akun ini.</p>
      </Modal>

      <Modal open={modal === 'nick'} title="Ubah Nama Panggilan" onClose={() => setModal(null)}>
        <input className="hy-input" value={nick} onChange={(e) => setNick(e.target.value)} maxLength={16} />
        <p className="hy-note">3–16 karakter. Nama akan tampil di profil dan papan pemenang.</p>
        <button type="button" className="hy-btn" onClick={saveNick}>
          Simpan
        </button>
      </Modal>

      <Modal open={modal === 'vip'} title="Level VIP" onClose={() => setModal(null)}>
        <div className="hy-vip">
          <b>{tier.name}</b>
          <span>Total transaksi: {rupiah(spend)}</span>
          <div className="hy-progress">
            <i style={{ width: vipPct + '%' }} />
          </div>
          <span>{nextTier ? `Menuju ${nextTier.name}: ${rupiah(nextTier.min - spend)} lagi` : 'Level tertinggi tercapai'}</span>
        </div>
        <div className="hy-list">
          {VIP_TIERS.map((t) => (
            <div className={'hy-tier' + (t.name === tier.name ? ' active' : '')} key={t.name}>
              <b>{t.name}</b>
              <span>Mulai {rupiah(t.min)}</span>
              <em>{t.note}</em>
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={modal === 'wallet'} title="Dompet" onClose={() => setModal(null)}>
        <div className="hy-wallet">
          <span>Saldo tersedia</span>
          <b>{rupiah(balance)}</b>
        </div>
        <div className="hy-stats">
          <div>
            <span>Total deposit</span>
            <b>{rupiah(sumTx(deposits))}</b>
          </div>
          <div>
            <span>Total penarikan</span>
            <b>{rupiah(sumTx(withdraws, null))}</b>
          </div>
          <div>
            <span>Total bonus</span>
            <b>{rupiah(sumTx(gifts))}</b>
          </div>
          <div>
            <span>Transaksi</span>
            <b>{tx.length}</b>
          </div>
        </div>
        <div className="hy-row-actions">
          <button type="button" className="hy-btn" onClick={() => navigate('/wallet/Recharge')}>
            Deposit
          </button>
          <button type="button" className="hy-btn hy-btn--ghost" onClick={() => navigate('/wallet/Withdraw')}>
            Tarik Dana
          </button>
        </div>
      </Modal>

      <Modal open={modal === 'fin-bet'} title="Riwayat Taruhan" onClose={() => setModal(null)}>
        {hist.length ? (
          <div className="hy-txlist">
            {hist.map((h, i) => {
              const name = MJ_GAMES.find((g) => g.id === h.g)?.name || h.g
              return (
                <div className="hy-tx" key={h.t + '-' + i}>
                  <div className="hy-tx__left">
                    <b>{name}</b>
                    <span>
                      {timeText(h.t)} · taruhan {rupiah(h.bet)}
                    </span>
                  </div>
                  <div className="hy-tx__right">
                    <b className={h.win > 0 ? 'in' : 'out'}>{h.win > 0 ? '+' + rupiah(h.win) : 'Tidak menang'}</b>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="hy-empty">
            <Svg id="i-empty" style={{ width: '2.4rem', height: '1.6rem' }} />
            <p>Belum ada taruhan. Mainkan Mahjong Ways untuk mencatat riwayat.</p>
          </div>
        )}
        <button type="button" className="hy-btn" onClick={() => navigate('/game/mw1')}>
          Main Mahjong
        </button>
      </Modal>

      <Modal open={modal === 'fin-tx'} title="Riwayat Transaksi" onClose={() => setModal(null)}>
        <TxList items={tx} empty="Belum ada transaksi. Lakukan deposit pertama anda." />
        <button type="button" className="hy-btn" onClick={() => navigate('/wallet/Recharge')}>
          Deposit Sekarang
        </button>
      </Modal>

      <Modal open={modal === 'fin-dep'} title="Riwayat Deposit" onClose={() => setModal(null)}>
        <TxList items={deposits} empty="Belum ada deposit." />
        <button type="button" className="hy-btn" onClick={() => navigate('/wallet/Recharge')}>
          Buat Deposit
        </button>
      </Modal>

      <Modal open={modal === 'fin-with'} title="Riwayat Penarikan" onClose={() => setModal(null)}>
        <TxList items={withdraws} empty="Belum ada penarikan." />
        <button type="button" className="hy-btn" onClick={() => navigate('/wallet/Withdraw')}>
          Ajukan Penarikan
        </button>
      </Modal>

      <Modal open={modal === 'notif' || modal === 'announce'} title="Pemberitahuan" onClose={() => setModal(null)}>
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

      <Modal open={modal === 'gift'} title="Hadiah Saya" onClose={() => setModal(null)}>
        <TxList items={gifts} empty="Belum ada hadiah. Klaim check-in atau rabat taruhan." />
      </Modal>

      <Modal open={modal === 'coupon'} title="Kupon Deposit" onClose={() => setModal(null)}>
        <div className="hy-empty">
          <Svg id="i-empty" style={{ width: '2.4rem', height: '1.6rem' }} />
          <p>Belum ada kupon. Kupon dibagikan saat promo deposit tertentu berlangsung.</p>
        </div>
        <button type="button" className="hy-btn" onClick={() => navigate('/promotion')}>
          Lihat Promosi
        </button>
      </Modal>

      <Modal open={modal === 'tourney'} title="Turnamen Saya" onClose={() => setModal(null)}>
        <div className="hy-tourneys">
          {TOURNEYS.map((t) => (
            <div className="hy-tourney" key={t.id}>
              <div>
                <b>{t.name}</b>
                <span>
                  {t.period} · Hadiah {t.prize}
                </span>
              </div>
              <div className="hy-tourney__right">
                <i className={'hy-chip ' + (t.status === 'Berlangsung' ? 'hy-chip--success' : 'hy-chip--pending')}>
                  {t.status}
                </i>
                <button type="button" onClick={() => navigate('/game/' + t.game)}>
                  {t.status === 'Berlangsung' ? 'Main' : 'Detail'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={modal === 'product'} title="Kode Produk" onClose={() => setModal(null)}>
        <p className="hy-lead">Kode produk akun anda. Berikan kode ini kepada CS saat membutuhkan verifikasi.</p>
        <div className="hy-code">{PRODUCT_CODE(user?.uid)}</div>
        <button type="button" className="hy-btn" onClick={() => copy(PRODUCT_CODE(user?.uid), 'Kode produk')}>
          Salin Kode
        </button>
      </Modal>


      <Modal open={modal === 'stats'} title="Statistik Permainan" onClose={() => setModal(null)}>
        <div className="hy-stats">
          <div>
            <span>Total spin</span>
            <b>{stats.spins}</b>
          </div>
          <div>
            <span>Win rate</span>
            <b>{winRate}%</b>
          </div>
          <div>
            <span>Total taruhan</span>
            <b>{rupiah(stats.wagered)}</b>
          </div>
          <div>
            <span>Total menang</span>
            <b>{rupiah(stats.won)}</b>
          </div>
          <div>
            <span>Menang terbesar</span>
            <b>{rupiah(stats.best)}</b>
          </div>
          <div>
            <span>RTP kamu</span>
            <b>{rtp}%</b>
          </div>
        </div>
        <p className="hy-note">Statistik dibaca dari penyimpanan mesin Mahjong di perangkat ini.</p>
        <button type="button" className="hy-btn" onClick={() => navigate('/game/mw1')}>
          Main Mahjong
        </button>
      </Modal>

      <Modal open={modal === 'lang'} title="Bahasa" onClose={() => setModal(null)}>
        <div className="hy-list">
          <button
            type="button"
            className="hy-choice active"
            onClick={() => {
              saveSettings({ lang: 'id' })
              toast('Bahasa: Indonesia')
              setModal(null)
            }}
          >
            <span>Bahasa Indonesia</span>
            <i>✓</i>
          </button>
          <button type="button" className="hy-choice" disabled>
            <span>English</span>
            <i>Segera</i>
          </button>
        </div>
        <p className="hy-note">Versi bahasa Inggris sedang disiapkan. Pilihan tersimpan untuk perangkat ini.</p>
      </Modal>

      <Modal open={modal === 'settings'} title="Pengaturan" onClose={() => setModal(null)}>
        <div className="hy-toggles">
          {[
            ['push', 'Notifikasi push', 'Pemberitahuan promo dan transaksi'],
            ['sfx', 'Efek suara game', 'Suara spin dan kemenangan'],
            ['music', 'Musik latar', 'Musik di dalam permainan'],
            ['vibrate', 'Getar', 'Umpan balik haptic di ponsel'],
          ].map(([key, label, desc]) => (
            <div className="hy-toggle-row" key={key}>
              <div>
                <b>{label}</b>
                <span>{desc}</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={!!prefs[key]}
                className={'hy-switch' + (prefs[key] ? ' on' : '')}
                onClick={() => togglePref(key)}
              >
                <i />
              </button>
            </div>
          ))}
        </div>
        <p className="hy-note">Efek suara dan musik juga diterapkan ke mesin Mahjong di perangkat ini.</p>
      </Modal>

      <Modal open={modal === 'feedback'} title="Masukan" onClose={() => setModal(null)}>
        {fbSent ? (
          <div className="hy-alert ok">Masukan anda sudah terkirim. Terima kasih telah membantu kami.</div>
        ) : (
          <>
            <p className="hy-lead">Ceritakan kendala atau saran anda untuk aplikasi HONGYUN.</p>
            <textarea
              className="hy-input hy-textarea"
              value={fb}
              onChange={(e) => setFb(e.target.value)}
              maxLength={500}
              placeholder="Tulis masukan..."
            />
            <button type="button" className="hy-btn" onClick={sendFeedback}>
              Kirim Masukan
            </button>
          </>
        )}
      </Modal>

      <Modal open={modal === 'cs'} title="Pelayanan Pelanggan" onClose={() => setModal(null)}>
        <p className="hy-lead">CS HONGYUN online 24 jam. Pilih saluran yang anda inginkan:</p>
        <div className="hy-channels">
          <button
            type="button"
            onClick={() => {
              setModal(null)
              window.dispatchEvent(new CustomEvent('hy:chat'))
            }}
          >
            <b>Live Chat</b>
            <span>Balasan tercepat · 24 jam</span>
          </button>
          <button type="button" onClick={() => copy('cs@hongyun.example', 'Email CS')}>
            <b>Email</b>
            <span>cs@hongyun.example</span>
          </button>
          <button type="button" onClick={() => copy('+62 812 0000 0000', 'Nomor CS')}>
            <b>WhatsApp</b>
            <span>+62 812 0000 0000</span>
          </button>
        </div>
        <p className="hy-note">CS tidak pernah meminta kata sandi atau kode OTP anda.</p>
      </Modal>

      <Modal open={modal === 'guide'} title="Panduan Pemula" onClose={() => setModal(null)}>
        <ol className="hy-steps">
          {GUIDE_STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <button
          type="button"
          className="hy-btn"
          onClick={() => {
            setModal(null)
            navigate('/wallet/Recharge')
          }}
        >
          Mulai Deposit
        </button>
      </Modal>

      <Modal open={modal === 'about'} title="Tentang Kami" onClose={() => setModal(null)}>
        <div className="hy-about">
          <b>HONGYUN</b>
          <span>Versi antarmuka 1.0.0</span>
        </div>
        <p className="hy-lead">
          HONGYUN adalah platform hiburan digital. Salinan ini menjalankan antarmuka dan mesin Mahjong secara lokal di
          browser; tidak ada transaksi uang sungguhan yang diproses.
        </p>
        <p className="hy-note">© 2026 HONGYUN. Bermainlah secara bertanggung jawab. 18+.</p>
      </Modal>

      <Modal open={modal === 'logout'} title="Keluar" onClose={() => setModal(null)}>
        <p className="hy-lead">Apakah anda yakin ingin keluar dari akun ini?</p>
        <div className="hy-row-actions">
          <button
            type="button"
            className="hy-btn"
            onClick={() => {
              setModal(null)
              logout()
            }}
          >
            Ya, Keluar
          </button>
          <button type="button" className="hy-btn hy-btn--ghost" onClick={() => setModal(null)}>
            Batal
          </button>
        </div>
      </Modal>

      <Customer toast={toast} />
      <TabBar route={route} navigate={navigate} toast={toast} balance={balance} setBalance={setBalance} />
    </>
  )
}
