import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile()
  ],
  base: './',
  build: {
    rollupOptions: {
      input: fileURLToPath(new URL('./index.html', import.meta.url))
    }
  },
  server: {
    port: 3000,
    open: '/index.html'
  }
});
