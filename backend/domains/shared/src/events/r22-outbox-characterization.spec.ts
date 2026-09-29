// R-0022 CTG-0008 §4 — caracterização da porta de eventos de
// `@detran/shared` (arquivo fixo U, A2.1). Cada caso vale antes e depois da
// migração da outbox (P-API congelada, CTG-0008 §6): nada aqui depende do
// armazenamento (`integration.outbox` ou `outbox.events`).
import { describe, expect, it } from 'vitest';

import { outboxIdempotencyKey, type TeatEventEnvelope } from './outbox.js';
import { SqlTeatEventOutbox } from './sql-outbox.js';

// Tokens canônicos citados no próprio contrato da porta (`outbox.ts`:
// `ait.changed` / `AIT_FINALIZADO`); relógio fixo.
function envelope(
  overrides: Partial<TeatEventEnvelope> = {},
): TeatEventEnvelope {
  return {
    id: '',
    type: 'ait.changed',
    domainEvent: 'AIT_FINALIZADO',
    version: 1,
    occurredAt: '2026-09-01T12:00:00.000Z',
    tenantId: '',
    actor: { kind: 'system', id: 'r22-outbox-actor' },
    correlationId: 'r22-outbox-correlation',
    aggregate: { kind: 'ait', id: 'r22-outbox-ait', version: 3 },
    data: {},
    ...overrides,
  };
}

describe('R-0022 CTG-0008 porta de eventos compartilhada', () => {
  it('C-08-17 dado um envelope quando a chave de idempotência é derivada então é <type>:<aggregate.id>:<aggregate.version>', () => {
    expect(outboxIdempotencyKey(envelope())).toBe(
      'ait.changed:r22-outbox-ait:3',
    );
    expect(
      outboxIdempotencyKey(
        envelope({
          type: 'ch.renach.exam-result',
          version: 9,
          tenantId: 'qualquer-tenant',
          aggregate: { kind: 'ch.report', id: 'report-x', version: 2 },
        }),
      ),
    ).toBe('ch.renach.exam-result:report-x:2');
  });

  it('C-08-18 dado uma transação sem query (dublê de guarda) quando append então devolve { id: "" } sem erro nem efeito', async () => {
    const guardOnly = Object.freeze({ kind: 'guard-only-double' });
    await expect(
      new SqlTeatEventOutbox().append(guardOnly as never, envelope()),
    ).resolves.toEqual({ id: '' });
    expect(guardOnly).toEqual({ kind: 'guard-only-double' });
  });
});
