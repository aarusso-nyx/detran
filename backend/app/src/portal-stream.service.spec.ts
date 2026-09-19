// R-0009 CTG-0002 §9 e §13 (TASK-0006) — C-0002-60: `PortalStreamService`
// (M18): `PORTAL_STREAM_TYPES` (quatro tipos), `reshape(topic, payload)` por
// tipo (RN-PORTAL-112: nenhum token de inf/rait sai; `data` reformatado), topic
// desconhecido → null, e `listSince(cursor, scope)` com o escopo (cpf_hash,
// subjectId) aplicado NO SQL e ordem `(created_at, id)`. Fica vermelho até
// TASK-0008 criar `backend/app/src/portal-stream.service.ts` (§14).
//
// Mesmo padrão de `teat-stream.service.spec.ts`: `import()` dinâmico com
// especificador variável (o arquivo ainda não existe; `tsc --noEmit` do app não
// pode quebrar por TS2307), transação falsa que só grava SQL e parâmetros.
// Os `type` técnicos são montados por `join('.')` — nunca o literal
// `portal.<x>.<y>` num spec de `src/` (verify:parameter-catalogue).
import { describe, expect, it, vi } from 'vitest';

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

const topic = (...parts: string[]): string => parts.join('.');
const TOPIC = {
  requestChanged: topic('portal', 'request', 'changed'),
  inboxItem: topic('portal', 'inbox', 'item'),
  decisionPublished: topic('rait', 'decision', 'published'),
  paymentConfirmed: topic('inf', 'payment', 'confirmed'),
  infractionChanged: topic('inf', 'infraction', 'changed'),
  raitCaseChanged: topic('rait', 'case', 'changed'),
};
const NEXT_ACTION_LABEL = (state: string) =>
  topic('portal', 'requests', 'nextAction', state);

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const SUBJECT_ID = '00000000-0000-7000-8000-000070000002';
const CPF_HASH =
  'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4';
const REQUEST_ID = '00000000-0000-7000-8000-000070400009';
const CASE_ID = '00000000-0000-7000-8000-007000700207';
const AIT_ID = '00000000-0000-7000-8000-0000f0000002';
const INBOX_ID = '00000000-0000-7000-8000-000070c00001';

interface StreamServiceModule {
  PORTAL_STREAM_TYPES: readonly string[];
  PORTAL_STREAM_EVENT_BY_TOPIC: Readonly<Record<string, string>>;
  PORTAL_STREAM_POLLER: symbol;
  reshape: (
    topic: string,
    payload: Record<string, unknown>,
    row?: Record<string, unknown>,
  ) => Record<string, unknown> | null;
  PortalStreamService: new (...args: unknown[]) => {
    now(): Promise<string>;
    findById(id: string): Promise<unknown>;
    listSince(
      cursor: { createdAt: string; id: string | null },
      scope: { cpfHash: string; subjectId: string },
      limit?: number,
    ): Promise<unknown[]>;
  };
}

async function loadModule(): Promise<StreamServiceModule> {
  try {
    return (await importModule(
      './portal-stream.service.js',
    )) as StreamServiceModule;
  } catch (cause) {
    throw new Error(
      'backend/app/src/portal-stream.service.ts ainda não existe (TASK-0008, CTG-0002 §9/§14)',
      { cause },
    );
  }
}

function envelope(
  type: string,
  domainEvent: string,
  aggregate: Record<string, unknown>,
  data: Record<string, unknown>,
) {
  return {
    id: '00000000-0000-7000-8000-007000700091',
    type,
    domainEvent,
    version: 1,
    occurredAt: '2026-09-14T16:00:00.000Z',
    tenantId: TENANT_ID,
    actor: { kind: 'user', id: SUBJECT_ID },
    correlationId: '00000000-0000-4000-8000-00000000c0f1',
    aggregate,
    data,
  };
}

function recordingDatabase() {
  const calls: Array<{ sql: string; values: readonly unknown[] }> = [];
  const tx = {
    query: vi.fn(async (sql: string, values: readonly unknown[] = []) => {
      calls.push({ sql, values });
      return { rows: [] };
    }),
  };
  const database = {
    tx: vi.fn(async (...args: unknown[]) => {
      const work = args.find((arg) => typeof arg === 'function') as (
        t: unknown,
      ) => Promise<unknown>;
      return work(tx);
    }),
  };
  const requestContext = {
    hasActiveContext: () => true,
    snapshot: () => ({
      tenantId: TENANT_ID,
      actorId: SUBJECT_ID,
      requestId: '00000000-0000-4000-8000-00000000c0f1',
    }),
  };
  return { calls, tx, database, requestContext };
}

describe('CTG-0002 §9 — PortalStreamService (C-0002-60)', () => {
  it('C-0002-60 — dado PORTAL_STREAM_TYPES então exatamente os quatro tipos e o mapa topic → evento SSE do §9', async () => {
    const { PORTAL_STREAM_TYPES, PORTAL_STREAM_EVENT_BY_TOPIC } =
      await loadModule();
    expect([...PORTAL_STREAM_TYPES].sort()).toEqual([
      'decision.published',
      'inbox.item',
      'payment.confirmed',
      'request.changed',
    ]);
    expect(PORTAL_STREAM_EVENT_BY_TOPIC).toEqual({
      [TOPIC.requestChanged]: 'request.changed',
      [TOPIC.inboxItem]: 'inbox.item',
      [TOPIC.decisionPublished]: 'decision.published',
      [TOPIC.paymentConfirmed]: 'payment.confirmed',
    });
  });

  it('C-0002-60 — dado reshape(topic request.changed, payload) então { requestId, situation, nextAction } com nextAction de NEXT_ACTION_BY_STATE (§3.5)', async () => {
    const { reshape } = await loadModule();
    const payload = envelope(
      TOPIC.requestChanged,
      'SOLICITACAO_PROTOCOLADA',
      { kind: 'portal.request', id: REQUEST_ID, version: 2 },
      {
        requestId: REQUEST_ID,
        serviceKey: 'consulta_multas',
        fromState: 'PEDIDO_EM_COMPOSICAO',
        toState: 'PROTOCOLADO',
        subjectId: SUBJECT_ID,
        subjectCpfHash: CPF_HASH,
        protocolNumber: 'AM-FIXTURES-2026-0000015',
      },
    );
    expect(reshape(TOPIC.requestChanged, payload)).toEqual({
      requestId: REQUEST_ID,
      situation: 'PROTOCOLADO',
      nextAction: {
        by: 'agency',
        label: NEXT_ACTION_LABEL('PROTOCOLADO'),
        dueOn: null,
      },
    });
    const offered = {
      ...payload,
      data: { ...payload.data, toState: 'AVALIACAO_OFERECIDA' },
    };
    expect(reshape(TOPIC.requestChanged, offered)).toMatchObject({
      situation: 'AVALIACAO_OFERECIDA',
      nextAction: {
        by: 'citizen',
        label: NEXT_ACTION_LABEL('AVALIACAO_OFERECIDA'),
        dueOn: null,
      },
    });
    // nunca o cpf_hash nem o tenant no frame
    expect(
      JSON.stringify(reshape(TOPIC.requestChanged, payload)),
    ).not.toContain(CPF_HASH);
    expect(
      JSON.stringify(reshape(TOPIC.requestChanged, payload)),
    ).not.toContain(TENANT_ID);
  });

  it('C-0002-60 — dado topic decision.published então { requestId }; payment.confirmed então { aitId }; inbox.item então { id, kind }; topic desconhecido então null', async () => {
    const { reshape } = await loadModule();
    const decision = envelope(
      TOPIC.decisionPublished,
      'RAIT_DECISAO_PUBLICADA',
      { kind: 'case', id: CASE_ID, version: 3 },
      {
        caseId: CASE_ID,
        decisionId: '00000000-0000-7000-8000-007000700409',
        decisionKind: 'indeferido',
        publishedOn: '2026-09-12',
        channel: 'portal',
        requestId: REQUEST_ID,
      },
    );
    // o requestId vem da junção com portal.request (delegation_external_id = caseId, §9); o spec
    // o oferece tanto em `data` quanto na linha (`request_id`) para não fixar onde o serviço o lê
    expect(
      reshape(TOPIC.decisionPublished, decision, { request_id: REQUEST_ID }),
    ).toEqual({ requestId: REQUEST_ID });

    const payment = envelope(
      TOPIC.paymentConfirmed,
      'PAGAMENTO_CONFIRMADO',
      {
        kind: 'payment',
        id: '00000000-0000-7000-8000-007000700105',
        version: 1,
      },
      {
        paymentId: '00000000-0000-7000-8000-007000700105',
        documentId: '00000000-0000-7000-8000-007000700205',
        infractionId: '00000000-0000-7000-8000-0000d0000002',
        aitId: AIT_ID,
        tier: 'desconto_80',
        paidOn: '2026-09-10',
        amount: 156.18,
      },
    );
    expect(reshape(TOPIC.paymentConfirmed, payment)).toEqual({ aitId: AIT_ID });

    // sem produtor nesta rodada (OD-P40): envelope sem domainEvent, como rait.inquiry.changed
    const { domainEvent: _none, ...inbox } = envelope(
      TOPIC.inboxItem,
      '',
      { kind: 'portal.inbox_item', id: INBOX_ID, version: 1 },
      {
        id: INBOX_ID,
        kind: 'acao_necessaria',
        subjectId: SUBJECT_ID,
        subjectCpfHash: CPF_HASH,
      },
    );
    expect(reshape(TOPIC.inboxItem, inbox)).toEqual({
      id: INBOX_ID,
      kind: 'acao_necessaria',
    });

    for (const unknown of [
      TOPIC.infractionChanged,
      TOPIC.raitCaseChanged,
      'ait.changed',
      '',
    ]) {
      expect(
        reshape(
          unknown,
          envelope(
            unknown,
            'X',
            { kind: 'x', id: 'y', version: 1 },
            { aitId: AIT_ID },
          ),
        ),
        unknown,
      ).toBeNull();
    }
  });

  it('C-0002-60 — dado listSince com cursor então o SQL ordena por (created_at, id) e aplica o escopo (hash, subjectId) no where, com o cursor e o limite nos parâmetros', async () => {
    const { PortalStreamService } = await loadModule();
    const { calls, database, requestContext } = recordingDatabase();
    const service = new PortalStreamService(database, requestContext);
    const cursor = {
      createdAt: '2026-09-14T15:00:00.000Z',
      id: '00000000-0000-7000-8000-007000700001',
    };
    const scope = { cpfHash: CPF_HASH, subjectId: SUBJECT_ID };
    await service.listSince(cursor, scope, 200);

    expect(calls.length).toBeGreaterThanOrEqual(1);
    const listing = calls.find((call) =>
      /from\s+integration\.outbox/i.test(call.sql),
    )!;
    expect(listing, 'consulta a integration.outbox').toBeDefined();
    const sql = listing.sql.replace(/\s+/g, ' ').toLowerCase();
    expect(sql).toMatch(/order by\s+(\w+\.)?created_at\s*,\s*(\w+\.)?id/);
    const whereClause = sql.slice(
      sql.indexOf('where'),
      sql.indexOf('order by'),
    );
    // escopo no próprio where: parâmetros do hash e do sujeito referenciados antes do order by
    const hashIndex = listing.values.indexOf(CPF_HASH);
    const subjectIndex = listing.values.indexOf(SUBJECT_ID);
    expect(hashIndex, 'cpf_hash nos parâmetros').toBeGreaterThanOrEqual(0);
    expect(subjectIndex, 'subjectId nos parâmetros').toBeGreaterThanOrEqual(0);
    expect(whereClause).toContain(`$${hashIndex + 1}`);
    expect(whereClause).toContain(`$${subjectIndex + 1}`);
    expect(listing.values).toContain(cursor.createdAt);
    expect(listing.values).toContain(cursor.id);
    expect(listing.values).toContain(200);
    // nunca filtra em memória linhas de outro sujeito: o SQL só pode devolver o escopo
    expect(whereClause).toMatch(/created_at/);

    const initial = await service.listSince(
      { createdAt: cursor.createdAt, id: null },
      scope,
    );
    expect(initial).toEqual([]);
    const withoutId = calls.at(-1)!;
    expect(withoutId.values).toContain(cursor.createdAt);
    expect(withoutId.values).not.toContain(cursor.id);
  });

  it('C-0002-60 — dado now() e findById então consultam o banco do servidor dentro da transação de tenant (padrão teat-stream.service.ts)', async () => {
    const { PortalStreamService, PORTAL_STREAM_POLLER } = await loadModule();
    expect(typeof PORTAL_STREAM_POLLER).toBe('symbol');
    const { calls, database, requestContext } = recordingDatabase();
    const service = new PortalStreamService(database, requestContext);
    await service.findById('00000000-0000-7000-8000-007000700001');
    expect(calls.at(-1)!.sql.toLowerCase()).toContain('integration.outbox');
    expect(calls.at(-1)!.values).toContain(
      '00000000-0000-7000-8000-007000700001',
    );
    expect(database.tx).toHaveBeenCalled();
  });
});
