import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// Simple plugin to copy manifest to dist
const copyManifest = () => {
  return {
    name: 'copy-manifest',
    closeBundle: () => {
      const manifest = fs.readFileSync('manifest.json', 'utf-8');
      // Adjust paths if necessary for the build structure
      // Here we keep them as is, assuming build matches
      fs.writeFileSync('dist/manifest.json', manifest);
      console.log('Copied manifest.json to dist');

      // Also ensure global styles are copied if not injected
      if (fs.existsSync('src/index.css')) {
        fs.copyFileSync('src/index.css', 'dist/index.css');
      }
    }
  };
};

export default defineConfig({
  plugins: [react(), copyManifest()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve('src/popup/index.html'),
        offscreen: resolve('src/offscreen/index.html'),
        background: resolve('src/background/service-worker.ts'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') {
            return 'background/service-worker.js';
          }
          return 'assets/[name]-[hash].js';
        },
        // Force chunking to common folder
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
