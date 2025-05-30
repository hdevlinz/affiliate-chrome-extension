import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// @ts-ignore
import manifest from './src/manifest'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/chunk-[hash].js'
        }
      }
    },

    server: {
      port: 5173,
      strictPort: true,
      cors: true,
      hmr: {
        port: 5173
      }
    },

    legacy: {
      skipWebSocketTokenCheck: true
    },

    plugins: [crx({ manifest }), react()]
  }
})
