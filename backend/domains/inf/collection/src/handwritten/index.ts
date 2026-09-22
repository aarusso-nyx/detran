// API pública manuscrita de @detran/inf-collection
// (work/rounds/R-0006/contracts/CTG-0002-modules.md §c), reexportada pelo
// `src/index.ts` gerado via `module.handwrittenExports` do
// BP-INF-COLLECTION-001 (ADR-0007: código gerado não se edita). Nesta rodada
// só o port bancário mock — o real é de rodada futura (ADR-0017 §Decision 4).
import type { Provider } from '@nestjs/common';

import { createMockBankPort, SystemClock } from './ports/bank/index.js';

export * from './ports/bank/index.js';

/**
 * Provider Nest do port bancário, apontando para o mock determinístico
 * (ADR-0017 §Decision 4): o provedor real de banco nasce em rodada futura,
 * quando substitui apenas este `useFactory`. Token de injeção: string
 * `'BANK_PORT'` (sem classe própria, `BankPort` é interface).
 */
export const BANK_PORT: Provider = {
  provide: 'BANK_PORT',
  useFactory: () => createMockBankPort(new SystemClock()),
};

export { CollectionCommandsController } from './collection-commands.controller.js';
