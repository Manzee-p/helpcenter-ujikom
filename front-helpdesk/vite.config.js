import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
    // ✅ Fix Vite HMR WebSocket conflict
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 8080,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // ✅ Tambahkan proxy untuk broadcasting/auth
      '/broadcasting': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    }
  }
})
