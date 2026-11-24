import React, { useEffect, useState } from 'react'
import { IconSprite, Modal, Svg, TxList, NavBar, Customer } from '../components/Chrome.jsx'
import { PAY_METHODS, QUICK_AMOUNTS, rupiah } from '../data.js'
import {
  addTx,
  clearPendingDeposit,
  copyText,
  getPendingDeposit,
  setPendingDeposit,
  txOf,
  updateTx,
} from '../logic.js'

const MIN = 20000
const MAX = 100000000
const LIFE = 15 * 60 * 1000

const fmtLeft = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')
}

export default function Deposit({ navigate, toast, balance, setBalance }) {
  const [method, setMethod] = useState(0)
  const [amount, setAmount] = useState('')
  const [pending, setPending] = useState(() => getPendingDeposit())
  const [left, setLeft] = useState(0)
  const [payOpen, setPayOpen] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [, setVer] = useState(0)
  const refresh = () => setVer((v) => v + 1)

  useEffect(() => {
    if (!pending) {
      setLeft(0)
      return undefined
    }
    setLeft(pending.exp - Date.now())
    const t = setInterval(() => {
      const ms = pending.exp - Date.now()
      setLeft(ms)
      if (ms <= 0) {
        updateTx(pending.id, { status: 'cancel' })
        clearPendingDeposit()
        setPending(null)
        setPayOpen(false)
        toast('Pesanan deposit kedaluwarsa')
        refresh()
      }
    }, 1000)
    return () => clearInterval(t)
  }, [pending, toast])

  useEffect(() => {
    if (pending) {
      const idx = PAY_METHODS.findIndex((m) => m.label === pending.method)
      if (idx >= 0) setMethod(idx)
    }
  }, [pending])

  const pick = (label) => {
    const n = { K: 1e3, M: 1e6 }[label.slice(-1)]
    setAmount(String(parseFloat(label) * n))
  }

  const submit = () => {
    const n = Number(amount)
    if (!n) return toast('Masukkan jumlah deposit')
    if (n < MIN) return toast('Minimal deposit ' + rupiah(MIN))
    if (n > MAX) return toast('Maksimal deposit ' + rupiah(MAX))
    if (pending) {
      setPayOpen(true)
      return toast('Selesaikan pesanan yang masih aktif')
    }
    const label = PAY_METHODS[method].label
    const tx = addTx({ kind: 'deposit', label: 'Deposit · ' + label, amount: n, method: label, status: 'pending' })
    const p = { id: tx.id, n, method: label, at: Date.now(), exp: Date.now() + LIFE }
    setPendingDeposit(p)
    setPending(p)
    setAmount('')
    setPayOpen(true)
    toast('Order dibuat — selesaikan pembayaran')
    refresh()
  }

  const confirmPay = () => {
    if (!pending) return
    setVerifying(true)
    setTimeout(() => {
      updateTx(pending.id, { status: 'success' })
      setBalance((v) => v + pending.n)
      clearPendingDeposit()
      setPending(null)
      setPayOpen(false)
      setVerifying(false)
      toast('Pembayaran berhasil, saldo ditambahkan')
      refresh()
    }, 1200)
  }

  const cancelOrder = () => {
    if (!pending) return
    updateTx(pending.id, { status: 'cancel' })
    clearPendingDeposit()
    setPending(null)
    setPayOpen(false)
    toast('Pesanan deposit dibatalkan')
    refresh()
  }

  const copyNo = async (text) => {
    const ok = await copyText(text)
    toast(ok ? 'Nomor pembayaran disalin' : 'Gagal menyalin')
  }

  const vaNo = pending ? '8277' + String(pending.id).replace(/\D/g, '').slice(-10).padStart(10, '0') : ''
  const phoneNo = pending ? '+62 812 0000 ' + String(pending.id).replace(/\D/g, '').slice(-4) : ''
  const deposits = txOf('deposit')

  return (
    <>
      <IconSprite />
      <div className="Recharge__box">
        <div className="Recharge__container">
          <NavBar variant="white" title="Deposit" back={() => navigate('/main')} logo={false} />

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

          <div>
            <div className="Recharge__container-tabcard">
              {PAY_METHODS.map((m, i) => (
                <div
                  className={'Recharge__container-tabcard__items' + (i === method ? ' active' : '')}
                  key={m.key}
                  onClick={() => {
                    if (pending) return toast('Selesaikan pesanan ' + pending.method + ' terlebih dahulu')
                    setMethod(i)
                  }}
                >
                  <div className="centers">
                    <div className="Recharge__container-tabcard__top">
                      <img className="img" src={m.icon} alt={m.label} />
                    </div>
                    <div className="Recharge__container-tabcard__bot">{m.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="Recharge__content">
            <div className="Recharge__content-smartPick boxStyle">
              <div className="Recharge__content-smartPick__icon">
                <Svg id="i-bolt" />
              </div>
              <div className="Recharge__content-smartPick__text">
                <p>Saluran deposit</p>
                <h3>Pilihan cerdas</h3>
              </div>
              <div
                className="Recharge__content-smartPick__tag"
                onClick={() => toast('Saluran otomatis: ' + PAY_METHODS[method].label)}
              >
                <i className="van-badge__wrapper van-icon van-icon-success" />
                <span>Otomatis</span>
              </div>
            </div>

            <div className="Recharge__content-paymoney boxStyle">
              <div className="Recharge__content-paymoney__title">
                <Svg id="i-coin" />
                <p>Total Deposit</p>
              </div>
              <div className="Recharge__content-paymoney__money-list">
                {QUICK_AMOUNTS.map((a) => (
                  <div
                    className={
                      'Recharge__content-paymoney__money-list__item' +
                      (Number(amount) === Number({ K: 1e3, M: 1e6 }[a.slice(-1)]) * parseFloat(a) ? ' active' : '')
                    }
                    key={a}
                    onClick={() => pick(a)}
                  >
                    <div className="amount">{a}</div>
                  </div>
                ))}
              </div>
              <div className="Recharge__content-paymoney__money-input">
                <div className="place-div">Rp</div>
                <div className="van-cell van-field amount-input">
                  <div className="van-cell__value van-field__value">
                    <input
                      inputMode="numeric"
                      placeholder="Masukkan jumlah deposit"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                    />
                  </div>
                </div>
                <div className="place-right" onClick={() => setAmount('')}>
                  <img src="/assets/png/clean-5LB9YC2p.png" alt="" />
                </div>
              </div>
              <div className="hy-minmax">
                Minimal {rupiah(MIN)} · Maksimal {rupiah(MAX)}
              </div>
            </div>

            {pending ? (
              <div className="Recharge__content-waitPay boxStyle" style={{ display: 'block' }}>
                <img src="/assets/png/tip-DQmUwn25.png" alt="" />
                <div className="wait_text">Anda memiliki 1 pesanan yang belum dibayar</div>
                <div className="Recharge__content-waitPay__countdown">
                  <span>{fmtLeft(left).split(':')[0]}</span>
                  <span>:</span>
                  <span>{fmtLeft(left).split(':')[1]}</span>
                </div>
                <div className="hy-row-actions">
                  <div className="go_pay" onClick={() => setPayOpen(true)}>
                    Bayar Sekarang
                  </div>
                  <button type="button" className="hy-btn hy-btn--ghost" onClick={cancelOrder}>
                    Batalkan
                  </button>
                </div>
              </div>
            ) : null}

            <div className="Recharge__content-fixed">
              <div className="Recharge__content-fixed-box">
                <div className="Recharge__content-fixed-info">
                  <p>Metode Deposit · {PAY_METHODS[method].label}</p>
                  <h2 className="smart">Saluran · Pilihan cerdas</h2>
                </div>
                <div className="Recharge__container-rechageBtn" onClick={submit}>
                  {pending ? 'Lihat Pesanan' : 'Deposit'}
                </div>
              </div>
            </div>
          </div>

          <div className="Recharge__container-intro">
            <div className="Recharge__container-intro__title">
              <div className="img">
                <Svg id="i-tip" />
              </div>
              <p>Instruksi deposit</p>
            </div>
            <div className="Recharge__container-intro__lists">
              <div className="item">
                <p>Jika waktu transfer sudah habis, silahkan buat order deposit baru.</p>
                <p>Jumlah transfer harus sesuai dengan form deposit, termasuk 3 digit terakhir.</p>
                <p>Jika anda mentransfer jumlah yang salah, hubungi customer service.</p>
                <p>Catatan: jangan membatalkan formulir deposit setelah transfer.</p>
              </div>
            </div>
          </div>

          <div className="record__main">
            <div className="record__main-title">
              <Svg id="i-tip" />
              <span>Riwayat deposit</span>
            </div>
            <TxList items={deposits} empty="Belum ada deposit. Buat order pertama anda di atas." />
          </div>
        </div>
      </div>

      <Modal open={payOpen && !!pending} title="Selesaikan Pembayaran" onClose={() => setPayOpen(false)}>
        {pending ? (
          <>
            <div className="hy-pay">
              <div>
                <span>Metode</span>
                <b>{pending.method}</b>
              </div>
              <div>
                <span>Jumlah</span>
                <b>{rupiah(pending.n)}</b>
              </div>
              <div>
                <span>Batas waktu</span>
                <b>{fmtLeft(left)}</b>
              </div>
            </div>

            {pending.method === 'Virtual Account' ? (
              <div className="hy-payinfo">
                <span>Nomor Virtual Account</span>
                <b>{vaNo}</b>
                <button type="button" className="hy-btn hy-btn--ghost" onClick={() => copyNo(vaNo)}>
                  Salin Nomor
                </button>
                <p>Transfer tepat {rupiah(pending.n)} ke nomor VA di atas melalui m-banking atau ATM.</p>
              </div>
            ) : pending.method === 'LinkAja' ? (
              <div className="hy-payinfo">
                <span>Tujuan LinkAja</span>
                <b>{phoneNo}</b>
                <button type="button" className="hy-btn hy-btn--ghost" onClick={() => copyNo(phoneNo)}>
                  Salin Nomor
                </button>
                <p>Kirim {rupiah(pending.n)} ke akun LinkAja di atas, lalu tekan tombol konfirmasi.</p>
              </div>
            ) : (
              <div className="hy-payinfo">
                <span>QRIS</span>
                <div className="hy-qr">
                  <b>QRIS</b>
                  <i>Scan dengan aplikasi e-wallet atau m-banking</i>
                  <em>{rupiah(pending.n)}</em>
                </div>
                <p>Nominal sudah terisi otomatis. Jangan mengubah nominal saat membayar.</p>
              </div>
            )}

            <div className="hy-row-actions">
              <button type="button" className="hy-btn" onClick={confirmPay} disabled={verifying || left <= 0}>
                {verifying ? 'Memverifikasi...' : 'Saya Sudah Bayar'}
              </button>
              <button type="button" className="hy-btn hy-btn--ghost" onClick={cancelOrder} disabled={verifying}>
                Batalkan
              </button>
            </div>
            <p className="hy-note">Saldo ditambahkan otomatis setelah pembayaran terverifikasi.</p>
          </>
        ) : null}
      </Modal>

      <Customer toast={toast} />
    </>
  )
}
