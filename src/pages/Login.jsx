import React, { useState } from 'react'
import { IconSprite, Modal, Svg, Customer, BrandLogo } from '../components/Chrome.jsx'
import { K, read, saveSettings, write } from '../logic.js'

const COUNTRIES = [
  ['+62', 'Indonesia', 'id-Cpq0Srsc.png'],
  ['+60', 'Malaysia', 'id-Cpq0Srsc.png'],
  ['+65', 'Singapura', 'id-Cpq0Srsc.png'],
]

export default function Login({ onLogin, navigate, toast }) {
  const saved = read(K.remember, '')
  const [tab, setTab] = useState(saved.includes('@') ? 'email' : 'phone')
  const [phone, setPhone] = useState(saved.includes('@') ? '' : saved)
  const [email, setEmail] = useState(saved.includes('@') ? saved : '')
  const [pwd, setPwd] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(!!saved)
  const [err, setErr] = useState('')
  const [cc, setCc] = useState(() => read(K.cc, '+62'))
  const [ccOpen, setCcOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const submit = () => {
    if (tab === 'phone' && phone.replace(/\D/g, '').length < 9) return setErr('Nomor ponsel tidak valid')
    if (tab === 'email' && !/^\S+@\S+\.\S+$/.test(email)) return setErr('Format email tidak valid')
    if (pwd.length < 6) return setErr('Kata sandi minimal 6 digit')
    setErr('')
    onLogin(tab === 'phone' ? phone.replace(/\D/g, '') : email, remember)
  }

  const forgot = () => {
    window.dispatchEvent(new CustomEvent('hy:chat'))
    toast('Chat Customer Service dibuka')
  }

  return (
    <>
      <IconSprite />
      <div className="login__container">
        <div className="navbar main">
          <div className="navbar-fixed">
            <div className="navbar__content">
              <div className="navbar__content-left">
                <i className="van-badge__wrapper van-icon van-icon-arrow-left" onClick={() => navigate('/register')} />
              </div>
              <div className="navbar__content-center">
                <BrandLogo />
              </div>
              <div className="navbar__content-right">
                <div className="lang-chip" onClick={() => setLangOpen(true)}>
                  <img src="/assets/png/id-Cpq0Srsc.png" alt="" />
                  <span>{cc === '+62' ? 'ID' : cc === '+60' ? 'MY' : 'SG'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="login__container-heading">
          <h1 className="login__container-heading__title">Login</h1>
          <div className="login__container-heading__subTitle">
            <div>Silakan masuk melalui Nomor Ponsel atau Email</div>
            <div>Jika lupa kata sandi, Silakan hubungi Customer Service</div>
          </div>
        </div>

        <div className="login_container-tab">
          <div className={'tab' + (tab === 'phone' ? ' active' : '')} onClick={() => setTab('phone')}>
            <Svg id="i-account" />
            <div>Nomor HP</div>
          </div>
          <div className={'tab' + (tab === 'email' ? ' active' : '')} onClick={() => setTab('email')}>
            <Svg id="i-mail" />
            <div>Email</div>
          </div>
        </div>

        <div className="login__container-form">
          <div className="tab-content activecontent">
            <div className="signIn__container">
              {tab === 'phone' ? (
                <div className="phoneInput__container">
                  <div className="phoneInput__container-label">
                    <Svg id="i-account" />
                    <span>Nomor Ponsel</span>
                  </div>
                  <div className="phoneInput__container-input">
                    <div className="dropdown" onClick={() => setCcOpen(true)}>
                      {cc} <i className="van-icon van-icon-arrow-down" />
                    </div>
                    <input
                      inputMode="numeric"
                      placeholder="Silakan masukkan nomor telepon"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ''))}
                    />
                  </div>
                </div>
              ) : (
                <div className="phoneInput__container">
                  <div className="phoneInput__container-label">
                    <Svg id="i-mail" />
                    <span>Email</span>
                  </div>
                  <div className="phoneInput__container-input phoneInput__container-input--email">
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="Silakan masukkan email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="passwordInput__container">
                <div className="passwordInput__container-label">
                  <Svg id="i-lock" />
                  <span>Kata sandi</span>
                </div>
                <div className="passwordInput__container-input">
                  <input
                    type={show ? 'text' : 'password'}
                    placeholder="Kata sandi"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                  />
                  <img
                    className={'eye' + (show ? ' on' : '')}
                    src="/assets/png/eyeInvisible-NUKC6jpG.png"
                    alt={show ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    onClick={() => setShow(!show)}
                  />
                </div>
              </div>

              {err ? <div className="reg-err">{err}</div> : null}

              <div className="signIn__container-rememberRow">
                <div className="van-checkbox" onClick={() => setRemember(!remember)}>
                  <div
                    className={
                      'van-checkbox__icon van-checkbox__icon--round' +
                      (remember ? ' van-checkbox__icon--checked' : '')
                    }
                  >
                    <i className="van-icon van-icon-success" />
                  </div>
                  <span className="van-checkbox__label">Ingat akun saya</span>
                </div>
                <span className="signIn__container-forget" onClick={forgot}>
                  Lupa kata sandi?
                </span>
              </div>

              <div className="signIn__container-button">
                <button className="active" onClick={submit}>
                  Login
                </button>
                <button className="register" onClick={() => navigate('/register')}>
                  Daftar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={ccOpen} title="Kode Negara" onClose={() => setCcOpen(false)}>
        <div className="hy-list">
          {COUNTRIES.map(([code, name]) => (
            <button
              type="button"
              key={code}
              className={'hy-choice' + (cc === code ? ' active' : '')}
              onClick={() => {
                setCc(code)
                write(K.cc, code)
                setCcOpen(false)
                toast('Kode negara: ' + code + ' (' + name + ')')
              }}
            >
              <span>
                {name} <em>{code}</em>
              </span>
              <i>{cc === code ? '✓' : ''}</i>
            </button>
          ))}
        </div>
        <p className="hy-note">Nomor tetap dimasukkan tanpa kode negara.</p>
      </Modal>

      <Modal open={langOpen} title="Bahasa" onClose={() => setLangOpen(false)}>
        <div className="hy-list">
          <button
            type="button"
            className="hy-choice active"
            onClick={() => {
              saveSettings({ lang: 'id' })
              setLangOpen(false)
              toast('Bahasa: Indonesia')
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
      </Modal>

      <Customer toast={toast} />
    </>
  )
}
