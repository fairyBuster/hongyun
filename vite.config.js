import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5174, host: true, allowedHosts: ['frontend.scagerwebsite.uk'] },
  preview: { port: 5174, allowedHosts: ['frontend.scagerwebsite.uk'] },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        // mesin game dibuka di iframe (lihat src/pages/Game.jsx)
        game: resolve(root, 'game.html'),
      },
    },
  },
})
