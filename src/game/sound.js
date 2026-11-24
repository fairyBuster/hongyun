// SFX synth (WebAudio) — nggak ada file audio di APK, jadi semua suara dibikin.
let ctx = null
let master = null
let muted = false

function ac() {
  if (typeof window === 'undefined') return null
  const C = window.AudioContext || window.webkitAudioContext
  if (!C) return null
  if (!ctx) {
    ctx = new C()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq, dur = 0.1, { type = 'triangle', gain = 0.25, slide = 0, delay = 0 } = {}) {
  if (muted) return
  const c = ac()
  if (!c) return
  const t0 = c.currentTime + delay
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g).connect(master)
  o.start(t0)
  o.stop(t0 + dur + 0.03)
}

function noise(dur = 0.2, { gain = 0.12, freq = 1400, q = 1.2, delay = 0 } = {}) {
  if (muted) return
  const c = ac()
  if (!c) return
  const t0 = c.currentTime + delay
  const len = Math.max(1, Math.floor(c.sampleRate * dur))
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = freq
  bp.Q.value = q
  const g = c.createGain()
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(bp).connect(g).connect(master)
  src.start(t0)
}

// ---- musik latar: pentatonik pelan + delay, dibangkitkan sendiri ----
let musicOn = false
let musicGain = null
let musicTimer = 0
let musicStep = 0
const PENTA = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33]
const PATTERN = [0, 2, 1, 3, 2, 5, 3, 4, 0, 4, 2, 5, 1, 3, 4, 2]

function musicTick() {
  const c = ac()
  if (!c || !musicGain || c.state !== 'running') return
  const t = c.currentTime + 0.1
  const n = PENTA[PATTERN[musicStep % PATTERN.length]]
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = musicStep % 4 === 0 ? 'sine' : 'triangle'
  o.frequency.setValueAtTime(n, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.08, t + 0.03)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4)
  o.connect(g).connect(musicGain)
  o.start(t)
  o.stop(t + 1.5)
  if (musicStep % 8 === 0) {
    const b = c.createOscillator()
    const bg = c.createGain()
    b.type = 'sine'
    b.frequency.setValueAtTime(n / 2, t)
    bg.gain.setValueAtTime(0.0001, t)
    bg.gain.linearRampToValueAtTime(0.1, t + 0.14)
    bg.gain.exponentialRampToValueAtTime(0.0001, t + 2.6)
    b.connect(bg).connect(musicGain)
    b.start(t)
    b.stop(t + 2.8)
  }
  musicStep++
}

function startMusic() {
  if (!musicOn || musicTimer) return
  const c = ac()
  if (!c) return
  if (!musicGain) {
    musicGain = c.createGain()
    musicGain.gain.value = 0.9
    musicGain.connect(master)
    const dl = c.createDelay(0.8)
    dl.delayTime.value = 0.36
    const fb = c.createGain()
    fb.gain.value = 0.3
    const wet = c.createGain()
    wet.gain.value = 0.22
    musicGain.connect(dl)
    dl.connect(fb)
    fb.connect(dl)
    dl.connect(wet)
    wet.connect(master)
  }
  musicGain.gain.cancelScheduledValues(c.currentTime)
  musicGain.gain.setValueAtTime(0.0001, c.currentTime)
  musicGain.gain.linearRampToValueAtTime(0.9, c.currentTime + 1.8)
  musicTimer = setInterval(musicTick, 500)
  musicTick()
}

function stopMusic() {
  clearInterval(musicTimer)
  musicTimer = 0
  if (!musicGain || !ctx) return
  musicGain.gain.cancelScheduledValues(ctx.currentTime)
  musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime)
  musicGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6)
}

export const sound = {
  unlock() { ac(); if (musicOn) startMusic() },
  setMuted(v) { muted = !!v },
  get muted() { return muted },
  setMusic(v) { musicOn = !!v; if (!musicOn) stopMusic(); else if (ctx) startMusic() },
  get musicOn() { return musicOn },

  click() { tone(660, 0.05, { type: 'triangle', gain: 0.2 }) },
  error() { tone(180, 0.16, { type: 'sawtooth', gain: 0.18, slide: 120 }) },
  bet() { tone(520, 0.04, { type: 'square', gain: 0.12 }) },

  spin() {
    noise(0.16, { gain: 0.12, freq: 900 })
    tone(220, 0.18, { type: 'sawtooth', gain: 0.1, slide: 620 })
  },
  reel(i) { tone(300 + i * 40, 0.025, { type: 'square', gain: 0.05 }) },
  stop(i) {
    tone(380 + i * 55, 0.06, { type: 'triangle', gain: 0.16 })
    noise(0.05, { gain: 0.05, freq: 2400 })
  },
  anticipate() {
    tone(300, 0.12, { type: 'triangle', gain: 0.16 })
    tone(420, 0.12, { type: 'triangle', gain: 0.16, delay: 0.12 })
    tone(560, 0.16, { type: 'triangle', gain: 0.16, delay: 0.24 })
    noise(0.4, { gain: 0.06, freq: 3000 })
  },

  win(step = 0, big = false) {
    const base = [523, 587, 659, 784, 880][Math.min(step, 4)]
    tone(base, 0.1, { type: 'triangle', gain: 0.2 })
    tone(base * 1.25, 0.12, { type: 'triangle', gain: 0.17, delay: 0.07 })
    if (big) tone(base * 1.5, 0.16, { type: 'triangle', gain: 0.15, delay: 0.14 })
  },
  pop() {
    noise(0.1, { gain: 0.09, freq: 700 })
    tone(240, 0.08, { type: 'sine', gain: 0.1, slide: 90 })
  },
  drop() { noise(0.14, { gain: 0.08, freq: 500, q: 0.8 }) },
  coin() {
    tone(1180, 0.09, { type: 'sine', gain: 0.14 })
    tone(1760, 0.12, { type: 'sine', gain: 0.1, delay: 0.05 })
  },
  big() {
    [523, 659, 784, 1046, 1318].forEach((f, i) =>
      tone(f, 0.28, { type: 'triangle', gain: 0.2, delay: i * 0.09 }))
    noise(0.6, { gain: 0.05, freq: 2200 })
  },
  jackpot() {
    [523, 659, 784, 1046, 1318, 1568, 2093].forEach((f, i) =>
      tone(f, 0.3, { type: 'triangle', gain: 0.2, delay: i * 0.1 }))
    [131, 165, 196].forEach((f, i) =>
      tone(f, 0.5, { type: 'sine', gain: 0.16, delay: i * 0.04 }))
    noise(0.9, { gain: 0.05, freq: 2600 })
  },
  fs() {
    [784, 988, 1175, 1568].forEach((f, i) =>
      tone(f, 0.22, { type: 'sine', gain: 0.18, delay: i * 0.08 }))
  },
  level() {
    [659, 880, 1046, 1318].forEach((f, i) =>
      tone(f, 0.18, { type: 'triangle', gain: 0.16, delay: i * 0.07 }))
  },
}
