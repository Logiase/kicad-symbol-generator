import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the project under /<repo>/ in production.
// Use a relative base in dev and the repo path when building for Pages.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/kicad-symbol-generator/' : '/',
  plugins: [react()],
}))
