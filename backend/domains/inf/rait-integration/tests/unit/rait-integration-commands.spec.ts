import { describe, expect, it } from 'vitest';
import { RaitIntegrationCommandsController } from '../../src/handwritten/index.js';

describe('CTG-0004 — comandos de integração', () => {
  it('dada conciliação quando criada então o ator do payload é substituído pelo contexto', async () => {
    let captured: Record<string, unknown> | undefined;
    const service = {
      create: async (value: Record<string, unknown>) => {
        captured = value;
        return { id: 'rec-1' };
      },
    };
    const context = {
      snapshot: () => ({ actorId: '10000000-0000-4000-8000-000000000001' }),
    };
    const controller = new RaitIntegrationCommandsController(
      service as never,
      {} as never,
      context as never,
    );
    const result = await controller.reconcile({
      system: 'renainf',
      window_from: '2026-09-01T00:00:00Z',
      window_to: '2026-09-22T00:00:00Z',
      requested_by: 'forged',
    });
    expect(captured?.requested_by).toBe('10000000-0000-4000-8000-000000000001');
    expect(result.data).toEqual({ id: 'rec-1' });
  });
});
