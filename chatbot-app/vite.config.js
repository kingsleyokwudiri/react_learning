import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Vite 6+ returns 403 for requests whose Host header is not localhost/an IP
    // (tunnels, port-forwarding, containers, LAN hostnames). Allow those in dev.
    allowedHosts: true,
  },
})
