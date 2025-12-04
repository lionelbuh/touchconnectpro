import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { devBanner } from '@replit/vite-plugin-dev-banner'
import { cartographer } from '@replit/vite-plugin-cartographer'
import runtimeErrorModal from '@replit/vite-plugin-runtime-error-modal'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '')
  
  return {
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
