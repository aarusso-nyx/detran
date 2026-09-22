// CTG-0002 §15.1 C-0002-43 [int] — envelope dos eventos publicados pelo
// ciclo (§12; `rait-events-sse-contract.md` §1) via `publish(tx, envelope)` e
// `topic(...)` de `cycle/events.ts` (§14.1; §1.3 regra 8: tipos técnicos por
// concatenação, nunca literal). Para cada `type` de §12: `id`, `type`,
// `domainEvent`, `version=1`, `occurredAt`, `tenantId`, `actor`,
// `aggregate{kind,id,version}`, `data` só com as chaves listadas (nenhuma
// `note`/`description`/nome/placa) e `idempotency_key` `<type>:<id>:<version>`.
// Linhas da outbox criadas aqui têm `aggregate_id` no namespace `0083 07…` e
// são apagadas no `afterAll`.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { publish, topic } from '../../src/handwritten/cycle/index.js';
import {
  EVENT_AGGREGATE_KIND,
  EVENT_DATA_KEYS,
  EVENT_TYPES,
  FIXTURE_TENANT_ID,
  FORBIDDEN_EVENT_DATA_KEYS,
  ORIGIN_OBJECTS,
  ROLES,
  USERS,
  cycleId,
} from '../fixtures/cycle-fixtures.js';
import { CycleDb } from '../support/cycle-harness.js';

const SPEC = '07';
const NOW = new Date('2026-09-21T12:00:00.000Z');
const db = new CycleDb();
let seq = 0;
const nextId = () => cycleId(SPEC, (seq += 1));

/** Um envelope válido por `type` de §12, com `data` restrito às chaves da
 * tabela (subconjunto: as opcionais ficam de fora). */
function envelopeFor(type: string, aggregateId: string, version: number) {
  const base = {
    id: nextId(),
    version: 1,
    occurredAt: NOW.toISOString(),
    tenantId: FIXTURE_TENANT_ID,
    actor: { kind: 'system' as const, id: USERS.integrationOperator },
    correlationId: `req-0083-${aggregateId.slice(-6)}`,
    aggregate: { kind: EVENT_AGGREGATE_KIND[type]!, id: aggregateId, version },
  };
  switch (type) {
    case EVENT_TYPES.alertChanged:
      return {
        ...base,
        type,
        domainEvent: 'ALERTA_DETECTADO',
        data: {
          alertId: aggregateId,
          indicatorCode: 'IND-DASH-101',
          track: 'extinction',
          fromState: null,
          toState: 'DETECTADO',
          severity: 'N1',
          block: 'A',
          sourceApp: 'rait',
          objectKind: 'case',
          objectLayer: 'N2',
          objectRef: ORIGIN_OBJECTS.raitCase08,
          ownerRole: ROLES.raitAnalyst,
          escalationLevel: 0,
          occurredAt: NOW.toISOString(),
        },
      };
    case EVENT_TYPES.dutyChanged:
      return {
        ...base,
        type,
        domainEvent: 'DEVER_JANELA_ABERTA',
        data: {
          dutyCycleId: aggregateId,
          dutyCode: 'DUTY-01',
          indicatorCode: 'IND-DASH-201',
          period: '2026-10',
          fromState: null,
          toState: 'JANELA_ABERTA',
          deadlineOn: '2026-11-20',
          late: false,
          occurredAt: NOW.toISOString(),
        },
      };
    case EVENT_TYPES.sourceFreshness:
      return {
        ...base,
        type,
        domainEvent: 'FONTE_FRESCOR_ALTERADO',
        data: {
          sourceId: aggregateId,
          sourceKey: 'portal.outbox',
          app: 'portal',
          fromState: 'FRESCO',
          toState: 'ATRASADO',
          hidden: false,
          lastSeenAt: NOW.toISOString(),
          staleSince: null,
          acceptableLatencyMinutes: 60,
          occurredAt: NOW.toISOString(),
        },
      };
    case EVENT_TYPES.exportRegistered:
      return {
        ...base,
        type,
        domainEvent: 'EXPORTACAO_REGISTRADA',
        data: {
          exportId: aggregateId,
          userRef: USERS.agencyAdmin,
          userRole: ROLES.agencyAdmin,
          scope: 'alerts',
          format: 'csv',
          layer: 'N1',
          rowCount: 10,
          suppressedCells: 0,
          status: 'registered',
          occurredAt: NOW.toISOString(),
        },
      };
    case EVENT_TYPES.reportChanged:
      return {
        ...base,
        type,
        domainEvent: 'ReportRequested',
        data: {
          reportId: aggregateId,
          reportType: 'monthly',
          layer: 'N1',
          status: 'requested',
          occurredAt: NOW.toISOString(),
        },
      };
    case EVENT_TYPES.indicatorConfigChanged:
      return {
        ...base,
        type,
        domainEvent: 'IndicatorConfigChanged',
        data: {
          indicatorConfigId: aggregateId,
          indicatorCode: 'IND-DASH-301',
          code: 'cycle-0083-events',
          status: 'draft',
          hasThreshold: false,
          occurredAt: NOW.toISOString(),
        },
      };
    default:
      throw new Error(`tipo fora de §12: ${type}`);
  }
}

const TYPES = Object.values(EVENT_TYPES);

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.cleanup();
  await db.end();
});

describe('C-0002-43 — topic(...) monta os seis tipos técnicos de §12 por concatenação', () => {
  it.each([
    {
      parts: ['dashboard', 'alert', 'changed'],
      expected: EVENT_TYPES.alertChanged,
    },
    {
      parts: ['dashboard', 'duty', 'changed'],
      expected: EVENT_TYPES.dutyChanged,
    },
    {
      parts: ['dashboard', 'source', 'freshness'],
      expected: EVENT_TYPES.sourceFreshness,
    },
    {
      parts: ['dashboard', 'export', 'registered'],
      expected: EVENT_TYPES.exportRegistered,
    },
    {
      parts: ['dashboard', 'report', 'changed'],
      expected: EVENT_TYPES.reportChanged,
    },
    {
      parts: ['dashboard', 'indicator-config', 'changed'],
      expected: EVENT_TYPES.indicatorConfigChanged,
    },
  ])('C-0002-43 dado topic($parts) então $expected', ({ parts, expected }) => {
    expect(topic(...(parts as [string, string, string]))).toBe(expected);
  });
});

describe('C-0002-43 — publish grava o envelope completo na outbox (§12)', () => {
  it.each(TYPES)(
    'C-0002-43 dado o tipo %s quando publicado então o envelope tem id, type, domainEvent, version=1, occurredAt, tenantId, actor, aggregate{kind,id,version}, data só com chaves listadas e idempotency_key <type>:<id>:<version>',
    async (type) => {
      const aggregateId = nextId();
      const envelope = envelopeFor(type, aggregateId, 3);
      await publish(db.tx, envelope as never);
      const rows = await db.outboxFor(aggregateId);
      expect(rows).toHaveLength(1);
      const [row] = rows;
      expect(row!.tenant_id).toBe(FIXTURE_TENANT_ID);
      expect(row!.topic).toBe(type);
      expect(row!.aggregate_type).toBe(
        `dashboard.${EVENT_AGGREGATE_KIND[type]}`,
      );
      expect(row!.aggregate_id).toBe(aggregateId);
      expect(row!.status).toBe('pending');
      expect(row!.idempotency_key).toBe(`${type}:${aggregateId}:3`);

      const payload = row!.payload;
      expect(payload).toMatchObject({
        id: envelope.id,
        type,
        domainEvent: envelope.domainEvent,
        version: 1,
        occurredAt: NOW.toISOString(),
        tenantId: FIXTURE_TENANT_ID,
        actor: { kind: 'system', id: USERS.integrationOperator },
        aggregate: {
          kind: EVENT_AGGREGATE_KIND[type],
          id: aggregateId,
          version: 3,
        },
      });
      expect(Object.keys(payload).sort()).toEqual(
        [
          'id',
          'type',
          'domainEvent',
          'version',
          'occurredAt',
          'tenantId',
          'actor',
          'correlationId',
          'aggregate',
          'data',
        ].sort(),
      );
      const allowed = EVENT_DATA_KEYS[type]!;
      for (const key of Object.keys(payload.data)) {
        expect(allowed, `chave ${key} fora de §12 para ${type}`).toContain(key);
        expect(FORBIDDEN_EVENT_DATA_KEYS as readonly string[]).not.toContain(
          key,
        );
      }
      expect(payload.data).toEqual(envelope.data);
    },
  );

  it('C-0002-43 dado o mesmo envelope publicado duas vezes então a segunda inserção é rejeitada pela chave única (tenant_id, idempotency_key) — uma linha por transição', async () => {
    const aggregateId = nextId();
    const envelope = envelopeFor(EVENT_TYPES.alertChanged, aggregateId, 1);
    await publish(db.tx, envelope as never);
    let failed: unknown;
    try {
      await publish(db.tx, { ...envelope, id: nextId() } as never);
    } catch (error) {
      failed = error;
    }
    expect(failed).toBeDefined();
    expect(await db.outboxFor(aggregateId)).toHaveLength(1);
  });

  it('C-0002-43 dado dois envelopes do mesmo agregado com versões 1 e 2 então duas linhas com idempotency_key distintas', async () => {
    const aggregateId = nextId();
    await publish(
      db.tx,
      envelopeFor(EVENT_TYPES.dutyChanged, aggregateId, 1) as never,
    );
    await publish(
      db.tx,
      envelopeFor(EVENT_TYPES.dutyChanged, aggregateId, 2) as never,
    );
    const rows = await db.outboxFor(aggregateId);
    expect(rows.map((row) => row.idempotency_key)).toEqual([
      `${EVENT_TYPES.dutyChanged}:${aggregateId}:1`,
      `${EVENT_TYPES.dutyChanged}:${aggregateId}:2`,
    ]);
  });

  it('C-0002-43 dado envelope com causationId (célula de origem) então o payload o preserva', async () => {
    const aggregateId = nextId();
    const causationId = nextId();
    const envelope = {
      ...envelopeFor(EVENT_TYPES.alertChanged, aggregateId, 1),
      causationId,
    };
    await publish(db.tx, envelope as never);
    const [row] = await db.outboxFor(aggregateId);
    expect(row!.payload.causationId).toBe(causationId);
  });

  it('C-0002-43 dado publish quando executado então só escreve em integration.outbox (§1.3 regra 1)', async () => {
    const statements: string[] = [];
    const spyTx = {
      query: (statement: string, values?: readonly unknown[]) => {
        statements.push(statement);
        return db.tx.query(statement, values);
      },
    };
    const aggregateId = nextId();
    await publish(
      spyTx,
      envelopeFor(EVENT_TYPES.sourceFreshness, aggregateId, 1) as never,
    );
    await db.outboxFor(aggregateId); // registra a linha para o afterAll (§4.16, A16)
    const writes = statements.filter((sql) =>
      /^\s*(insert|update|delete)/i.test(sql),
    );
    expect(writes).toHaveLength(1);
    expect(writes[0]).toMatch(/insert\s+into\s+integration\.outbox/i);
    expect(writes[0]).not.toMatch(/dashboard\.[a-z_]+\s+\(/i);
  });
});
