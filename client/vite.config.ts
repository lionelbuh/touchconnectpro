import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { devBanner } from '@replit/vite-plugin-dev-banner'
import { cartographer } from '@replit/vite-plugin-cartographer'
import runtimeErrorModal from '@replit/vite-plugin-runtime-error-modal'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '')
  
  // Log available env vars for debugging
  console.log('Vite build env vars:')
  console.log('VITE_SUPABASE_URL from .env:', env.VITE_SUPABASE_URL)
  console.log('VITE_SUPABASE_URL from process.env:', process.env.VITE_SUPABASE_URL)
  
  // Use process.env directly (Render should set these)
  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';
  
  return {
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
    plugins: [
      react(),
      devBanner(),
      cartographer(),
      runtimeErrorModal(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, '../shared'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  }
})
