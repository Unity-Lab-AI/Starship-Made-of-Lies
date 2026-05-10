import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  const config: UserConfig = {
    plugins: [react()],
    base: process.env['SMOL_BASE_PATH'] ?? '/',
    resolve: {
      alias: {
        '@smol/shared': resolve(__dirname, '../shared/src/index.ts'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      allowedHosts: ['localhost', '127.0.0.1', 'smol.unityailab.com', '.unityailab.com'],
    },
    build: {
      outDir: 'dist',
      sourcemap: isProd ? 'hidden' : true,
      target: 'es2022',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1024,
      assetsInlineLimit: 4096,
      reportCompressedSize: true,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('three')) return 'vendor-three'
              if (id.includes('react') || id.includes('scheduler')) return 'vendor-react'
              if (id.includes('@colyseus')) return 'vendor-colyseus'
              return 'vendor'
            }
            if (id.includes('shared/src/sim/')) return 'sim'
            if (id.includes('shared/src/protocol/')) return 'protocol'
            if (id.includes('client/src/audio/')) return 'audio'
            if (id.includes('client/src/ui/panels/')) return 'ui-panels'
            return undefined
          },
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'chunks/[name]-[hash].js',
          entryFileNames: 'entries/[name]-[hash].js',
        },
      },
    },
  }
  return config
})
