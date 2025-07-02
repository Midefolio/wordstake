import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
    react(),
    nodePolyfills({
      include: ['stream'],
      globals: { Buffer: true, process: true }
    }),
  ],
  optimizeDeps: {
    include: ['@solana/wallet-adapter-base'],
  },
  server:{
    port:3000
  },
 
})
