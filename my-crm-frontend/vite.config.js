import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
   server: {
    proxy: {
      "/api": {
        target: "https://enterprisecrm-backend.onrender.com",
        changeOrigin: true,
        secure: true,
      },
      alias: {
      '@': path.resolve(__dirname, './src'),  // <-- this is the alias
    },
    },
  },
});
