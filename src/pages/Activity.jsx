import React, { useState } from 'react'
import { IconSprite, Modal, Svg, TxList, NavBar, TabBar, Customer } from '../components/Chrome.jsx'
import { PROMOS, rupiah } from '../data.js'
import {
  CHECKIN,
  CODES,
  PROMO_DESC,
  bonusTx,
  checkinState,
  claimCheckin,
  claimRebate,
  dateKey,
  gameSave,
  rebateState,
  redeemCode,
  sumTx,
} from '../logic.js'

export default function Activity({ route, navigate, toast, balance, setBalance }) {
  const [modal, setModal] = useState(null)
  const [promo, setPromo] = useState(null)
  const [code, setCode] = useState('')
  const [codeMsg, setCodeMsg] = useState(null)
  const [, setVer] = useState(0)

  const refresh = () => setVer((v) => v + 1)
  const bonuses = bonusTx()
  const today = dateKey()
  const bonusToday = sumTx(bonuses.filter((t) => t.at && dateKey(new Date(t.at)) === today))
  const totalBonus = sumTx(bonuses)
  const checkin = checkinState()
  const rebate = rebateState()
  const jp = Number(gameSave()?.jp) || 0

  const doCheckin = () => {
    const res = claimCheckin()
    if (!res.ok) return toast(res.msg)
    setBalance((v) => v + res.value)
    toast(`Check-in hari ke-${res.streak} berhasil · +${rupiah(res.value)}`)
    refresh()
  }

  const doRebate = () => {
    const res = claimRebate()
    if (!res.ok) return toast(res.msg)
    setBalance((v) => v + res.value)
    toast('Rabat diklaim · +' + rupiah(res.value))
    refresh()
  }

  const doRedeem = () => {
    const res = redeemCode(code)
    if (!res.ok) {
      setCodeMsg({ ok: false, text: res.msg })
      return
    }
    setBalance((v) => v + res.value)
    setCodeMsg({ ok: true, text: `Kode ${res.code} berhasil · +${rupiah(res.value)}` })
    setCode('')
    toast('Hadiah ' + rupiah(res.value) + ' ditambahkan')
    refresh()
  }

  const dayNow = ((checkin.done ? checkin.streak : checkin.nextStreak) - 1) % 7 + 1

  return (
    <>
      <IconSprite />
      <NavBar title="" right={null} logo />
      <div className="activity-wrapper">
        <div className="activity-banner">
          <ul className="activity-bonus">
            <li onClick={() => setModal('detail')}>
              <p>Bonus Hari Ini</p>
              <h3>{rupiah(bonusToday)}</h3>
            </li>
            <li onClick={() => setModal('detail')}>
              <p>Total Bonus</p>
              <h3>{rupiah(totalBonus)}</h3>
            </li>
          </ul>
          <div className="bonus-button" onClick={() => setModal('detail')}>
            Detail Bonus
          </div>
        </div>

        <div className="activity-panel">
          <div className="activity-panel-header lg3">
            <div className="header-item" onClick={() => setModal('rabat')}>
              <div className="van-badge__wrapper">
                <div className="a3 bgcontainer" />
              </div>
              <span>Rabat taruhan</span>
            </div>
            <div className="header-item" onClick={() => setModal('jackpot')}>
              <div className="van-badge__wrapper">
                <div className="a4 bgcontainer" />
              </div>
              <span>Super Jackpot</span>
            </div>
            <div className="header-item" onClick={() => navigate('/promotion')}>
              <div className="van-badge__wrapper">
                <div className="a6 bgcontainer" />
                <div className="van-badge van-badge--top-right van-badge--dot van-badge--fixed" />
              </div>
              <span>Undang Teman</span>
            </div>
          </div>
          <div className="activity-panel-content">
            <div className="content-title" onClick={() => setModal('redeem')}>
              <img src="/assets/png/signInBanner-D5E7GDCc.png" alt="" />
              <div className="content-para">Hadiah</div>
              <p>Masukkan kode penukaran untuk mendapatkan hadiah</p>
            </div>
            <div className="content-title" onClick={() => setModal('checkin')}>
              <img src="/assets/png/giftRedeem-BneG-FUT.png" alt="" />
              <div className="content-para">Check-in Harian</div>
              <p>{checkin.done ? 'Sudah check-in hari ini — kembali besok' : `Hari ke-${checkin.nextStreak} siap diklaim`}</p>
            </div>
          </div>
        </div>

        <div className="hy-quick-panel">
          <button type="button" className="hy-quick" onClick={() => setModal('rabat')}>
            <b>Rabat 0,5%</b>
            <span>{rebate.due > 0 ? rupiah(rebate.due) + ' siap diklaim' : 'Belum ada rabat'}</span>
          </button>
        </div>

        <div className="van-list">
          <div className="activitySection__container">
            {PROMOS.map(([title, img], i) => (
              <div
                className="box"
                key={title}
                onClick={() => {
                  setPromo(i)
                  setModal('promo')
                }}
              >
                <img src={img} alt={title} loading="lazy" />
                <div className="box-content">
                  <div className="box-title">{title}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="van-list__finished-text">Tidak ada lagi</div>
        </div>
      </div>

      <Modal open={modal === 'detail'} title="Rincian Bonus" onClose={() => setModal(null)}>
        <div className="hy-stats">
          <div>
            <span>Hari ini</span>
            <b>{rupiah(bonusToday)}</b>
          </div>
          <div>
            <span>Total bonus</span>
            <b>{rupiah(totalBonus)}</b>
          </div>
        </div>
        <TxList items={bonuses} empty="Belum ada bonus. Klaim check-in atau rabat taruhan." />
      </Modal>

      <Modal open={modal === 'checkin'} title="Check-in Harian" onClose={() => setModal(null)}>
        <p className="hy-lead">Masuk setiap hari untuk bonus yang makin besar. Streak saat ini: {checkin.streak} hari.</p>
        <div className="hy-days">
          {CHECKIN.map((v, i) => {
            const d = i + 1
            const done = checkin.done ? d <= dayNow : d < dayNow
            const current = !checkin.done && d === dayNow
            return (
              <div className={'hy-day' + (done ? ' done' : '') + (current ? ' current' : '')} key={d}>
                <span>Hari {d}</span>
                <b>{rupiah(v)}</b>
                <i>{done ? '✓' : current ? 'Klaim' : ''}</i>
              </div>
            )
          })}
        </div>
        <button
          type="button"
          className="hy-btn"
          onClick={doCheckin}
          disabled={checkin.done}
        >
          {checkin.done ? 'Sudah check-in hari ini' : `Klaim ${rupiah(CHECKIN[(checkin.nextStreak - 1) % 7])}`}
        </button>
        <p className="hy-note">Reward dihitung dari hari streak ke-{(checkin.nextStreak - 1) % 7 + 1} dalam siklus 7 hari.</p>
      </Modal>

      <Modal open={modal === 'redeem'} title="Tukar Kode Hadiah" onClose={() => setModal(null)}>
        <p className="hy-lead">Masukkan kode penukaran yang valid. Setiap kode hanya bisa dipakai satu kali.</p>
        <input
          className="hy-input"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Contoh: HONGYUN2026"
        />
        {codeMsg ? <div className={'hy-alert ' + (codeMsg.ok ? 'ok' : 'err')}>{codeMsg.text}</div> : null}
        <button type="button" className="hy-btn" onClick={doRedeem} disabled={!code.trim()}>
          Tukar Kode
        </button>
        <p className="hy-note">
          Kode demo: {Object.keys(CODES).slice(0, 2).join(', ')}. Hadiah maksimal {rupiah(Math.max(...Object.values(CODES)))}.
        </p>
      </Modal>

      <Modal open={modal === 'rabat'} title="Rabat Taruhan" onClose={() => setModal(null)}>
        <div className="hy-stats">
          <div>
            <span>Total taruhan</span>
            <b>{rupiah(rebate.wagered)}</b>
          </div>
          <div>
            <span>Rabat tersedia</span>
            <b>{rupiah(rebate.due)}</b>
          </div>
        </div>
        <p className="hy-lead">
          Rabat dihitung 0,5% dari total taruhan permainan yang tersimpan di perangkat ini. Mainkan Mahjong Ways untuk
          menambah rabat.
        </p>
        <div className="hy-row-actions">
          <button type="button" className="hy-btn" onClick={doRebate} disabled={rebate.due <= 0}>
            Klaim Rabat
          </button>
          <button type="button" className="hy-btn hy-btn--ghost" onClick={() => navigate('/game/mw1')}>
            Main Mahjong
          </button>
        </div>
      </Modal>

      <Modal open={modal === 'jackpot'} title="Super Jackpot" onClose={() => setModal(null)}>
        <div className="hy-jackpot">
          <span>JACKPOT SAAT INI</span>
          <b>{jp > 0 ? rupiah(jp) : 'Menunggu pemain pertama'}</b>
        </div>
        <p className="hy-lead">
          Jackpot progresif bertambah dari setiap taruhan dan bisa dimenangkan kapan saja. Nilai di atas dibaca langsung
          dari mesin Mahjong yang tersimpan di perangkat.
        </p>
        <div className="hy-row-actions">
          <button type="button" className="hy-btn" onClick={() => navigate('/game/mw1')}>
            Main Sekarang
          </button>
          <button type="button" className="hy-btn hy-btn--ghost" onClick={() => setModal(null)}>
            Tutup
          </button>
        </div>
      </Modal>

      <Modal open={modal === 'promo'} title="Detail Promosi" onClose={() => setModal(null)}>
        {promo !== null ? (
          <>
            <img className="hy-promo-img" src={PROMOS[promo][1]} alt={PROMOS[promo][0]} />
            <h4 className="hy-promo-title">{PROMOS[promo][0]}</h4>
            <p className="hy-lead">{PROMO_DESC[promo] || 'Promosi berlaku untuk semua member aktif HONGYUN.'}</p>
            <div className="hy-row-actions">
              <button
                type="button"
                className="hy-btn"
                onClick={() => {
                  setModal(null)
                  navigate('/promotion')
                }}
              >
                Buka Halaman Promosi
              </button>
              <button type="button" className="hy-btn hy-btn--ghost" onClick={() => setModal(null)}>
                Tutup
              </button>
            </div>
          </>
        ) : null}
      </Modal>

      <Customer toast={toast} />
      <TabBar route={route} navigate={navigate} toast={toast} balance={balance} setBalance={setBalance} />
    </>
  )
}
