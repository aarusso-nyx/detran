import { describe, expect, it, vi } from 'vitest';
import { MeasureLifecycleService } from './measure-lifecycle.service.js';

describe('MeasureLifecycleService', () => {
  it('dada medida RETIDO quando iniciada então preserva o estado canônico na mesma transação', async () => {
    const transaction = vi.fn(async (work) => work({}));
    const update = vi.fn(async (_id, patch) => ({ id: 'measure-1', ...patch }));
    const history = vi.fn(async (dto) => dto);
    const service = new MeasureLifecycleService({
      measures: {
        transaction,
        findOne: vi.fn(async () => ({
          id: 'measure-1',
          current_status: 'RETIDO',
        })),
        update,
      } as never,
      history: { create: history } as never,
      terms: {} as never,
      retentions: {} as never,
      removals: {} as never,
      inventories: {} as never,
    });
    await expect(service.start('measure-1', 'actor-1')).resolves.toMatchObject({
      current_status: 'RETIDO',
    });
    expect(history).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'RETIDO' }),
      expect.anything(),
    );
    expect(transaction).toHaveBeenCalledOnce();
  });

  it('dada retenção RETIDO sem prazo quando liberada no local então transiciona para LIBERADO_LOCAL', async () => {
    const transaction = vi.fn(async (work) => work({}));
    const update = vi.fn(async (_id, patch) => ({ id: 'measure-1', ...patch }));
    const history = vi.fn(async (dto) => dto);
    const service = new MeasureLifecycleService({
      measures: {
        transaction,
        findOne: vi.fn(async () => ({
          id: 'measure-1',
          current_status: 'RETIDO',
        })),
        update,
      } as never,
      history: { create: history } as never,
      terms: {} as never,
      retentions: {
        findOne: vi.fn(async () => ({
          id: 'retention-1',
          measure_id: 'measure-1',
          regularization_deadline_at: null,
          released_at: null,
        })),
        update: vi.fn(async (_id, patch) => ({
          id: 'retention-1',
          measure_id: 'measure-1',
          ...patch,
        })),
      } as never,
      removals: {} as never,
      inventories: {} as never,
    });

    await service.release('retention-1', 'actor-1');

    expect(update).toHaveBeenCalledWith(
      'measure-1',
      { current_status: 'LIBERADO_LOCAL' },
      expect.anything(),
    );
    expect(history).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'LIBERADO_LOCAL' }),
      expect.anything(),
    );
    expect(transaction).toHaveBeenCalledOnce();
  });

  it('dada retenção RETIDO com prazo quando liberada então transiciona para LIBERADO_COM_PRAZO', async () => {
    const transaction = vi.fn(async (work) => work({}));
    const update = vi.fn(async (_id, patch) => ({ id: 'measure-1', ...patch }));
    const history = vi.fn(async (dto) => dto);
    const service = new MeasureLifecycleService({
      measures: {
        transaction,
        findOne: vi.fn(async () => ({
          id: 'measure-1',
          current_status: 'RETIDO',
        })),
        update,
      } as never,
      history: { create: history } as never,
      terms: {} as never,
      retentions: {
        findOne: vi.fn(async () => ({
          id: 'retention-1',
          measure_id: 'measure-1',
          regularization_deadline_at: '2026-10-14T00:00:00.000Z',
          released_at: null,
        })),
        update: vi.fn(async (_id, patch) => ({
          id: 'retention-1',
          measure_id: 'measure-1',
          ...patch,
        })),
      } as never,
      removals: {} as never,
      inventories: {} as never,
    });

    await service.release('retention-1', 'actor-1');

    expect(update).toHaveBeenCalledWith(
      'measure-1',
      { current_status: 'LIBERADO_COM_PRAZO' },
      expect.anything(),
    );
    expect(history).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'LIBERADO_COM_PRAZO' }),
      expect.anything(),
    );
    expect(transaction).toHaveBeenCalledOnce();
  });

  it('dada medida RETIDO quando removida então registra CONVERTIDO_REMOCAO antes de REMOVIDO', async () => {
    const transaction = vi.fn(async (work) => work({}));
    const update = vi.fn(async (_id, patch) => ({ id: 'measure-1', ...patch }));
    const history = vi.fn(async (dto) => dto);
    const service = new MeasureLifecycleService({
      measures: {
        transaction,
        findOne: vi.fn(async () => ({
          id: 'measure-1',
          current_status: 'RETIDO',
        })),
        update,
      } as never,
      history: { create: history } as never,
      terms: {} as never,
      retentions: {} as never,
      removals: { create: vi.fn(async (dto) => dto) } as never,
      inventories: {} as never,
    });

    await service.recordRemoval('measure-1', {
      vehicle_snapshot_id: 'vehicle-1',
    });

    expect(update).toHaveBeenNthCalledWith(
      1,
      'measure-1',
      { current_status: 'CONVERTIDO_REMOCAO' },
      expect.anything(),
    );
    expect(update).toHaveBeenNthCalledWith(
      2,
      'measure-1',
      { current_status: 'REMOVIDO' },
      expect.anything(),
    );
    expect(history.mock.calls.map(([entry]) => entry.status)).toEqual([
      'CONVERTIDO_REMOCAO',
      'REMOVIDO',
    ]);
    expect(transaction).toHaveBeenCalledOnce();
  });

  it('dada medida CONVERTIDO_REMOCAO quando removida então transiciona diretamente para REMOVIDO', async () => {
    const transaction = vi.fn(async (work) => work({}));
    const update = vi.fn(async (_id, patch) => ({ id: 'measure-1', ...patch }));
    const history = vi.fn(async (dto) => dto);
    const service = new MeasureLifecycleService({
      measures: {
        transaction,
        findOne: vi.fn(async () => ({
          id: 'measure-1',
          current_status: 'CONVERTIDO_REMOCAO',
        })),
        update,
      } as never,
      history: { create: history } as never,
      terms: {} as never,
      retentions: {} as never,
      removals: { create: vi.fn(async (dto) => dto) } as never,
      inventories: {} as never,
    });

    await service.recordRemoval('measure-1', {
      vehicle_snapshot_id: 'vehicle-1',
    });

    expect(update).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledWith(
      'measure-1',
      { current_status: 'REMOVIDO' },
      expect.anything(),
    );
    expect(history).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'REMOVIDO' }),
      expect.anything(),
    );
    expect(transaction).toHaveBeenCalledOnce();
  });

  it('dada medida sem decisão de cancelamento quando cancel solicitada então falha fechada sob OD-T13 sem mutação', async () => {
    const transaction = vi.fn(async (work) => work({}));
    const update = vi.fn();
    const history = vi.fn();
    const service = new MeasureLifecycleService({
      measures: { transaction, update } as never,
      history: { create: history } as never,
      terms: {} as never,
      retentions: {} as never,
      removals: {} as never,
      inventories: {} as never,
    });

    await expect(
      service.cancel('measure-1', 'sem fonte de produto', 'actor-1'),
    ).rejects.toThrow(
      'Administrative measure measure-1 has no cancellation state in WF-TEAT-004',
    );
    expect(transaction).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(history).not.toHaveBeenCalled();
  });
});
