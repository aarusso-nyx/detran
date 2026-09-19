// R-0009 CTG-0002 §2.4, §6.1 e §13 (TASK-0006) — C-0002-38/39: ciência
// idempotente sobre as fixtures …70c00001 (sne, não lida) e …70c00002 (portal,
// lida) em transação REAL (`role_app_backend`, RLS do tenant canônico) e a
// listagem da caixa com filtros `kind`/`read`. Fica vermelho até TASK-0008
// criar `inbox.service.ts` (§14).
//
// Banco da rodada: `source work/rounds/R-0009/env-detran-r9.sh`. O `beforeAll`
// devolve a fixture …70c00001 ao estado do seed (read_on nulo, sem evidência,
// sem eventos) para a execução ser idempotente contra banco persistente
// (precedente: portal-identity.e2e.spec.ts C-0001-41).
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PortalIdentityService } from '@detran/portal-identity';
import { SqlTeatEventOutbox } from '@detran/shared';

import { constructInjectable } from '../../../requests/tests/support/nest-construct.js';
import {
  FIXED_NOW,
  SUBJECTS,
  TENANT_ID,
  TOPICS,
  fakeDatabase,
  fakeRequestContext,
  fixedClock,
} from '../../../requests/tests/support/portal-fixtures.js';
import { PortalInboxService } from '../../src/handwritten/inbox.service.js';

const { Client } = pg;
const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const client = new Client({ connectionString });
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const SNE_UNREAD = '00000000-0000-7000-8000-000070c00001';
const PORTAL_READ = '00000000-0000-7000-8000-000070c00002';

interface SqlTx {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

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

async function resetFixture(): Promise<void> {
  await asOwner(async () => {
    await client.query(
      `delete from portal.acknowledgement_evidence where tenant_id = $1 and inbox_item_id = $2`,
      [TENANT_ID, SNE_UNREAD],
    );
    await client.query(
      `delete from integration.outbox where tenant_id = $1 and aggregate_id in ($2, $3)`,
      [TENANT_ID, SNE_UNREAD, PORTAL_READ],
    );
    await client.query(
      `update portal.inbox_item set read_on = null, updated_at = null where tenant_id = $1 and id = $2`,
      [TENANT_ID, SNE_UNREAD],
    );
    await client.query(
      `update portal.inbox_item set read_on = '2026-09-11' where tenant_id = $1 and id = $2`,
      [TENANT_ID, PORTAL_READ],
    );
  });
}

function service(tx: SqlTx) {
  const outbox = new SqlTeatEventOutbox();
  return constructInjectable(PortalInboxService, {
    PortalIdentityService: new PortalIdentityService(fixedClock as never),
    PortalClock: fixedClock,
    Database: fakeDatabase(tx),
    RequestContext: fakeRequestContext(),
    SqlTeatEventOutbox: outbox,
    TEAT_EVENT_OUTBOX: outbox,
  }) as unknown as {
    read: (
      tx: unknown,
      subject: unknown,
      id: string,
    ) => Promise<Record<string, unknown>>;
    list: (
      tx: unknown,
      subject: unknown,
      query: Record<string, string>,
    ) => Promise<{ items: Array<Record<string, unknown>>; total: number }>;
  };
}

const prata = {
  subjectId: SUBJECTS.prata.id,
  name: null,
  observedAt: FIXED_NOW,
  version: 1,
};

beforeAll(async () => {
  await client.connect();
  await resetFixture();
});

afterAll(async () => {
  await resetFixture();
  await client.end();
});

describe('CTG-0002 §6.1 — ciência idempotente sobre as fixtures (C-0002-38)', () => {
  it('C-0002-38 — dado fixture …70c00001 (sne, não lido) quando read duas vezes então 1 acknowledgement_evidence e 1 linha de outbox por type; dado …70c00002 (já lido) quando read então nenhuma escrita', async () => {
    const first = await inTenantTx((tx) =>
      service(tx).read(tx, prata, SNE_UNREAD),
    );
    const second = await inTenantTx((tx) =>
      service(tx).read(tx, prata, SNE_UNREAD),
    );
    expect(first).toMatchObject({ id: SNE_UNREAD, readOn: '2026-09-14' });
    expect(first.acknowledgementEvidence).toBeTruthy();
    expect(second).toEqual(first);

    await asOwner(async () => {
      const evidence = await client.query(
        `select displayed_sha256 from portal.acknowledgement_evidence where tenant_id = $1 and inbox_item_id = $2`,
        [TENANT_ID, SNE_UNREAD],
      );
      expect(evidence.rows).toHaveLength(1);
      expect(String(evidence.rows[0]!.displayed_sha256)).toMatch(
        /^[0-9a-f]{64}$/,
      );
      const events = await client.query<{ topic: string; count: string }>(
        `select topic, count(*)::text as count from integration.outbox where tenant_id = $1 and aggregate_id = $2 group by topic order by topic`,
        [TENANT_ID, SNE_UNREAD],
      );
      expect(events.rows).toEqual([
        { topic: TOPICS.inboxRead, count: '1' },
        { topic: TOPICS.notificationAcknowledged, count: '1' },
      ]);
      const item = await client.query<{ read_on: Date }>(
        `select read_on from portal.inbox_item where id = $1`,
        [SNE_UNREAD],
      );
      expect(item.rows[0]!.read_on).not.toBeNull();
    });

    const before = await asOwner(() =>
      client.query<{ updated_at: Date | null; read_on: Date }>(
        `select updated_at, read_on from portal.inbox_item where id = $1`,
        [PORTAL_READ],
      ),
    );
    const alreadyRead = await inTenantTx((tx) =>
      service(tx).read(tx, prata, PORTAL_READ),
    );
    expect(alreadyRead).toMatchObject({
      id: PORTAL_READ,
      readOn: '2026-09-11',
      acknowledgementEvidence: null,
    });
    await asOwner(async () => {
      const after = await client.query<{
        updated_at: Date | null;
        read_on: Date;
      }>(`select updated_at, read_on from portal.inbox_item where id = $1`, [
        PORTAL_READ,
      ]);
      expect(after.rows[0]).toEqual(before.rows[0]);
      const events = await client.query(
        `select id from integration.outbox where tenant_id = $1 and aggregate_id = $2`,
        [TENANT_ID, PORTAL_READ],
      );
      expect(events.rows).toHaveLength(0);
      const evidence = await client.query(
        `select id from portal.acknowledgement_evidence where tenant_id = $1 and inbox_item_id = $2`,
        [TENANT_ID, PORTAL_READ],
      );
      expect(evidence.rows).toHaveLength(0);
    });
  });
});

describe('CTG-0002 §2.4 — GET inbox: filtros kind/read (C-0002-39)', () => {
  it("C-0002-39 — dado fixtures da caixa quando list(kind: 'acao_necessaria') então só …70c00001; list(read: 'true') então só …70c00002; kind inválido então 400 ENUM_INVALID { field: 'kind' }", async () => {
    await resetFixture();
    const actionRequired = await inTenantTx((tx) =>
      service(tx).list(tx, prata, { kind: 'acao_necessaria' }),
    );
    expect(actionRequired.items.map((item) => item.id)).toEqual([SNE_UNREAD]);
    expect(actionRequired.total).toBe(1);
    expect(actionRequired.items[0]).toMatchObject({
      kind: 'acao_necessaria',
      category: 'SNE',
      source: 'sne',
      availableOn: '2026-09-01',
      readOn: null,
      fictitiousAcknowledgementOn: '2026-10-01',
      deadline: { dueOn: '2026-10-01', ownedBy: 'citizen' },
    });

    const read = await inTenantTx((tx) =>
      service(tx).list(tx, prata, { read: 'true' }),
    );
    expect(read.items.map((item) => item.id)).toEqual([PORTAL_READ]);
    expect(read.items[0]).toMatchObject({
      kind: 'informativo',
      category: 'PROCESSO',
      source: 'portal',
      readOn: '2026-09-11',
      fictitiousAcknowledgementOn: null,
      deadline: null,
    });

    const all = await inTenantTx((tx) => service(tx).list(tx, prata, {}));
    // ordem available_on desc: …70c00002 (2026-09-10) antes de …70c00001 (2026-09-01)
    expect(all.items.map((item) => item.id)).toEqual([PORTAL_READ, SNE_UNREAD]);

    await expect(
      inTenantTx((tx) => service(tx).list(tx, prata, { kind: 'xyz' })),
    ).rejects.toMatchObject({
      code: 'PORTAL.ENUM_INVALID',
      status: 400,
      context: { field: 'kind', allowed: ['acao_necessaria', 'informativo'] },
    });
    await expect(
      inTenantTx((tx) => service(tx).list(tx, prata, { read: 'maybe' })),
    ).rejects.toMatchObject({
      code: 'PORTAL.ENUM_INVALID',
      status: 400,
      context: { field: 'read' },
    });
  });
});
