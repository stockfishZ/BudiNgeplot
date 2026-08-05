import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { renameSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    {
      name: 'output-as-index-html',
      closeBundle() {
        renameSync('dist/app.html', 'dist/index.html');
      }
    }
  ],
  base: './',
  build: {
    rollupOptions: {
      input: fileURLToPath(new URL('./app.html', import.meta.url))
    }
  },
  server: {
    port: 3000,
    open: '/app.html'
  }
});
