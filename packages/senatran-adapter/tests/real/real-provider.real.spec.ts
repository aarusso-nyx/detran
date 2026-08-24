import { describe, expect, it } from 'vitest';

import { createSenatranAdapter } from '../../src/index.js';
import { loadSenatranConfig } from '../../src/config.js';
import { expectReadProviderBehavior } from '../shared/read-provider.behavior.js';

const enabled = process.env.SENATRAN_REAL_TEST === '1';

describe('real SENATRAN homologation target', () => {
  it.skipIf(!enabled)(
    'runs the shared behavior only with explicit credentials and fixture authority',
    async () => {
      const cpf = process.env.SENATRAN_REAL_TEST_DRIVER_CPF;
      if (!cpf) throw new Error('SENATRAN_REAL_TEST_DRIVER_CPF is required');
      const adapter = createSenatranAdapter(loadSenatranConfig());
      await expectReadProviderBehavior(adapter.ports, { cpf });
      expect(adapter.client.config.provider).toBe('real');
    },
  );
});
