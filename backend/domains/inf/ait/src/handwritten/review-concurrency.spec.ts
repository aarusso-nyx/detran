import { describe, expect, it, vi } from 'vitest';

import { AitLifecycleService } from '../ait-lifecycle.service.js';

/**
 * CTG-0001 §3.1/§4.8/§13 item 1 (R-0008, TASK-0002 iteração 3) — C-0001-12..16.
 * `SUSPEITO_CONCORRENCIA` precede `AIT_STATE_INVALID` com
 * `AIT_CONCURRENCY_PENDING_REVIEW` em `accept`/`reject` (RN-TEAT-111), e o
 * comando `concurrency-review` (M4) resolve a apuração através da porta
 * `SyncConflictPort` (`@detran/ops-core`, §13 item 1 da Adenda) — ainda não
 * existe (Engineer iteração 3). `findOpenConcurrencyConflict`/`resolve` são
 * injetados via `collaborators.syncConflicts`, no mesmo padrão de
 * `collaborators.outbox`/`collaborators.cancelRequests` já usado pelo
 * serviço (`normalizeCollaborators`, `ait-lifecycle.service.ts`); nenhuma
 * fonte fixa o nome exato da propriedade, então esta é uma proposta do
 * Inspector, não um valor canônico.
 */

function stubService(
  currentStatus: string,
  options: {
    openConflict?: { id: string; syncQueueItemId: string } | null;
  } = {},
) {
  const ait: Record<string, unknown> = {
    id: 'ait-70',
    current_status: currentStatus,
    ait_number: 'TEAT-070',
    series: 'F',
    version: 1,
  };
  const update = vi.fn(async (_id: string, patch: Record<string, unknown>) => {
    Object.assign(ait, patch);
    return { ...ait };
  });
  const outbox = {
    append: vi.fn(async (_tx: unknown, _envelope: unknown) => ({
      id: 'outbox-row-70',
    })),
  };
  const openConflict =
    options.openConflict === undefined
      ? { id: 'conflict-70', syncQueueItemId: 'queue-70' }
      : options.openConflict;
  const syncConflicts = {
    findOpenConcurrencyConflict: vi.fn(
      async (_aitId: string, _tx: unknown) => openConflict,
    ),
    resolve: vi.fn(
      async (
        _conflictId: string,
        _options: {
          action: 'accept_server' | 'reject';
          resolvedByUserRef?: string;
          description?: string;
        },
        _tx: unknown,
      ) => undefined,
    ),
  };
  const repositories = {
    ait: {
      transaction: vi.fn(async (work: (tx: unknown) => unknown) => work({})),
      findOne: vi.fn(async () => ({ ...ait })),
      update,
    } as never,
    history: { create: vi.fn(async (dto: unknown) => dto) } as never,
    vehicles: {} as never,
    people: {} as never,
    corrections: {} as never,
    signatures: {} as never,
    printEvents: {} as never,
  };
  const service = new (
    AitLifecycleService as unknown as new (
      repositories: unknown,
      normative: unknown,
      collaborators?: unknown,
    ) => AitLifecycleService & {
      reviewConcurrency?: (...args: unknown[]) => Promise<unknown>;
    }
  )(repositories, { assertActive: vi.fn() }, { outbox, syncConflicts });
  return { service, outbox, syncConflicts };
}

/**
 * `service.reviewConcurrency?.(...)` alone would resolve to `undefined`
 * synchronously (optional chaining short-circuits the call) when the method
 * is absent, and `expect(undefined).rejects` is a matcher-usage error, not a
 * clean "missing behaviour" failure. This wrapper always returns a rejected
 * promise so every assertion below fails for the right reason.
 */
function reviewConcurrency(
  service: ReturnType<typeof stubService>['service'],
  ...args: [string, string, string, string]
): Promise<unknown> {
  return service.reviewConcurrency
    ? service.reviewConcurrency(...args)
    : Promise.reject(
        new Error(
          'AitLifecycleService.reviewConcurrency ainda não existe (TASK-0003, M4)',
        ),
      );
}

describe('AIT — SUSPEITO_CONCORRENCIA precede AIT_STATE_INVALID em accept/reject (C-0001-12/13, RN-TEAT-111)', () => {
  it('C-0001-12 — dado o AIT …f8000070 (SUSPEITO_CONCORRENCIA) quando accept então 409 TEAT.AIT_CONCURRENCY_PENDING_REVIEW com context.conflictId, nunca AIT_STATE_INVALID', async () => {
    const { service } = stubService('SUSPEITO_CONCORRENCIA');
    await expect(
      service.accept('00000000-0000-7000-8000-0000f8000070', 'actor-1'),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_CONCURRENCY_PENDING_REVIEW',
      status: 409,
      context: expect.objectContaining({ conflictId: expect.anything() }),
    });
  });

  it('C-0001-13 — dado o mesmo AIT quando reject então 409 TEAT.AIT_CONCURRENCY_PENDING_REVIEW, mesma precedência', async () => {
    const { service } = stubService('SUSPEITO_CONCORRENCIA');
    await expect(
      service.reject(
        '00000000-0000-7000-8000-0000f8000070',
        'motivo qualquer',
        'actor-1',
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_CONCURRENCY_PENDING_REVIEW',
      status: 409,
    });
  });
});

describe('AIT — concurrency-review resolve o conflito canônico via SyncConflictPort (C-0001-14/15/16, §13 item 1)', () => {
  it('C-0001-14 — dado o AIT …f8000070 com conflito aberto quando concurrency-review decision=release então RECEBIDO, SyncConflictPort.resolve(conflictId, {action:"accept_server",...}) na mesma transação e eventos AIT_RECEBIDO + SYNC_CONFLITO_RESOLVIDO', async () => {
    const { service, outbox, syncConflicts } = stubService(
      'SUSPEITO_CONCORRENCIA',
    );
    const result = (await reviewConcurrency(
      service,
      '00000000-0000-7000-8000-0000f8000070',
      'release',
      'apuração concluída sem indício de fraude',
      'actor-1',
    )) as { current_status?: string; context?: { conflictId?: string } };
    expect(result?.current_status).toBe('RECEBIDO');
    expect(syncConflicts.findOpenConcurrencyConflict).toHaveBeenCalledWith(
      '00000000-0000-7000-8000-0000f8000070',
      expect.anything(),
    );
    expect(syncConflicts.resolve).toHaveBeenCalledWith(
      'conflict-70',
      expect.objectContaining({
        action: 'accept_server',
        resolvedByUserRef: 'actor-1',
      }),
      expect.anything(),
    );
    expect(result?.context?.conflictId).toBe('conflict-70');
    const publishedTypes = outbox.append.mock.calls.map(
      (call) => (call[1] as { domainEvent?: string } | undefined)?.domainEvent,
    );
    expect(publishedTypes).toEqual(
      expect.arrayContaining(['AIT_RECEBIDO', 'SYNC_CONFLITO_RESOLVIDO']),
    );
  });

  it('C-0001-15 — dado o mesmo AIT quando concurrency-review decision=reject então REJEITADO, SyncConflictPort.resolve(conflictId, {action:"reject",...}) e eventos AIT_REJEITADO + SYNC_CONFLITO_RESOLVIDO', async () => {
    const { service, outbox, syncConflicts } = stubService(
      'SUSPEITO_CONCORRENCIA',
    );
    const result = (await reviewConcurrency(
      service,
      '00000000-0000-7000-8000-0000f8000070',
      'reject',
      'indício de fraude confirmado',
      'actor-1',
    )) as { current_status?: string };
    expect(result?.current_status).toBe('REJEITADO');
    expect(syncConflicts.resolve).toHaveBeenCalledWith(
      'conflict-70',
      expect.objectContaining({
        action: 'reject',
        resolvedByUserRef: 'actor-1',
      }),
      expect.anything(),
    );
    const publishedTypes = outbox.append.mock.calls.map(
      (call) => (call[1] as { domainEvent?: string } | undefined)?.domainEvent,
    );
    expect(publishedTypes).toEqual(
      expect.arrayContaining(['AIT_REJEITADO', 'SYNC_CONFLITO_RESOLVIDO']),
    );
  });

  it('C-0001-16 — dado concurrency-review sem reason então 422 TEAT.VALIDATION_FAILED com context.fields[0].path === "reason"', async () => {
    const { service } = stubService('SUSPEITO_CONCORRENCIA');
    await expect(
      reviewConcurrency(
        service,
        '00000000-0000-7000-8000-0000f8000070',
        'release',
        '',
        'actor-1',
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 422,
      context: expect.objectContaining({
        fields: expect.arrayContaining([
          expect.objectContaining({ path: 'reason' }),
        ]),
      }),
    });
  });

  it('§13 item 1 — dado o AIT em SUSPEITO_CONCORRENCIA sem conflito aberto (findOpenConcurrencyConflict devolve null) quando concurrency-review então 409 TEAT.AIT_STATE_INVALID com context.command="concurrency-review"', async () => {
    const { service } = stubService('SUSPEITO_CONCORRENCIA', {
      openConflict: null,
    });
    await expect(
      reviewConcurrency(
        service,
        '00000000-0000-7000-8000-0000f8000070',
        'release',
        'apuração concluída',
        'actor-1',
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_STATE_INVALID',
      status: 409,
      context: expect.objectContaining({ command: 'concurrency-review' }),
    });
  });
});
