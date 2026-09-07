import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Vite config — https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    base: '/',
    build: {
      sourcemap: true,
      minify: 'terser',
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      open: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 3000,
    },
  }
})
