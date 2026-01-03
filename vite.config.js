import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Github Pages deployment base setting (will need adjustment if deployed to a subdirectory)
  base: './', 
})
