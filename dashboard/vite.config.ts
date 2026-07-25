import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 10889,
    proxy: {
      '/api': {
        target: 'http://localhost:10888',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
