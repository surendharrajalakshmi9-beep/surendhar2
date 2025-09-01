import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { Card, CardContent } from "../components/ui/card";


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // your alias stays
    },
  },
  server: {
    proxy: {
      // During local dev: forward /api requests to backend
      '/api': {
        target: 'http://localhost:5000',  // backend dev server
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist',   // put build output in root /dist
    emptyOutDir: true,   // clean dist before each build
  },
})
