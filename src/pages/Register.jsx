import React, { useState } from 'react'
import { IconSprite, Modal, Svg, Customer, BrandLogo } from '../components/Chrome.jsx'

export default function Register({ onRegister, navigate, toast }) {
  const [phone, setPhone] = useState('')
  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [invite, setInvite] = useState(() => {
    const q = location.hash.split('?')[1] || ''
    return new URLSearchParams(q).get('invitationCode') || ''
  })
  const [agree, setAgree] = useState(true)
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [err, setErr] = useState('')
  const [terms, setTerms] = useState(false)

  const submit = () => {
    const p = phone.replace(/\D/g, '')
    if (p.length < 9) return setErr('Nomor ponsel minimal 9 digit')
    if (pwd.length < 8) return setErr('Kata sandi minimal harus 8 digit')
    if (pwd !== pwd2) return setErr('Konfirmasi kata sandi tidak sama')
    if (!agree) return setErr('Setujui Perjanjian Privasi terlebih dahulu')
    setErr('')
    onRegister(p, invite)
  }

  return (
    <>
      <IconSprite />
      <div className="resgister__C">
        <div className="navbar main">
          <div className="navbar-fixed">
            <div className="navbar__content">
              <div className="navbar__content-left">
                <i className="van-badge__wrapper van-icon van-icon-arrow-left" onClick={() => navigate('/login')} />
              </div>
              <div className="navbar__content-center">
                <BrandLogo />
              </div>
              <div className="navbar__content-right">
                <div className="lang-chip" onClick={() => toast('Bahasa: Indonesia')}>
                  <img src="/assets/png/id-Cpq0Srsc.png" alt="" />
                  <span>ID</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="resgister__C-heading">
          <h1 className="resgister__C-heading__title">Daftar</h1>
          <div className="resgister__C-heading__subTitle">
            <span>Silakan registrasi dengan Nomor Ponsel atau Email</span>
          </div>
        </div>

        <div className="login_container-tab">
          <div className="tab active" onClick={() => toast('Registrasi saat ini melalui nomor ponsel')}>
            <Svg id="i-account" />
            <div>Registrasi Nomor Ponsel</div>
          </div>
        </div>

        <div className="resgister__C-form">
          <div className="tab-content activecontent">
            <div className="register__container">
              <div className="phoneInput__container">
                <div className="phoneInput__container-label">
                  <Svg id="i-account" />
                  <span>Nomor Ponsel</span>
                </div>
                <div className="phoneInput__container-input">
                  <div className="dropdown" onClick={() => toast('Kode negara: +62 (Indonesia)')}>
                    +62 <i className="van-icon van-icon-arrow-down" />
                  </div>
                  <input
                    inputMode="numeric"
                    placeholder="Silakan masukkan nomor telepon"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ''))}
                  />
                </div>
              </div>

              <div className="passwordInput__container">
                <div className="passwordInput__container-label">
                  <Svg id="i-lock" />
                  <span>Tetapkan kata sandi</span>
                </div>
                <div className="passwordInput__container-input">
                  <input
                    type={show1 ? 'text' : 'password'}
                    placeholder="Tetapkan kata sandi (min. 8 karakter)"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                  />
                  <img
                    className={'eye' + (show1 ? ' on' : '')}
                    src="/assets/png/eyeInvisible-NUKC6jpG.png"
                    alt=""
                    onClick={() => setShow1(!show1)}
                  />
                </div>
              </div>

              <div className="passwordInput__container">
                <div className="passwordInput__container-label">
                  <Svg id="i-lock" />
                  <span>Konfirmasi sandi</span>
                </div>
                <div className="passwordInput__container-input">
                  <input
                    type={show2 ? 'text' : 'password'}
                    placeholder="Konfirmasi sandi"
                    value={pwd2}
                    onChange={(e) => setPwd2(e.target.value)}
                  />
                  <img
                    className={'eye' + (show2 ? ' on' : '')}
                    src="/assets/png/eyeInvisible-NUKC6jpG.png"
                    alt=""
                    onClick={() => setShow2(!show2)}
                  />
                </div>
              </div>

              <div className="register__container-invitation">
                <div className="register__container-invitation__label">
                  <Svg id="i-gift" />
                  <span>Kode undangan</span>
                </div>
                <div className="register__container-invitation__input">
                  <input value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="Opsional" />
                </div>
              </div>

              {err ? <div className="reg-err">{err}</div> : null}

              <div className="register__container-remember">
                <div className="van-checkbox" onClick={() => setAgree(!agree)}>
                  <div
                    className={
                      'van-checkbox__icon van-checkbox__icon--round' + (agree ? ' van-checkbox__icon--checked' : '')
                    }
                  >
                    <i className="van-icon van-icon-success" />
                  </div>
                  <span className="van-checkbox__label">
                    Saya telah membaca dan setuju{' '}
                    <em
                      onClick={(e) => {
                        e.stopPropagation()
                        setTerms(true)
                      }}
                    >
                      【Perjanjian Privasi】
                    </em>
                  </span>
                </div>
              </div>

              <div className="register__container-button">
                <button onClick={submit}>Daftar</button>
                <button className="login" onClick={() => navigate('/login')}>
                  <div className="account">Saya memiliki akun</div>
                  <div className="loginin">Login</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={terms} title="Perjanjian Privasi" onClose={() => setTerms(false)}>
        <p className="hy-lead">
          Dengan mendaftar, anda menyetujui pengumpulan data berikut untuk keperluan operasional akun:
        </p>
        <ul className="hy-list">
          <li>Nomor ponsel atau email yang digunakan untuk masuk.</li>
          <li>Riwayat transaksi deposit, penarikan, dan klaim bonus di perangkat ini.</li>
          <li>Data permainan (taruhan, kemenangan, dan statistik) untuk perhitungan bonus.</li>
          <li>Preferensi aplikasi seperti bahasa, notifikasi, dan rekening bank tertaut.</li>
        </ul>
        <p className="hy-lead">
          Data disimpan secara lokal di browser pada salinan ini dan tidak dikirim ke server. Anda dapat menghapusnya
          dengan keluar dari akun atau membersihkan data situs.
        </p>
        <p className="hy-note">Bermain hanya untuk usia 18+. Hubungi CS jika ingin menghapus data akun.</p>
        <div className="hy-row-actions">
          <button
            type="button"
            className="hy-btn"
            onClick={() => {
              setAgree(true)
              setTerms(false)
              toast('Perjanjian privasi disetujui')
            }}
          >
            Setuju
          </button>
          <button type="button" className="hy-btn hy-btn--ghost" onClick={() => setTerms(false)}>
            Tutup
          </button>
        </div>
      </Modal>

      <Customer toast={toast} />
    </>
  )
}
