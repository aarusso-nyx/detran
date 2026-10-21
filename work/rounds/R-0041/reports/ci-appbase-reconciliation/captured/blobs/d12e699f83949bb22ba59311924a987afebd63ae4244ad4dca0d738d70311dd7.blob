import { defineConfig } from 'vitest/config';
import base from './vitest.config.js';

export default defineConfig({
  ...base,
  test: {
    ...base.test,
    include: ['tests/performance/**/*.perf.spec.ts'],
    passWithNoTests: false,
    testTimeout: 120_000,
  },
});
