import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AlcoholLifecycleService } from './alcohol-lifecycle.service.js';

function refusalHarness() {
  const transaction = vi.fn(async (work) => work({}));
  const create = vi.fn(async (dto) => ({ id: 'refusal-1', ...dto }));
  const update = vi.fn(async (_id, patch) => ({
    id: 'procedure-1',
    ...patch,
  }));
  const service = new AlcoholLifecycleService({
    procedures: {
      transaction,
      findOne: vi.fn(async () => ({
        id: 'procedure-1',
        status: 'in_progress',
        outcome: 'pending',
      })),
      update,
    } as never,
    tests: {} as never,
    refusals: { create } as never,
    signs: {} as never,
    forwardings: {} as never,
  });
  return { create, service, transaction, update };
}

describe('AlcoholLifecycleService', () => {
  it('starts only a draft procedure through one tenant transaction', async () => {
    const transaction = vi.fn(async (work) => work({}));
    const update = vi.fn(async (_id, patch) => ({
      id: 'procedure-1',
      ...patch,
    }));
    const service = new AlcoholLifecycleService({
      procedures: {
        transaction,
        findOne: vi.fn(async () => ({
          id: 'procedure-1',
          status: 'draft',
          notes: null,
        })),
        update,
      } as never,
      tests: {} as never,
      refusals: {} as never,
      signs: {} as never,
      forwardings: {} as never,
    });
    await expect(service.start('procedure-1')).resolves.toMatchObject({
      status: 'in_progress',
    });
    expect(transaction).toHaveBeenCalledOnce();
  });

  it('dado registro sem kind quando recordRefusal é chamado então falha fechado sem persistir classificação', async () => {
    const { create, service, update } = refusalHarness();

    await expect(
      service.recordRefusal('procedure-1', {
        refusal_description: 'procedimento não realizado',
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('dado kind refusal quando recordRefusal é chamado então grava recusa e outcome refusal', async () => {
    const { create, service, update } = refusalHarness();

    await expect(
      service.recordRefusal('procedure-1', {
        kind: 'refusal',
        refusal_description: 'condutor recusou o procedimento',
      }),
    ).resolves.toMatchObject({ kind: 'refusal' });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'refusal' }),
      expect.anything(),
    );
    expect(update).toHaveBeenCalledWith(
      'procedure-1',
      expect.objectContaining({ outcome: 'refusal' }),
      expect.anything(),
    );
  });

  it('dado kind technical_impossibility quando recordRefusal é chamado então grava impossibilidade com outcome não punitivo distinto de refusal', async () => {
    const { create, service, update } = refusalHarness();

    await expect(
      service.recordRefusal('procedure-1', {
        kind: 'technical_impossibility',
        refusal_description: 'etilômetro tecnicamente indisponível',
      }),
    ).resolves.toMatchObject({ kind: 'technical_impossibility' });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'technical_impossibility' }),
      expect.anything(),
    );
    const outcome = update.mock.calls[0]?.[1]?.outcome;
    expect(outcome).toEqual(expect.any(String));
    expect(outcome).not.toBe('refusal');
  });
});
