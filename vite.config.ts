import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ChamadosTiTerris/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 3001
  },
});
