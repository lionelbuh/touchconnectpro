import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { devBanner } from '@replit/vite-plugin-dev-banner'
import { cartographer } from '@replit/vite-plugin-cartographer'
import { runtimeErrorModal } from '@replit/vite-plugin-runtime-error-modal'
import { tailwindPlugin } from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    devBanner(),
    cartographer(),
    runtimeErrorModal(),
    tailwindPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  define: {
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
