import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: {
    format: 'es'
  },
  optimizeDeps: {
    exclude: ['../lib/perceptron', '../workers']
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        widget: resolve(__dirname, 'widget.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            return 'vendor';
          }
          if (id.includes('lib/perceptron')) {
            return 'perceptron';
          }
          if (id.includes('sync')) {
            return 'sync';
          }
        },
      },
    },
    minify: 'esbuild',
    sourcemap: false, // Set to true for debugging production builds
    target: 'esnext',
    cssCodeSplit: true,
  },
})
