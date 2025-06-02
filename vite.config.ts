import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ['stream'],
      globals: { Buffer: true, process: true }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'safeDeal',
        short_name: 'VitePWA',
        description: 'My Awesome safeDeal',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'solana.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'solana.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'solana.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  optimizeDeps: {
    include: ['@solana/wallet-adapter-base'],
  },
  server:{
    port:3000
  },
 
})
