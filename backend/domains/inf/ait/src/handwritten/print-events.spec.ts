import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AitLifecycleService } from '../ait-lifecycle.service.js';

/**
 * CTG-0001 §4.5 (R-0008, TASK-0002) — C-0001-25: reimpressão só no dia da
 * lavratura (RN-TEAT-116, REF-SENATRAN-997 Anexo III, b). Relógio fixo em
 * "hoje" = 2026-09-14 (rait-test-strategy.md §6). Ver nota de design em
 * `ait-state-transitions.matrix.spec.ts` sobre testar contra
 * `AitLifecycleService`.
 */

function stubService(issuedAt: string) {
  const ait: Record<string, unknown> = {
    id: 'ait-30',
    current_status: 'FINALIZADO_LOCAL',
    ait_number: 'TEAT-030',
    series: 'F',
    issued_at: issuedAt,
    version: 1,
  };
  const repositories = {
    ait: {
      transaction: vi.fn(async (work: (tx: unknown) => unknown) => work({})),
      findOne: vi.fn(async () => ({ ...ait })),
      update: vi.fn(async (_id: string, patch: Record<string, unknown>) => ({
        ...ait,
        ...patch,
      })),
    } as never,
    history: { create: vi.fn(async (dto: unknown) => dto) } as never,
    vehicles: {} as never,
    people: {} as never,
    corrections: {} as never,
    signatures: {} as never,
    printEvents: { create: vi.fn(async (dto: unknown) => dto) } as never,
  };
  return new AitLifecycleService(repositories, { assertActive: vi.fn() });
}

describe('AIT — reimpressão só no dia da lavratura (C-0001-25, RN-TEAT-116)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-14T12:00:00.000-04:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('dado um AIT emitido ontem (2026-09-13) quando print-events com event_type="reimpressao" então 422 TEAT.AIT_PRINT_REPRINT_WINDOW_EXCEEDED com context.issuedOn', async () => {
    const service = stubService('2026-09-13T10:01:00.000-04:00');
    await expect(
      service.recordPrint('ait-30', { event_type: 'reimpressao' } as never),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_PRINT_REPRINT_WINDOW_EXCEEDED',
      status: 422,
      context: expect.objectContaining({ issuedOn: expect.anything() }),
    });
  });

  it('dado um AIT emitido hoje (2026-09-14) quando print-events com event_type="reimpressao" então sucede (mesmo dia da lavratura)', async () => {
    const service = stubService('2026-09-14T09:00:00.000-04:00');
    await expect(
      service.recordPrint('ait-30', { event_type: 'reimpressao' } as never),
    ).resolves.toBeDefined();
  });

  it('dado um AIT emitido ontem quando print-events com event_type="impressao" (primeira impressão) então sucede (a janela só vale para reimpressão)', async () => {
    const service = stubService('2026-09-13T10:01:00.000-04:00');
    await expect(
      service.recordPrint('ait-30', { event_type: 'impressao' } as never),
    ).resolves.toBeDefined();
  });
});
