import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // Vite automatically exposes env vars prefixed with VITE_
      // Never inject non-VITE secrets into client bundles.
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
