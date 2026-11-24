import React, { useState } from 'react'
import { IconSprite, Modal, TxList, NavBar, TabBar, Customer } from '../components/Chrome.jsx'
import { rupiah } from '../data.js'
import { K, claimCommission, commissionClaimed, copyText, dateKey, read, refCode, userKey } from '../logic.js'

/* Data undangan nyata: anggota adalah akun yang mendaftar memakai kode
   akun ini (tersimpan di profil sebagai invitedBy). Komisi 0,2% untuk
   anggota langsung dan 0,1% untuk anggota tim, dihitung dari deposit
   sukses yang tercatat di akun masing-masing. */
const RATE = [0.002, 0.001]

const depositOf = (id) =>
  read(userKey(id, K.tx), []).filter((t) => t.kind === 'deposit' && t.status === 'success')

const sumOf = (list) => list.reduce((a, t) => a + t.amount, 0)

const maskId = (id) => {
  const s = String(id || '')
  if (s.includes('@')) return s.replace(/^(.{2}).*(@.*)$/, '$1•••$2')
  return '••••' + s.replace(/\D/g, '').slice(-4)
}

export default function Promotion({ route, navigate, toast, user, balance, setBalance }) {
  const [modal, setModal] = useState(null)
  const [, setVer] = useState(0)
  const refresh = () => setVer((v) => v + 1)
  const code = refCode(user?.phone)
  const invite = `${location.origin}${location.pathname}#/register?invitationCode=${code}`

  const profiles = read('f55.profiles', {})
  const members = Object.keys(profiles).filter((k) => profiles[k].invitedBy && profiles[k].invitedBy === user?.phone)
  const team = Object.keys(profiles).filter((k) => members.includes(profiles[k].invitedBy || ''))
  const labelOf = (id) => profiles[id]?.nickname || 'Member ' + maskId(id)

  const today = dateKey()
  const yKey = dateKey(new Date(Date.now() - 86400000))
  const rowsOf = (list) => list.map((id) => ({ id, tx: depositOf(id) }))
  const memberDep = rowsOf(members)
  const teamDep = rowsOf(team)
  const totalOf = (rows) => rows.reduce((a, r) => a + sumOf(r.tx), 0)
  const dayOf = (rows, key) =>
    rows.reduce((a, r) => a + sumOf(r.tx.filter((t) => t.at && dateKey(new Date(t.at)) === key)), 0)
  const depositors = (rows) => rows.filter((r) => r.tx.length > 0).length
  const comm = (deposit, rate) => Math.floor(deposit * rate)

  const memberTotal = totalOf(memberDep)
  const teamTotal = totalOf(teamDep)
  const totalComm = comm(memberTotal, RATE[0]) + comm(teamTotal, RATE[1])
  const commissionDue = Math.max(0, totalComm - commissionClaimed())
  const todayComm = comm(dayOf(memberDep, today), RATE[0]) + comm(dayOf(teamDep, today), RATE[1])
  const yComm = comm(dayOf(memberDep, yKey), RATE[0]) + comm(dayOf(teamDep, yKey), RATE[1])

  const history = [
    ...memberDep.flatMap((r) =>
      r.tx.map((t) => ({
        id: 'c1-' + r.id + '-' + t.id,
        kind: 'bonus',
        label: 'Komisi 0,2% · ' + labelOf(r.id),
        amount: comm(t.amount, RATE[0]),
        at: t.at,
        status: 'success',
      })),
    ),
    ...teamDep.flatMap((r) =>
      r.tx.map((t) => ({
        id: 'c2-' + r.id + '-' + t.id,
        kind: 'bonus',
        label: 'Komisi tim 0,1% · ' + labelOf(r.id),
        amount: comm(t.amount, RATE[1]),
        at: t.at,
        status: 'success',
      })),
    ),
  ]
    .filter((t) => t.amount > 0)
    .sort((a, b) => b.at - a.at)

  const rows = [
    ['Link undangan saya', 'Salin'],
    ['Kode undangan', code],
    ['Anggota saya', String(members.length)],
    ['Komisi saya', totalComm > 0 ? rupiah(totalComm) : ''],
    ['Riwayat komisi', history.length ? String(history.length) : ''],
    ['Cara promosi', ''],
    ['Syarat & ketentuan', ''],
  ]

  const copy = async (text, label) => {
    const ok = await copyText(text)
    toast(ok ? label + ' disalin' : 'Gagal menyalin, salin manual: ' + text)
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'HONGYUN', text: 'Daftar HONGYUN dan dapatkan bonus', url: invite })
        return
      } catch {}
    }
    copy(invite, 'Link undangan')
  }

  const claim = () => {
    const res = claimCommission(totalComm)
    if (!res.ok) return toast(res.msg)
    setBalance((v) => v + res.value)
    toast('Komisi diklaim · +' + rupiah(res.value))
    refresh()
  }

  const open = (label) => {
    if (label === 'Link undangan saya') return copy(invite, 'Link undangan')
    if (label === 'Kode undangan') return copy(code, 'Kode undangan')
    if (label === 'Anggota saya') return setModal('members')
    if (label === 'Komisi saya') return setModal('commission')
    if (label === 'Riwayat komisi') return setModal('history')
    if (label === 'Cara promosi') return setModal('how')
    return setModal('terms')
  }

  return (
    <>
      <IconSprite />
      <NavBar
        variant="white"
        title="Promosi"
        back={() => navigate('/')}
        right={
          <span style={{ fontSize: '.32rem', color: '#888', padding: '.1rem .2rem' }} onClick={() => setModal('terms')}>
            ?
          </span>
        }
      />

      <div className="container promotion-hero">
        <div className="amount">{yComm.toLocaleString('id-ID')}</div>
        <div className="amount_txt">Total komisi kemarin</div>
        <div className="tip">Tingkatkan level untuk meningkatkan komisi anda</div>
        <div className="info_content">
          <div className="info">
            <div className="head">Anggota</div>
            <div className="line1 r">
              Jumlah Daftar <b>{members.length}</b>
            </div>
            <div className="line2 r">
              Jumlah deposit <b>{depositors(memberDep)}</b>
            </div>
            <div className="line3 r">
              Total Deposit <b>{rupiah(memberTotal)}</b>
            </div>
            <div className="line1 r">
              Jumlah Pengguna yang Melakukan Deposit <b>{depositors(memberDep)}</b>
            </div>
          </div>
          <div className="info">
            <div className="head">Tim Anggota</div>
            <div className="line1">
              Jumlah Daftar <b>{team.length}</b>
            </div>
            <div className="line2">
              Jumlah deposit <b>{depositors(teamDep)}</b>
            </div>
            <div className="line3">
              Total Deposit <b>{rupiah(teamTotal)}</b>
            </div>
            <div className="line1">
              Jumlah Pengguna yang Melakukan Deposit <b>{depositors(teamDep)}</b>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="shareBtnContainer">
          <button className="shareBtn" onClick={share}>
            LINK UNDANGAN
          </button>
        </div>
        <div className="promote__cell">
          {rows.map(([label, val]) => (
            <div className="promote__cell-item" key={label} onClick={() => open(label)}>
              <div className="label">
                <span>{label}</span>
              </div>
              <div className="arrow">
                <span>{val}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="commission">
          <div className="commission__title">
            <svg className="svg-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 25V15M13 25V8M20 25v-7M27 25V11" strokeLinecap="round" />
            </svg>
            <span>Data Promosi</span>
          </div>
          <div className="commission__body" onClick={() => setModal('commission')}>
            <div>
              <span>{rupiah(todayComm)}</span>
              <span>Komisi Hari Ini</span>
            </div>
            <span />
            <div>
              <span>{rupiah(yComm)}</span>
              <span>Komisi Kemarin</span>
            </div>
          </div>
          <div className="commission__body" onClick={() => setModal('commission')}>
            <div>
              <span>{rupiah(totalComm)}</span>
              <span>Total Komisi</span>
            </div>
            <span />
            <div>
              <span>{rupiah(commissionDue)}</span>
              <span>Siap Diklaim</span>
            </div>
          </div>
        </div>
      </div>

      <Modal open={modal === 'members'} title="Anggota Saya" onClose={() => setModal(null)}>
        <div className="hy-stats">
          <div>
            <span>Anggota langsung</span>
            <b>{members.length}</b>
          </div>
          <div>
            <span>Tim anggota</span>
            <b>{team.length}</b>
          </div>
        </div>
        {members.length ? (
          <div className="hy-txlist">
            {memberDep.map((r) => (
              <div className="hy-tx" key={r.id}>
                <div className="hy-tx__left">
                  <b>{labelOf(r.id)}</b>
                  <span>Deposit {rupiah(sumOf(r.tx))}</span>
                </div>
                <div className="hy-tx__right">
                  <b className="in">{rupiah(comm(sumOf(r.tx), RATE[0]))}</b>
                  <i className="hy-chip hy-chip--success">Komisi</i>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="hy-lead">
            Belum ada anggota yang mendaftar dengan kode anda. Bagikan link undangan untuk mulai membangun tim.
          </p>
        )}
        <div className="hy-row-actions">
          <button type="button" className="hy-btn" onClick={() => copy(invite, 'Link undangan')}>
            Salin Link
          </button>
          <button type="button" className="hy-btn hy-btn--ghost" onClick={share}>
            Bagikan
          </button>
        </div>
      </Modal>

      <Modal open={modal === 'commission'} title="Komisi Saya" onClose={() => setModal(null)}>
        <div className="hy-stats">
          <div>
            <span>Hari ini</span>
            <b>{rupiah(todayComm)}</b>
          </div>
          <div>
            <span>Kemarin</span>
            <b>{rupiah(yComm)}</b>
          </div>
          <div>
            <span>Total komisi</span>
            <b>{rupiah(totalComm)}</b>
          </div>
          <div>
            <span>Siap diklaim</span>
            <b>{rupiah(commissionDue)}</b>
          </div>
        </div>
        <p className="hy-lead">
          Komisi dihitung dari total deposit anggota yang anda undang. Level 1 mendapat 0,2% dan level 2 mendapat 0,1%
          dari deposit anggota aktif. Komisi dihitung ulang otomatis dan bisa diklaim kapan saja ke saldo akun.
        </p>
        <button type="button" className="hy-btn" onClick={claim} disabled={commissionDue <= 0}>
          {commissionDue > 0 ? 'Klaim ' + rupiah(commissionDue) : 'Belum ada komisi'}
        </button>
        <button type="button" className="hy-btn hy-btn--ghost" onClick={() => copy(code, 'Kode undangan')}>
          Salin Kode Undangan
        </button>
      </Modal>

      <Modal open={modal === 'history'} title="Riwayat Komisi" onClose={() => setModal(null)}>
        <TxList items={history} empty="Belum ada komisi. Bagi link undangan untuk mulai mendapatkan komisi." />
        <button type="button" className="hy-btn hy-btn--ghost" onClick={() => copy(invite, 'Link undangan')}>
          Salin Link Undangan
        </button>
      </Modal>

      <Modal open={modal === 'how'} title="Cara Promosi" onClose={() => setModal(null)}>
        <ol className="hy-steps">
          <li>Salin link undangan atau kode unik anda.</li>
          <li>Bagikan ke teman melalui WhatsApp, Telegram, atau media sosial.</li>
          <li>Pastikan teman mendaftar lewat link anda agar tercatat sebagai anggota.</li>
          <li>Setiap deposit anggota aktif menghasilkan komisi otomatis ke akun anda.</li>
        </ol>
        <p className="hy-note">Kode unik anda: {code}</p>
        <button type="button" className="hy-btn" onClick={() => copy(invite, 'Link undangan')}>
          Salin Link
        </button>
      </Modal>

      <Modal open={modal === 'terms'} title="Syarat & Ketentuan" onClose={() => setModal(null)}>
        <ul className="hy-list">
          <li>Promosi berlaku untuk semua member terdaftar HONGYUN.</li>
          <li>Satu anggota hanya boleh memiliki satu akun undangan; duplikasi akan dibatalkan.</li>
          <li>Komisi dihitung dari deposit sah anggota, bukan dari bonus atau saldo hadiah.</li>
          <li>Deposit yang dibatalkan atau kedaluwarsa tidak dihitung.</li>
          <li>HONGYUN berhak mengubah syarat promosi dengan pemberitahuan di menu Pengumuman.</li>
          <li>Penyalahgunaan bonus dapat menyebabkan pembatalan komisi dan pembekuan akun.</li>
        </ul>
        <button type="button" className="hy-btn" onClick={() => setModal(null)}>
          Mengerti
        </button>
      </Modal>

      <Customer toast={toast} />
      <TabBar route={route} navigate={navigate} toast={toast} balance={balance} setBalance={setBalance} />
    </>
  )
}
