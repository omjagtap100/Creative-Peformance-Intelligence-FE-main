import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/v1': {
        target: 'http://127.0.0.1:3141',
        changeOrigin: true,
      },
      '/creatives': {
        target: 'http://127.0.0.1:3141',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:3141',
        changeOrigin: true,
      },
    },
  },
});
