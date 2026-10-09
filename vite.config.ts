import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative base makes the build compatible with GitHub Pages project URLs.
  base: './',
})
