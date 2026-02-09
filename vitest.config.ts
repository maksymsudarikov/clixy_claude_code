import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: [
      'node_modules/**',
      'node_modules_*/**',
      'dist/**',
      'supabase/**',
      'magical-zhukovsky/**',
    ],
  },
});
