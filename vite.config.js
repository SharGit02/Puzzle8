import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      '0bf6-2401-4900-881c-6be4-e2d7-fcaa-8d7d-2e1c.ngrok-free.app',
      'localhost',
    ],
  },
})
