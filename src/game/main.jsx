// Entry khusus mesin game (dibuka lewat iframe /game.html#game/mw1).
// Sengaja dokumen terpisah: style.css game punya aturan global (html/body)
// yang akan menabrak base.css milik tampilan app kalau digabung.
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './style.css'
import './app-overrides.css'

createRoot(document.getElementById('root')).render(<App />)
