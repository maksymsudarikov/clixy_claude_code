import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/', // Absolute paths for Vercel (was './' for GitHub Pages)
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // Use only VITE_* env vars in client code.
      // Avoid exposing non-prefixed secrets via build-time defines.
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
