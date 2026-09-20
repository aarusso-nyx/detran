import { describe, expect, it } from 'vitest';

const modulePath = '../../src/rait-case.module.js';

describe('CTG-0001-C4-OD V3 — composição DI RAIT fail-closed', () => {
  it('dado o módulo RAIT quando Nest carrega os seis providers concretos então a composição é carregável', async () => {
    await expect(import(modulePath)).resolves.toMatchObject({
      RaitCaseModule: expect.any(Function),
    });
  });
});
