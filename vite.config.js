import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use a cache directory outside OneDrive to avoid file locking issues
  cacheDir: path.join(process.env.TEMP || process.env.TMP || 'C:\\Temp', '.vite-cache'),
  server: {
    port: 3000,
    open: true
  }
})
