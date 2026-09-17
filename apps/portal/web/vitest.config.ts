// Runner de testes do app (plan.md R-0014 M3): vitest + jsdom, como packages/ui e
// detran-ui-guide.md §5. Specs nunca inicializam o ambiente — src/test-setup.ts faz.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
  },
});
