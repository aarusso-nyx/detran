import { describe, expect, it, vi } from 'vitest';

import { AitLifecycleService } from '../ait-lifecycle.service.js';

/**
 * CTG-0001 §4.12/§4.13 (R-0008, TASK-0002) — C-0001-17..20. `accept` grava
 * ACEITO e, na mesma transação, INTEGRADO (M4/ADR-0016), `version` +2 e dois
 * envelopes na outbox; `reject` ignora o campo legado `cancelled` e exige
 * `reason`. Ver nota de design em `ait-state-transitions.matrix.spec.ts`
 * sobre testar contra `AitLifecycleService` e sobre a forma proposta (não
 * canônica) de injeção do outbox.
 */

function stubService(currentStatus: string, startingVersion = 1) {
  const ait: Record<string, unknown> = {
    id: 'ait-60',
    current_status: currentStatus,
    ait_number: 'TEAT-060',
    series: 'F',
    version: startingVersion,
  };
  const historyEntries: Array<{ status: string }> = [];
  const update = vi.fn(async (_id: string, patch: Record<string, unknown>) => {
    Object.assign(ait, patch);
    return { ...ait };
  });
  // §13 item 5: `append` devolve `{ id }` (o id real da linha da outbox);
  // o serviço nunca gera esse id sozinho.
  const outbox = {
    append: vi.fn(async (_tx: unknown, _envelope: unknown) => ({
      id: 'outbox-row-1',
    })),
  };
  const repositories = {
    ait: {
      transaction: vi.fn(async (work: (tx: unknown) => unknown) => work({})),
      findOne: vi.fn(async () => ({ ...ait })),
      update,
    } as never,
    history: {
      create: vi.fn(async (dto: { status: string }) => {
        historyEntries.push({ status: dto.status });
        return dto;
      }),
    } as never,
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
      outbox?: unknown,
    ) => AitLifecycleService
  )(repositories, { assertActive: vi.fn() }, { outbox });
  return { service, historyEntries, outbox, ait };
}

describe('AIT — accept publica ACEITO e INTEGRADO na mesma transação (C-0001-17/18, M4/ADR-0016)', () => {
  it('C-0001-17 — dado o AIT …f8000060 (RECEBIDO) quando accept então duas linhas de histórico (ACEITO, INTEGRADO), current_status=INTEGRADO e version +2', async () => {
    const { service, historyEntries } = stubService('RECEBIDO', 5);
    const result = (await service.accept(
      '00000000-0000-7000-8000-0000f8000060',
      'actor-1',
    )) as { current_status?: string; version?: number };
    expect(historyEntries.map((entry) => entry.status)).toEqual([
      'ACEITO',
      'INTEGRADO',
    ]);
    expect(result.current_status).toBe('INTEGRADO');
    expect(result.version).toBe(7);
  });

  it('C-0001-18 — dado o mesmo accept então a outbox recebe exatamente dois envelopes, AIT_ACEITO (v+1) e AIT_INTEGRADO (v+2), nesta ordem', async () => {
    const { service, outbox } = stubService('RECEBIDO', 5);
    await service.accept('00000000-0000-7000-8000-0000f8000060', 'actor-1');
    const envelopes = outbox.append.mock.calls.map(
      (call) =>
        call[1] as { domainEvent?: string; aggregate?: { version?: number } },
    );
    expect(envelopes).toHaveLength(2);
    expect(envelopes[0]?.domainEvent).toBe('AIT_ACEITO');
    expect(envelopes[0]?.aggregate?.version).toBe(6);
    expect(envelopes[1]?.domainEvent).toBe('AIT_INTEGRADO');
    expect(envelopes[1]?.aggregate?.version).toBe(7);
  });
});

describe('AIT — envelope.id vem da outbox, o serviço nunca gera ids de evento (§13 item 5)', () => {
  it('dado accept quando a outbox recebe os envelopes então nenhum deles carrega um id gerado pelo serviço (append é quem atribui o id da linha)', async () => {
    const { service, outbox } = stubService('RECEBIDO', 5);
    await service.accept('00000000-0000-7000-8000-0000f8000060', 'actor-1');
    const envelopes = outbox.append.mock.calls.map(
      (call) => call[1] as { id?: unknown },
    );
    expect(envelopes.length).toBeGreaterThan(0);
    for (const envelope of envelopes) {
      expect(envelope.id).toBeFalsy();
    }
  });
});

describe('AIT — reject ignora o campo legado cancelled e exige reason (C-0001-19/20)', () => {
  it('C-0001-19 — dado reject com cancelled:true de RECEBIDO então REJEITADO (campo ignorado), nunca CANCELADO_RASCUNHO', async () => {
    const { service } = stubService('RECEBIDO');
    const result = (await service.reject(
      '00000000-0000-7000-8000-0000f8000060',
      'inconsistência encontrada',
      true,
      'actor-1',
    )) as { current_status?: string };
    expect(result.current_status).toBe('REJEITADO');
    expect(result.current_status).not.toBe('CANCELADO_RASCUNHO');
  });

  it('C-0001-20 — dado reject sem reason então 422 TEAT.AIT_REJECT_REASON_REQUIRED', async () => {
    const { service } = stubService('RECEBIDO');
    await expect(
      service.reject('00000000-0000-7000-8000-0000f8000060', '', 'actor-1'),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_REJECT_REASON_REQUIRED',
      status: 422,
    });
  });
});
