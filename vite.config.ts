import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { copyFileSync, writeFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    {
      name: 'copy-dist-to-root',
      closeBundle() {
        copyFileSync('dist/src/index.html', 'index.html');
        copyFileSync('dist/src/index.html', 'dist/index.html');
        writeFileSync('.nojekyll', '');
        writeFileSync('dist/.nojekyll', '');
        writeFileSync('CNAME', 'budingeplot.com\n');
        writeFileSync('dist/CNAME', 'budingeplot.com\n');
      }
    }
  ],
  base: './',
  build: {
    rollupOptions: {
      input: fileURLToPath(new URL('./src/index.html', import.meta.url))
    }
  },
  server: {
    port: 3000,
    open: '/src/index.html'
  }
});
