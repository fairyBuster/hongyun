// Data mock — semua angka & daftar diambil dari tampilan aslinya (snapshot 21 Nov 2026)
const OSS = '/cdn/55lottery'

export const LOGO = OSS + '/other/h5setting_20230712140533vgnl.png'
export const LOGO_DARK = OSS + '/other/h5setting_20230712140535knh2.png'
export const FAVICON = OSS + '/other/h5setting_20230712140537q813.ico'

export const CATEGORIES = [
  { key: 'populer', label: 'Populer', cls: 'popular', icon: OSS + '/gamecategory/gamecategory_20230708024734vsfr.png' },
  { key: 'lotre', label: 'Lotre', cls: 'lottery', icon: OSS + '/gamecategory/gamecategory_202307080247565oos.png' },
  { key: 'slot', label: 'Slot', cls: 'slot', icon: OSS + '/gamecategory/gamecategory_20230708024806kdxm.png' },
  { key: 'fish', label: 'Tembak ikan', cls: 'fish', icon: OSS + '/gamecategory/gamecategory_20230708024708r5pp.png' },
  { key: 'sabung', label: 'Sabung Ayam', cls: 'flash', icon: '/assets/arcade/sabung-icon.svg' },
  { key: 'kasino', label: 'Kasino', cls: 'video', icon: OSS + '/gamecategory/gamecategory_20230708024724745n.png' },
  { key: 'sport', label: 'Sport', cls: 'sport', icon: OSS + '/gamecategory/gamecategory_20230708024745ited.png' },
  { key: 'pvc', label: 'PVC', cls: 'chess', icon: OSS + '/gamecategory/gamecategory_20230708020543okkf.png' },
]

// mesin mahjong lokal (engine di src/game, dibuka lewat #/game/mw1)
// 20 mesin mahjong (engine di src/game/ways.js, katalog mw7..mw20 di MORE).
// Tiap mesin memakai potongan cover-nya sendiri (/assets/covers/mw1_cover.jpg .. mw20_cover.jpg).
export const MJ_GAMES = Array.from({ length: 20 }, (_, i) => {
  const n = i + 1
  return {
    id: 'mw' + n,
    no: 'MW ' + String(n).padStart(2, '0'),
    name: n === 1 ? 'Mahjong Ways' : 'Mahjong Ways ' + n,
    vendor: 'PG',
    odds: (96.95 - i * 0.04).toFixed(2) + '%',
    img: '/assets/covers/mw' + n + '_cover.jpg',
    /* wordmark lebar transparan (bukan emblem kotak) biar rapi & konsisten di kartu */
    logo: '/assets/covers/title/mw' + n + '.webp',
  }
})

/* game arcade lokal: dimainkan langsung di halaman app (bukan iframe) */
export const ARCADE = [
  {
    id: 'togel',
    name: 'Togel 4D',
    tag: 'TOGEL',
    cat: 'lotre',
    img: '/assets/arcade/togel.svg',
    odds: '96.00%',
    desc: 'Tebak 4D, 3D, atau 2D. Hadiah sampai ×3.000 dari taruhan.',
  },
  {
    id: 'sabung',
    name: 'Sabung Ayam',
    tag: 'SABUNG',
    cat: 'sabung',
    img: '/assets/arcade/sabung.svg',
    odds: '96.50%',
    desc: 'Pilih jago merah atau biru, lalu saksikan adu tiga ronde.',
  },
  {
    id: 'bola',
    name: 'Bola 1X2',
    tag: 'BOLA',
    cat: 'sport',
    img: '/assets/arcade/bola.svg',
    odds: '96.80%',
    desc: 'Liga asli, hasil resmi. Pilih tuan rumah, seri, atau tamu.',
  },
  {
    id: 'pvc-videopoker',
    name: 'Video Poker',
    tag: 'VIDEO',
    cat: 'pvc',
    kind: 'poker',
    img: '/assets/arcade/pvc-videopoker.svg',
    odds: '91.7%',
    desc: 'Jacks or Better: simpan kartu, tukar sisanya, bayaran sampai ×250.',
  },
  {
    id: 'pvc-threecard',
    name: 'Three Card Poker',
    tag: '3 CARD',
    cat: 'pvc',
    kind: 'poker',
    img: '/assets/arcade/pvc-threecard.svg',
    odds: '97.9%',
    desc: 'Tiga kartu lawan bandar. Lipat atau Call; bandar wajib Q tinggi.',
  },
  {
    id: 'pvc-caribbean',
    name: 'Caribbean Stud',
    tag: 'STUD',
    cat: 'pvc',
    kind: 'poker',
    img: '/assets/arcade/pvc-caribbean.svg',
    odds: '94.3%',
    desc: 'Lima kartu, satu kartu bandar terbuka. Bandar wajib A-K tinggi.',
  },
  {
    id: 'pvc-holdem',
    name: "Texas Hold'em Duel",
    tag: "HOLD'EM",
    cat: 'pvc',
    kind: 'poker',
    img: '/assets/arcade/pvc-holdem.svg',
    odds: '94.9%',
    desc: 'Duel kepala-kepala 2 lawan 2, lima kartu meja, pot dengan rake 5%.',
  },
  {
    id: 'pvc-dice',
    name: 'Poker Dice',
    tag: 'DADU',
    cat: 'pvc',
    kind: 'poker',
    img: '/assets/arcade/pvc-dice.svg',
    odds: '95.6%',
    desc: 'Lima dadu dan satu putar ulang. Kalahkan kombinasi bandar.',
  },
]

export const VENDOR_LOGO = OSS + '/vendorlogo/vendorlogo_20231118161120og6e.png'

/* banner beranda lokal (dari mahjong-ways-ui/assets/banners, 2400x1256 -> 1200x628 jpg) */
export const BANNERS = [
  '/assets/banners/hongyun-01.jpg',
  '/assets/banners/hongyun-02.jpg',
  '/assets/banners/hongyun-03.jpg',
  '/assets/banners/hongyun-04.jpg',
  '/assets/banners/hongyun-05.jpg',
]

export const NOTICE =
  'Situs HONGYUN kami dengan tegas menolak segala bentuk pencucian uang dan penipuan. Pastikan data rekening yang didaftarkan adalah milik sendiri.'

export const PROMOS = [
  ['ARBET INVITE FRIENDS REWARDS', OSS + '/banner/Banner_202610280104548k2c.png'],
  ['EVENT MYSTERY BOX FORTUNE WHEEL', OSS + '/banner/Banner_20250826160715bfh5.png'],
  ['Bonus Deposit Perdana', OSS + '/banner/Banner_20250921201028x7e2.jpg'],
  ['HONGYUN Lucky Spin', OSS + '/banner/Banner_20240925224036r9sy.jpg'],
  ['HONGYUN Bonus Winstreak', OSS + '/banner/Banner_202310172053373oa3.jpg'],
  ['Bonus Spin Khusus Slot 20%', OSS + '/banner/Banner_20250112162759cdf6.jpg'],
  ['Bonus Emergency Rescue Khusus Slot 10%', OSS + '/banner/Banner_20250123182231s7lb.jpg'],
  ['Rabat Taruhan Pemain REALTIME', OSS + '/banner/Banner_20231027114044gca4.jpg'],
  ['Hindari TINDAK PENIPUAN Atas nama HONGYUN', OSS + '/banner/Banner_202402022045504b5k.png'],
  ['Bonus Misteri Jackpot', OSS + '/banner/Banner_202310172054502uyf.jpg'],
  ['Tidak dapat menemukan Tim Tutor kami ?', OSS + '/banner/Banner_20231017205531ag2t.jpg'],
  ['Event Super & Black Scatter Pragmatic Play', OSS + '/banner/Banner_20260223020248fb94.png'],
]

export const PAY_METHODS = [
  { key: 'qris', label: 'QRIS', icon: OSS + '/payNameIcon/payNameIcon2_20240928200337y85x.png' },
  { key: 'va', label: 'Virtual Account', icon: OSS + '/payNameIcon/payNameIcon_20240928194619lug9.png' },
  { key: 'linkaja', label: 'LinkAja', icon: OSS + '/payNameIcon/payNameIcon_20250611154454u72k.png' },
]

export const QUICK_AMOUNTS = ['20K', '50K', '100K', '200K', '300K', '500K', '1M', '2M', '3M', '5M', '8M', '10M']

export const rupiah = (n) =>
  'Rp' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
