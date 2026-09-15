import { describe, expect, it, vi } from 'vitest';

import { SqlTeatEventOutbox } from './sql-outbox.js';
import type { TeatEventEnvelope } from './outbox.js';

/**
 * CTG-0001 §13 item 5 (Adenda, R-0008, TASK-0002 iteração 3): `envelope.id`
 * é o id real da linha inserida em `integration.outbox` (`insert … returning
 * id`), nunca um id gerado pelo chamador. `append` passa a devolver `{ id }`
 * — hoje devolve `void` (CTG-0001 §2 original), então este arquivo fica
 * vermelho até o Engineer (iteração 3) mudar a assinatura.
 */

function fakeTransaction(insertedId: string) {
  const calls: Array<{ sql: string; values?: readonly unknown[] }> = [];
  const query = vi.fn(async (sql: string, values?: readonly unknown[]) => {
    calls.push({ sql, values });
    if (sql.includes('auth.current_tenant')) {
      return { rows: [{ tenant_id: 'tenant-outbox-1' }] };
    }
    // Simulates `insert … returning id` — whatever shape the Engineer
    // picks, the row handed back to the caller must expose the real id.
    return { rows: [{ id: insertedId }] };
  });
  return { tx: { query } as never, calls };
}

function envelope(): TeatEventEnvelope {
  return {
    id: '',
    type: 'ait.changed',
    domainEvent: 'AIT_FINALIZADO',
    version: 1,
    occurredAt: '2026-09-14T10:00:00.000Z',
    tenantId: '',
    actor: { kind: 'user', id: 'actor-1' },
    correlationId: 'correlation-1',
    aggregate: { kind: 'ait', id: 'ait-1', version: 2 },
    data: { aitId: 'ait-1' },
  };
}

describe('SqlTeatEventOutbox.append (§13 item 5)', () => {
  it('dado um envelope quando append então devolve { id } com o id real da linha inserida (insert … returning id), nunca gerado pelo chamador', async () => {
    const outbox = new SqlTeatEventOutbox();
    const { tx } = fakeTransaction('00000000-0000-7000-8000-00000000ab01');
    const result = (await outbox.append(tx, envelope())) as unknown as
      { id?: string } | undefined;
    expect(result?.id).toBe('00000000-0000-7000-8000-00000000ab01');
  });

  it('dado um envelope sem id preenchido (caller nunca gera id) quando append então ainda assim persiste e devolve um id — a ausência de id do chamador não é um defeito', async () => {
    const outbox = new SqlTeatEventOutbox();
    const { tx } = fakeTransaction('00000000-0000-7000-8000-00000000ab02');
    const input = envelope();
    expect(input.id).toBe('');
    const result = (await outbox.append(tx, input)) as unknown as
      { id?: string } | undefined;
    expect(result?.id).toBeTruthy();
  });
});
