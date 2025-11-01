import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Future-Academy-Schedule/',  // ✅ مهم جداً للـ GitHub Pages
  plugins: [react()],
})
