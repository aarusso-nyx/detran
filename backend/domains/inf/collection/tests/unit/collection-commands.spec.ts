import { describe, expect, it, vi } from 'vitest';
import { CollectionCommandsController } from '../../src/handwritten/index.js';

const response = () => ({ setHeader: vi.fn() });
const context = {
  snapshot: () => ({ actorId: '10000000-0000-4000-8000-000000000001' }),
};

describe('CTG-0004 — comandos de arrecadação', () => {
  it('dado desconto de 40% ainda source_pending quando solicitado então nenhum documento é criado', async () => {
    const create = vi.fn();
    const controller = new CollectionCommandsController(
      { create } as never,
      {} as never,
      {} as never,
      {} as never,
      context as never,
    );
    await expect(
      controller.issueDocument(
        {
          infraction_id: 'inf-1',
          tier: 'desconto_40_fora_sne',
          amount: 1,
          valid_until: '2026-10-22',
          issued_for_state: 'NOTIFICADO_PENALIDADE',
        },
        response(),
      ),
    ).rejects.toThrow('OD-003 source_pending');
    expect(create).not.toHaveBeenCalled();
  });

  it('dado retorno bancário quando reconciliado então publica somente fato financeiro', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'payment-1' });
    const controller = new CollectionCommandsController(
      {} as never,
      { create } as never,
      {} as never,
      {} as never,
      context as never,
    );
    const result = await controller.reconcilePayment(
      { bank_reference: 'bank-1', paid_on: '2026-09-22', amount: 100 },
      response(),
    );
    expect(result.events).toEqual([
      {
        type: 'inf.payment.confirmed',
        actorId: '10000000-0000-4000-8000-000000000001',
      },
    ]);
  });
});
