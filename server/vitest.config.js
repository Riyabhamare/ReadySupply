import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    hookTimeout: 40000,
    testTimeout: 40000,
  },
});

