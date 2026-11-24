import React, { useState } from 'react'
import { IconSprite, Modal, Svg, TxList, NavBar, Customer } from '../components/Chrome.jsx'
import { rupiah } from '../data.js'
import { BANKS, addTx, getBank, maskNo, saveBank, sumTx, txOf } from '../logic.js'

const MIN = 50000
const MAX = 1000000000

export default function Withdraw({ navigate, toast, balance, setBalance }) {
  const [bank, setBank] = useState(() => getBank())
  const [amount, setAmount] = useState('')
  const [bankOpen, setBankOpen] = useState(false)
  const [guide, setGuide] = useState(false)
  const [form, setForm] = useState(() => ({
    bank: getBank()?.bank || 'BCA',
    no: getBank()?.no || '',
    name: getBank()?.name || '',
  }))
  const [, setVer] = useState(0)
  const refresh = () => setVer((v) => v + 1)

  const save = () => {
    const no = form.no.replace(/\D/g, '')
    if (no.length < 8 || no.length > 16) return toast('Nomor rekening 8–16 digit')
    if (form.name.trim().length < 3) return toast('Nama pemilik rekening minimal 3 karakter')
    const next = { bank: form.bank, no, name: form.name.trim().toUpperCase() }
    saveBank(next)
    setBank(next)
    setBankOpen(false)
    toast('Rekening bank ditautkan')
    refresh()
  }

  const submit = () => {
    const n = Number(amount)
    if (!bank) {
      setBankOpen(true)
      return toast('Tambahkan rekening bank dulu')
    }
    if (!n) return toast('Masukkan jumlah penarikan')
    if (n < MIN) return toast('Minimal penarikan ' + rupiah(MIN))
    if (n > MAX) return toast('Maksimal penarikan ' + rupiah(MAX))
    if (n > balance) return toast('Saldo tidak cukup')
    addTx({
      kind: 'withdraw',
      label: 'Penarikan · ' + bank.bank,
      amount: n,
      method: maskNo(bank.no),
      status: 'process',
    })
    setBalance((v) => v - n)
    setAmount('')
    toast('Penarikan ' + rupiah(n) + ' diproses (1–15 menit)')
    refresh()
  }

  const withdraws = txOf('withdraw')
  const processing = sumTx(withdraws, 'process')

  return (
    <>
      <IconSprite />
      <div className="withdraw__container">
        <NavBar variant="white" title="Penarikan" back={() => navigate('/main')} logo={false} />

        <div className="withdraw__container-content">
          <div className="balanceAssets">
            <div className="balanceAssets__header">
              <div className="balanceAssets__header__left">
                <img src="/assets/png/balance-DmuJO3Yz.png" alt="" />
                Saldo yang tersedia
              </div>
            </div>
            <div className="balanceAssets__main">
              <p>{rupiah(balance)}</p>
              <img
                src="/assets/png/refresh-C_mIC898.png"
                alt=""
                onClick={() => {
                  toast('Saldo terbaru: ' + rupiah(balance))
                  refresh()
                }}
              />
            </div>
          </div>

          <div className="withdrawWay">
            <div className="select">
              <div>
                <img src="/cdn/55lottery/payNameIcon/WithBeforeImgIcon2_20230912215311w8js.png" alt="" />
              </div>
              <span>Rekening Bank</span>
            </div>
          </div>

          <div className="addWithdrawType" onClick={() => setBankOpen(true)}>
            <div className="addWithdrawType-top">
              <img src="/assets/png/add-DoZcp313.png" alt="" />
              <span>{bank ? bank.bank + ' • ' + maskNo(bank.no) : 'Tambah rekening bank'}</span>
            </div>
            <div className="addWithdrawType-text">
              {bank ? bank.name + (bank.bank ? ' · ' + bank.bank : '') : 'Perlu menambahkan informasi penerima uang untuk dapat menarik uang'}
            </div>
          </div>

          <button className="withdraw-guide-link" onClick={() => setGuide(true)}>
            Cara menautkan akun
          </button>

          <div className="explain">
            <div className="input">
              <div className="place-div">Rp</div>
              <input
                className="inp"
                inputMode="numeric"
                placeholder="Jumlah penarikan"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
              />
            </div>
            <div className="hy-minmax">
              Minimal {rupiah(MIN)} ·{' '}
              <span className="hy-link" onClick={() => setAmount(String(balance))}>
                Tarik semua saldo
              </span>
            </div>
            <div className="balance bank">
              <div>
                <span>
                  Saldo yang dapat ditarik <h6 className="yellow">{rupiah(balance)}</h6>
                </span>
                <input readOnly value={amount} />
              </div>
              <div>
                <span>Jumlah penarikan yang di terima</span>
                <div className="rightD">
                  <span className="yellow">{rupiah(amount || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="recycleBtnD">
            <button className="recycleBtn" onClick={submit}>
              Penarikan
            </button>
          </div>

          <div className="Recharge__container-intro">
            <div className="Recharge__container-intro__title">
              <div className="img">
                <Svg id="i-tip" />
              </div>
              <p>Instruksi penarikan</p>
            </div>
            <div className="Recharge__container-intro__lists">
              <div className="item">
                <p>Penarikan diproses setiap hari pada pukul 00:00-23:55.</p>
                <p>Minimal penarikan {rupiah(MIN)} dan maksimal {rupiah(MAX)}.</p>
                <p>Pastikan nama rekening sama dengan nama akun terdaftar.</p>
                <p>Proses penarikan normal 1-15 menit setelah disetujui.</p>
              </div>
            </div>
          </div>

          <div className="rechargeh__container">
            <div className="record__main-title">
              <Svg id="i-tip" />
              <span>Riwayat penarikan</span>
            </div>
            {processing > 0 ? (
              <div className="hy-alert ok">Ada penarikan diproses sebesar {rupiah(processing)}.</div>
            ) : null}
            <TxList items={withdraws} empty="Belum ada penarikan." />
          </div>
        </div>
      </div>

      <Modal open={bankOpen} title={bank ? 'Ubah Rekening Bank' : 'Tambah Rekening Bank'} onClose={() => setBankOpen(false)}>
        <label className="hy-label">Bank</label>
        <div className="hy-banks">
          {BANKS.map((b) => (
            <button
              type="button"
              key={b}
              className={'hy-bank' + (form.bank === b ? ' active' : '')}
              onClick={() => setForm((f) => ({ ...f, bank: b }))}
            >
              {b}
            </button>
          ))}
        </div>
        <label className="hy-label" style={{ marginTop: '.3rem' }}>
          Nomor rekening
        </label>
        <input
          className="hy-input"
          inputMode="numeric"
          value={form.no}
          onChange={(e) => setForm((f) => ({ ...f, no: e.target.value.replace(/[^\d]/g, '') }))}
          placeholder="8–16 digit"
        />
        <label className="hy-label" style={{ marginTop: '.3rem' }}>
          Nama pemilik rekening
        </label>
        <input
          className="hy-input"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Sesuai buku tabungan"
          maxLength={40}
        />
        <p className="hy-note">Rekening harus atas nama pemilik akun. Penarikan ke rekening orang lain akan ditolak.</p>
        <button type="button" className="hy-btn" onClick={save}>
          Simpan Rekening
        </button>
      </Modal>

      <Modal open={guide} title="Cara Menautkan Akun" onClose={() => setGuide(false)}>
        <ol className="hy-steps">
          <li>Buka menu Akun → Penarikan.</li>
          <li>Tekan “Tambah rekening bank”, pilih bank, lalu masukkan nomor rekening.</li>
          <li>Isi nama pemilik sesuai buku tabungan, bukan nama panggilan.</li>
          <li>Simpan. Rekening langsung dipakai untuk pengajuan penarikan.</li>
        </ol>
        <p className="hy-note">Satu akun hanya boleh menautkan rekening atas nama sendiri.</p>
        <button type="button" className="hy-btn" onClick={() => setGuide(false)}>
          Mengerti
        </button>
      </Modal>

      <Customer toast={toast} />
    </>
  )
}
