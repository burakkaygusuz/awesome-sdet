import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts', 'evals/**/*.eval.ts'],
    exclude: ['dist/**', 'node_modules/**', '**/node_modules/**'],
    pool: 'forks',
    testTimeout: 10_000,
    hookTimeout: 10_000,
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    reporters: ['default'],
  },
});
