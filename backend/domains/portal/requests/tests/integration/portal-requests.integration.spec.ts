// R-0009 CTG-0002 §3, §4, §11, §12 e §13 (TASK-0006) — C-0002-30…32:
// `portal.protocol_seq` coerente com o seed (setval — `71-fixtures-portal-events.sql`),
// ciclo create → draft → submit de `consulta_multas` sobre transação REAL
// (`role_app_backend`, RLS do tenant canônico, ADR-0002) com linhas em
// request/request_draft/protocol/idempotency_record e dois eventos
// `SOLICITACAO_*` na outbox, e rollback = sem evento (rait-events-sse-contract.md
// §5 item 2). Fica vermelho até TASK-0007 criar os módulos de §14.
//
// Banco da rodada: `source work/rounds/R-0009/env-detran-r9.sh` (DDL + seeds
// aplicados). Mesmo harness de transação de
// `ops/offline-sync/tests/integration/harness.ts` (`database()`), sem repetir
// o arquivo: só o que este pacote usa.
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PortalIdentityService } from '@detran/portal-identity';
import { SqlTeatEventOutbox } from '@detran/shared';

import { constructInjectable } from '../support/nest-construct.js';
import {
  SUBJECTS,
  TENANT_ID,
  TOPICS,
  fakeDatabase,
  fakeRequestContext,
  fixedClock,
  identityOf,
} from '../support/portal-fixtures.js';
import {
  PORTAL_DELEGATION_TARGETS,
  ReadServiceDelegationTarget,
  RequestDelegationService,
  UnavailableDelegationTarget,
  type DelegationTarget,
} from '../../src/handwritten/delegation/delegation.service.js';
import { PortalIdempotencyService } from '../../src/handwritten/idempotency.service.js';
import { PortalRequestsService } from '../../src/handwritten/requests.service.js';

const { Client } = pg;
const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const client = new Client({ connectionString });
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const createdRequestIds: string[] = [];

interface SqlTx {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

/** Transação de aplicação: `role_app_backend` + contexto do tenant (ADR-0002). */
async function inTenantTx<T>(work: (tx: SqlTx) => Promise<T>): Promise<T> {
  await client.query('begin');
  try {
    await client.query('set local role role_app_backend');
    await client.query(`select set_config('app.tenant_id', $1, true)`, [
      TENANT_ID,
    ]);
    await client.query(`select set_config('app.actor_id', $1, true)`, [
      ACTOR_ID,
    ]);
    const result = await work({
      query: client.query.bind(client) as SqlTx['query'],
    });
    await client.query('commit');
    return result;
  } catch (error) {
    await client.query('rollback');
    throw error;
  }
}

async function asOwner<T>(work: () => Promise<T>): Promise<T> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    TENANT_ID,
  ]);
  return work();
}

function buildService(tx: SqlTx): PortalRequestsService {
  const targets = new Map<string, DelegationTarget>();
  targets.set(
    'consulta_multas',
    new ReadServiceDelegationTarget('consulta_multas', 'ait', ['none', 'ait']),
  );
  targets.set(
    'defesa_previa',
    new UnavailableDelegationTarget(
      'defesa_previa',
      'delegacao_indisponivel_r0007',
      ['ait'],
    ),
  );
  const outbox = new SqlTeatEventOutbox();
  return constructInjectable(PortalRequestsService, {
    PortalIdentityService: new PortalIdentityService(fixedClock as never),
    RequestDelegationService: constructInjectable(RequestDelegationService, {
      PORTAL_DELEGATION_TARGETS: targets,
    }),
    PortalIdempotencyService: constructInjectable(PortalIdempotencyService, {
      PortalClock: fixedClock,
    }),
    PortalClock: fixedClock,
    Database: fakeDatabase(tx),
    RequestContext: fakeRequestContext(),
    SqlTeatEventOutbox: outbox,
    TEAT_EVENT_OUTBOX: outbox,
  });
}

type Body = Record<string, unknown>;
function unwrap<T>(result: unknown): T {
  const row = result as Record<string, unknown>;
  return (
    row && typeof row === 'object' && 'body' in row && !('requestId' in row)
      ? row.body
      : row
  ) as T;
}

beforeAll(async () => {
  await client.connect();
});

afterAll(async () => {
  if (createdRequestIds.length > 0) {
    await asOwner(async () => {
      for (const table of [
        'portal.consequence_ack',
        'portal.evaluation',
        'portal.protocol',
        'portal.request_draft',
      ]) {
        await client.query(
          `delete from ${table} where tenant_id = $1 and ${table === 'portal.evaluation' ? 'subject_id' : 'request_id'} = any($2::uuid[])`,
          [TENANT_ID, createdRequestIds],
        );
      }
      await client.query(
        `delete from integration.outbox where tenant_id = $1 and aggregate_id = any($2::text[])`,
        [TENANT_ID, createdRequestIds],
      );
      await client.query(
        `delete from portal.idempotency_record where tenant_id = $1 and key like $2`,
        [TENANT_ID, `${SUBJECTS.prata.id}:it-%`],
      );
      await client.query(
        `delete from portal.request where tenant_id = $1 and id = any($2::uuid[])`,
        [TENANT_ID, createdRequestIds],
      );
    });
  }
  await client.end();
});

describe('CTG-0002 §3.3/§12 — sequência de protocolo coerente com o seed (C-0002-30)', () => {
  it('C-0002-30 — dado seed executado duas vezes então protocol_seq ≥ 14 (setval) e nextval não colide com AM-FIXTURES-2026-0000001…000000e; a sequência é compartilhada com manifestation.protocol', async () => {
    await asOwner(async () => {
      const seq = await client.query<{
        last_value: string;
        is_called: boolean;
      }>(
        'select last_value::text as last_value, is_called from portal.protocol_seq',
      );
      expect(Number(seq.rows[0]!.last_value)).toBeGreaterThanOrEqual(14);

      const numbers = await client.query<{ number: string }>(
        `select number from portal.protocol where tenant_id = $1
         union all
         select protocol as number from portal.manifestation where tenant_id = $1`,
        [TENANT_ID],
      );
      const fixtureNumbers = numbers.rows.map((row) => row.number);
      // 5 protocolos + 9 manifestações do seed (CTG-0001 §10.5/§10.6) na mesma gramática
      expect(
        fixtureNumbers.filter((number) =>
          /^AM-FIXTURES-2026-\d{7}$/.test(number),
        ).length,
      ).toBeGreaterThanOrEqual(14);
      const maxSeeded = Math.max(
        ...fixtureNumbers.map((number) => Number(number.slice(-7))),
      );
      expect(maxSeeded).toBe(14);

      const next = await client.query<{ seq: string }>(
        `select nextval('portal.protocol_seq')::text as seq`,
      );
      const candidate = `AM-FIXTURES-2026-${next.rows[0]!.seq.padStart(7, '0')}`;
      expect(Number(next.rows[0]!.seq)).toBeGreaterThan(14);
      expect(fixtureNumbers).not.toContain(candidate);
    });
  });
});

describe('CTG-0002 §3/§4/§11 — ciclo consulta_multas sobre transação real (C-0002-31, C-0002-32)', () => {
  it("C-0002-31 — dado sujeito …70000002 quando create+draft+submit de consulta_multas então request, request_draft (2 versões), protocol, idempotency_record (key '<subjectId>:<header>') e 2 linhas na outbox com topic portal.request.changed, payload.tenantId = tenant", async () => {
    const prata = identityOf('prata');
    const createKey = `it-${randomUUID()}`;
    const submitKey = `it-${randomUUID()}`;

    const created = await inTenantTx(async (tx) => {
      const service = buildService(tx);
      return unwrap<{ requestId: string; state: string; version: number }>(
        await service.create(
          tx as never,
          prata as never,
          {
            serviceKey: 'consulta_multas',
            targetKind: 'none',
            channel: 'portal',
          } as never,
          { 'idempotency-key': createKey } as never,
        ),
      );
    });
    createdRequestIds.push(created.requestId);
    expect(created).toMatchObject({
      state: 'PEDIDO_EM_COMPOSICAO',
      version: 1,
    });

    await inTenantTx(async (tx) => {
      const service = buildService(tx);
      return service.updateDraft(
        tx as never,
        prata as never,
        created.requestId,
        {} as never,
        { 'if-match': '"1"', 'idempotency-key': `it-${randomUUID()}` } as never,
      );
    });

    const submitted = await inTenantTx(async (tx) => {
      const service = buildService(tx);
      return unwrap<{ state: string; protocol: { number: string } }>(
        await service.submit(
          tx as never,
          prata as never,
          created.requestId,
          { signature: { method: 'govbr', signatureRef: 'ref' } } as never,
          { 'idempotency-key': submitKey } as never,
        ),
      );
    });
    expect(submitted.state).toBe('AVALIACAO_OFERECIDA');
    expect(submitted.protocol.number).toMatch(/^AM-FIXTURES-2026-\d{7}$/);

    await asOwner(async () => {
      const request = await client.query(
        `select * from portal.request where id = $1`,
        [created.requestId],
      );
      expect(request.rows[0]).toMatchObject({
        tenant_id: TENANT_ID,
        subject_id: SUBJECTS.prata.id,
        service_key: 'consulta_multas',
        state: 'AVALIACAO_OFERECIDA',
        delegation_status: 'not_applicable',
      });
      const drafts = await client.query<{ version: number }>(
        `select version from portal.request_draft where request_id = $1 order by version`,
        [created.requestId],
      );
      expect(drafts.rows.map((row) => row.version)).toEqual([1, 2]);
      const protocol = await client.query(
        `select number, channel, receipt_hash from portal.protocol where request_id = $1`,
        [created.requestId],
      );
      expect(protocol.rows[0]).toMatchObject({
        number: submitted.protocol.number,
        channel: 'portal',
      });
      const records = await client.query<{
        key: string;
        route: string;
        status: number;
      }>(
        `select key, route, status from portal.idempotency_record where tenant_id = $1 and key in ($2, $3) order by created_at`,
        [
          TENANT_ID,
          `${SUBJECTS.prata.id}:${createKey}`,
          `${SUBJECTS.prata.id}:${submitKey}`,
        ],
      );
      expect(records.rows.map((row) => row.key)).toEqual([
        `${SUBJECTS.prata.id}:${createKey}`,
        `${SUBJECTS.prata.id}:${submitKey}`,
      ]);
      expect(records.rows.map((row) => row.status)).toEqual([201, 200]);
      const events = await client.query<{
        topic: string;
        payload: {
          domainEvent: string;
          tenantId: string;
          data: Record<string, unknown>;
        };
      }>(
        `select topic, payload from integration.outbox where tenant_id = $1 and aggregate_id = $2 order by created_at, id`,
        [TENANT_ID, created.requestId],
      );
      expect(events.rows).toHaveLength(2);
      expect(
        events.rows.every((row) => row.topic === TOPICS.requestChanged),
      ).toBe(true);
      expect(events.rows.map((row) => row.payload.domainEvent)).toEqual([
        'SOLICITACAO_CRIADA',
        'SOLICITACAO_PROTOCOLADA',
      ]);
      expect(
        events.rows.every((row) => row.payload.tenantId === TENANT_ID),
      ).toBe(true);
      expect(events.rows[1]!.payload.data).toMatchObject({
        protocolNumber: submitted.protocol.number,
        toState: 'PROTOCOLADO',
      });
    });
  });

  it('C-0002-32 — dado transação que lança após publicar então nenhuma linha na outbox (rollback = sem evento)', async () => {
    const prata = identityOf('prata');
    let requestId = '';
    await expect(
      inTenantTx(async (tx) => {
        const service = buildService(tx);
        const created = unwrap<{ requestId: string }>(
          await service.create(
            tx as never,
            prata as never,
            {
              serviceKey: 'consulta_multas',
              targetKind: 'none',
              channel: 'portal',
            } as never,
            { 'idempotency-key': `it-${randomUUID()}` } as never,
          ),
        );
        requestId = created.requestId;
        const published = await tx.query(
          `select id from integration.outbox where aggregate_id = $1`,
          [requestId],
        );
        expect(published.rows).toHaveLength(1);
        throw new Error('falha simulada depois de publicar');
      }),
    ).rejects.toThrow('falha simulada depois de publicar');
    expect(requestId).not.toBe('');

    await asOwner(async () => {
      const events = await client.query(
        `select id from integration.outbox where tenant_id = $1 and aggregate_id = $2`,
        [TENANT_ID, requestId],
      );
      expect(events.rows).toHaveLength(0);
      const request = await client.query(
        `select id from portal.request where id = $1`,
        [requestId],
      );
      expect(request.rows).toHaveLength(0);
    });
  });
});
