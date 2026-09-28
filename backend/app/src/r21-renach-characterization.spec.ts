import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';

import { PecRenachTransmissionService } from './pec-renach-transmission.service.js';

function subject(query: ReturnType<typeof vi.fn>) {
  const database = {
    tx: async <T>(work: (transaction: { query: typeof query }) => Promise<T>) =>
      work({ query }),
  };
  const context = {
    hasActiveContext: () => true,
    snapshot: () => ({
      tenantId: 'fixture-tenant-a',
      actorId: 'fixture-actor',
      requestId: 'fixture-request',
    }),
  };
  return new PecRenachTransmissionService(
    database as never,
    context as never,
    {
      submitMedicalExam: vi.fn(),
    } as never,
  );
}

describe('R-0021 RENACH caracterizado', () => {
  it('dado trabalho processing com quinze minutos quando claim ocorre então torna-o elegível sob skip locked', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });

    await expect(subject(query).dispatchDue(99)).resolves.toEqual([]);
    expect(query.mock.calls[0]?.[0]).toContain(
      "status = 'processing' and dispatched_at <= now() - interval '15 minutes'",
    );
    expect(query.mock.calls[0]?.[0]).toContain('for update skip locked');
    expect(query.mock.calls[0]?.[1]).toEqual([25]);
  });

  it('dado ACK de erro sem mensagem ou status inválido quando recebido então rejeita antes de persistir', async () => {
    const query = vi.fn();
    const service = subject(query);

    expect(() =>
      service.recordAcknowledgement('fixture-event', Buffer.from('{}'), {
        idempotencyKey: 'ch.report:fixture-report',
        status: 'ERROR',
      }),
    ).toThrow('requires a message');
    expect(() =>
      service.recordAcknowledgement('fixture-event', Buffer.from('{}'), {
        idempotencyKey: 'ch.report:fixture-report',
        status: 'UNKNOWN' as 'ACKED',
      }),
    ).toThrow('Unsupported RENACH acknowledgement status');
    expect(query).not.toHaveBeenCalled();
  });

  it('dado ACK ERROR com mensagem quando recebido então persiste erro e retry de quinze minutos', async () => {
    const body = Buffer.from('{"status":"ERROR"}');
    const payloadHash = createHash('sha256').update(body).digest('hex');
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ id: 'receipt-1' }] })
      .mockResolvedValueOnce({
        rows: [
          { id: 'receipt-1', payload_sha256: payloadHash, status: 'received' },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 'outbox-1', status: 'processing', attempts: 2 }],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(
      subject(query).recordAcknowledgement('fixture-error-event', body, {
        idempotencyKey: 'ch.report:fixture-report',
        status: 'ERROR',
        message: 'provider refused fixture',
        providerCode: 'REFUSED',
      }),
    ).resolves.toMatchObject({ status: 'error', duplicate: false });
    expect(query.mock.calls[3]?.[1]).toEqual([
      'outbox-1',
      2,
      'error',
      null,
      'REFUSED',
      'provider refused fixture',
      payloadHash,
    ]);
    expect(query.mock.calls[4]?.[0]).toContain("interval '15 minutes'");
    expect(query.mock.calls[4]?.[1]).toEqual([
      'outbox-1',
      'error',
      'provider refused fixture',
    ]);
  });

  it('dado ACK ERROR após outbox acked quando recebido então não regride o estado confirmado', async () => {
    const body = Buffer.from('{"status":"ERROR","message":"late"}');
    const payloadHash = createHash('sha256').update(body).digest('hex');
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ id: 'receipt-1' }] })
      .mockResolvedValueOnce({
        rows: [
          { id: 'receipt-1', payload_sha256: payloadHash, status: 'received' },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 'outbox-1', status: 'acked', attempts: 1 }],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(
      subject(query).recordAcknowledgement('fixture-late-event', body, {
        idempotencyKey: 'ch.report:fixture-report',
        status: 'ERROR',
        message: 'late provider error',
      }),
    ).resolves.toMatchObject({ status: 'acked' });
    expect(query.mock.calls[3]?.[1]?.[2]).toBe('acked');
    expect(query.mock.calls[4]?.[1]?.[1]).toBe('acked');
  });

  it('dado event_id reutilizado com payload divergente quando ACK chega então conflita sem atualizar efeitos', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'receipt-1',
            payload_sha256: '0'.repeat(64),
            status: 'received',
          },
        ],
      });

    await expect(
      subject(query).recordAcknowledgement(
        'fixture-reused-event',
        Buffer.from('{"status":"ACKED"}'),
        { idempotencyKey: 'ch.report:fixture-report', status: 'ACKED' },
      ),
    ).rejects.toThrow('identity was reused with a different payload');
    expect(query).toHaveBeenCalledTimes(2);
  });
});
