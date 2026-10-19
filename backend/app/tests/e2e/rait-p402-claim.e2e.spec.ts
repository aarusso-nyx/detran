// Article7 Inspector. Real HTTP / PolicyGuard / request-role SQL; no snapshot/auth/claim mock.
import * as CasePublic from '@detran/inf-rait-case';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  describe,
  it,
  expect,
} from 'vitest';
import {
  RaitP402ClaimFixture,
  canonicalBytes,
  PREFIX,
  RAIT_TENANT,
} from '../shared/rait-p402-claim.fixture.js';

let app: INestApplication;
let fixture: RaitP402ClaimFixture;
// Module loading is outside lifecycle hooks, as with static Nest imports; no timeout increase.
process.env.DETRAN_LOCAL_TENANT_ID = RAIT_TENANT;
const originalRateLimit = process.env.STYNX_RATE_LIMIT_DEFAULT;
let rateRestored = false;
const restoreRateLimit = () => {
  if (rateRestored) return;
  rateRestored = true;
  if (originalRateLimit === undefined)
    delete process.env.STYNX_RATE_LIMIT_DEFAULT;
  else process.env.STYNX_RATE_LIMIT_DEFAULT = originalRateLimit;
};
// S2-R4: fixture capacity only; actual PostgreSQL limiter/guards remain mounted.
process.env.STYNX_RATE_LIMIT_DEFAULT = '10000';
const { AppModule } = await import('../../src/app.module.js').catch((error) => {
  restoreRateLimit();
  throw error;
});
beforeAll(async () => {
  try {
    const builder = Test.createTestingModule({
      imports: [AppModule.forRoot()],
    });
    const port = (CasePublic as unknown as Record<string, unknown>)
      .RAIT_RISK_PROVENANCE_READER;
    // Missing interface remains an explicit prerequisite failure; no snapshot/auth/claim substitute.
    if (typeof port === 'symbol')
      builder.overrideProvider(port).useValue({
        qualify: (
          tx: Parameters<RaitP402ClaimFixture['qualify']>[0],
          req: Parameters<RaitP402ClaimFixture['qualify']>[1],
        ) => fixture.qualify(tx, req),
      });
    const module = await builder.compile();
    app = module.createNestApplication({ logger: false });
    await app.init();
  } catch (error) {
    try {
      await app?.close();
    } finally {
      restoreRateLimit();
    }
    throw error;
  }
});
beforeEach(async () => {
  fixture = new RaitP402ClaimFixture();
  await fixture.connect();
});
afterEach(async () => {
  const state = expect.getState();
  process.stdout.write(
    'S2_ASSERTIONS ' +
      JSON.stringify({
        test: state.currentTestName,
        executedAssertions: state.assertionCalls,
      }) +
      '\n',
  );
  await fixture?.close();
});
afterAll(async () => {
  try {
    await app?.close();
  } finally {
    restoreRateLimit();
  }
});

const claim = (
  key?: string,
  match?: string,
  body: Record<string, unknown> = {},
) =>
  request(app.getHttpServer())
    .post(`${PREFIX}/pools/${fixture.pool}/claim-next`)
    .set(fixture.headers('rait-analyst', fixture.actor, key, match))
    .send(body);

describe('S2 existing real claim behavior counterexamples, before new service/schema prerequisites', () => {
  for (const match of ['"1"', 'not-a-validator', '*'])
    it(`supplied If-Match ${match} returns400 without effects`, async () => {
      await fixture.syntheticLegacy();
      const before = await fixture.effects();
      const r = await claim(undefined, match);
      expect.soft(r.status, JSON.stringify(r.body)).toBe(400);
      expect.soft(r.body.code).toBe('RAIT.VALIDATION_FAILED');
      expect.soft(await fixture.effects()).toEqual(before);
    });
  for (const field of ['caseId', 'actor', 'tenant_id', 'role', 'purpose'])
    it(`caller ${field} cannot select/grant a claim`, async () => {
      await fixture.syntheticLegacy();
      const before = await fixture.effects();
      const r = await claim(undefined, undefined, { [field]: fixture.actor });
      expect
        .soft(r.status, JSON.stringify(r.body))
        .toBe(field === 'caseId' ? 403 : 400);
      if (field === 'caseId')
        expect.soft(r.body.code).toBe('RAIT.ORDER_OVERRIDE_FORBIDDEN');
      expect.soft(await fixture.effects()).toEqual(before);
    });
  it('new HTTP-admitted work with unqualified risk fails503 before old QUEUE_EMPTY fallback', async () => {
    await fixture.admitted(app);
    const before = await fixture.effects();
    const r = await claim();
    expect.soft(r.status, JSON.stringify(r.body)).toBe(503);
    expect.soft(r.body.code).toBe('RAIT.RISK_SOURCE_UNAVAILABLE');
    expect.soft(await fixture.effects()).toEqual(before);
  });
  it('unqualified in-scope legacy is409 and cannot be silently claimed', async () => {
    await fixture.syntheticLegacy();
    const before = await fixture.effects();
    const r = await claim();
    expect.soft(r.status, JSON.stringify(r.body)).toBe(409);
    expect.soft(r.body.code).toBe('RAIT.CLAIM_LEGACY_UNVERIFIED');
    expect.soft(await fixture.effects()).toEqual(before);
  });
});

describe('S2 actual mounted discovery/risk transport and read-only guarantees', () => {
  for (const query of [
    { limit: 0 },
    { limit: 51 },
    { limit: 1.5 },
    { pool_id: 'not-a-uuid' },
    { actor: 'forged' },
    { purpose: 'merits' },
    { tenant_id: 'forged' },
    { queue_cursor: 'not-a-valid-cursor' },
  ])
    it(`rejects malformed/authority-bearing discovery input ${JSON.stringify(query)}`, async () => {
      const before = await fixture.effects();
      const r = await request(app.getHttpServer())
        .get(`${PREFIX}/claim-context`)
        .query(query)
        .set(fixture.headers());
      expect(r.status, JSON.stringify(r.body)).toBe(400);
      expect(r.body.code).toBe('RAIT.VALIDATION_FAILED');
      expect(await fixture.effects()).toEqual(before);
    });

  for (const role of [
    'rait-coordinator',
    'AUDITOR',
    'rait-secretary',
    'technical-admin',
  ])
    it(`${role} cannot borrow read authority for claim-context`, async () => {
      const before = await fixture.effects();
      const r = await request(app.getHttpServer())
        .get(`${PREFIX}/claim-context`)
        .set(fixture.headers(role));
      expect(r.status, JSON.stringify(r.body)).toBe(403);
      expect(await fixture.effects()).toEqual(before);
    });
  it('zero eligible pools has exact count0 and empty typed pages', async () => {
    await fixture.owner.query(
      "update inf.rait_pool_member set status='ADVERTIDO' where id=$1",
      [fixture.member],
    );
    const before = await fixture.effects();
    const r = await request(app.getHttpServer())
      .get(`${PREFIX}/claim-context`)
      .set(fixture.headers());
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    expect(r.body.data).toMatchObject({
      eligiblePoolCount: 0,
      selection: 'none',
      selectedPoolId: null,
      pools: { items: [], nextCursor: null },
      queue: { items: [], nextCursor: null },
    });
    expect(await fixture.effects()).toEqual(before);
  });
  it('one empty eligible pool is selected from complete set and GET writes nothing', async () => {
    const before = await fixture.effects();
    const r = await request(app.getHttpServer())
      .get(`${PREFIX}/claim-context`)
      .set(fixture.headers());
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    expect(r.body.data).toMatchObject({
      eligiblePoolCount: 1,
      selection: 'single',
      selectedPoolId: fixture.pool,
      queue: { items: [], nextCursor: null },
    });
    expect(r.body.data.pools.items).toEqual([
      {
        id: fixture.pool,
        name: 'S2 isolated defense',
        instance: 'defesa_previa',
        unit_id: fixture.unit,
      },
    ]);
    expect(await fixture.effects()).toEqual(before);
  });
  it('unresolved legacy blocks selected-pool GET409 without a degraded queue', async () => {
    await fixture.syntheticLegacy();
    const before = await fixture.effects();
    const r = await request(app.getHttpServer())
      .get(`${PREFIX}/claim-context`)
      .query({ pool_id: fixture.pool, limit: 1 })
      .set(fixture.headers());
    expect(r.status, JSON.stringify(r.body)).toBe(409);
    expect(r.body.code).toBe('RAIT.CLAIM_LEGACY_UNVERIFIED');
    expect(r.body).not.toHaveProperty('data');
    expect(await fixture.effects()).toEqual(before);
  });
  it('scoped risk for admitted case with absent qualified sources returns503', async () => {
    const c = await fixture.admitted(app);
    const before = await fixture.effects();
    const r = await request(app.getHttpServer())
      .get(`${PREFIX}/cases/${c.id}/risk`)
      .set(fixture.riskHeaders());
    expect(r.status, JSON.stringify(r.body)).toBe(503);
    expect(r.body.code).toBe('RAIT.RISK_SOURCE_UNAVAILABLE');
    expect(await fixture.effects()).toEqual(before);
  });
  it('unknown risk case and unauthorized case share404 without payload', async () => {
    const c = await fixture.admitted(app);
    const authorized = await request(app.getHttpServer())
      .get(`${PREFIX}/cases/${c.id}/risk`)
      .set(fixture.riskHeaders());
    expect(authorized.status, JSON.stringify(authorized.body)).toBe(503);
    expect(authorized.body.code).toBe('RAIT.RISK_SOURCE_UNAVAILABLE');
    await fixture.owner.query(
      'update inf.rait_case_read_scope set active=false where actor_id=$1 and unit_id=$2',
      [fixture.reader, fixture.unit],
    );
    const before = await fixture.effects();
    for (const id of [c.id, '71000000-0000-7000-8000-999999999999']) {
      const r = await request(app.getHttpServer())
        .get(`${PREFIX}/cases/${id}/risk`)
        .set(fixture.riskHeaders());
      expect(r.status, JSON.stringify(r.body)).toBe(404);
      expect(r.body).not.toHaveProperty('data');
    }
    expect(await fixture.effects()).toEqual(before);
  });
});

function opaqueVersions(value: unknown): string[] {
  if (typeof value === 'string')
    return /^rrv1:[a-f0-9]{64}$/.test(value) ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(opaqueVersions);
  if (value && typeof value === 'object')
    return Object.values(value).flatMap(opaqueVersions);
  return [];
}
async function exactClaimPersistence(
  caseId: string,
  events: Record<string, unknown>[],
) {
  const audit = await fixture.owner.query(
    "select actor_id,actor_role,details from audit.events where tenant_id=$1 and entity_id=$2 and action='INF_RAIT_CASE_CLAIM_NEXT'",
    [RAIT_TENANT, caseId],
  );
  expect(audit.rows).toHaveLength(1);
  expect(audit.rows[0]).toMatchObject({
    actor_id: fixture.actor,
    actor_role: 'rait-analyst',
  });
  expect([...new Set(opaqueVersions(audit.rows[0]!.details))].sort()).toEqual(
    [...fixture.qualifiedVersions].sort(),
  );
  const outbox = await fixture.owner.query<{
    topic: string;
    payload: Record<string, unknown>;
    idempotency_key: string;
  }>(
    'select topic,payload,idempotency_key from integration.outbox where tenant_id=$1 and aggregate_id=$2 and topic=any($3::text[])',
    [RAIT_TENANT, caseId, ['rait.case.changed', 'rait.assignment.changed']],
  );
  // Existing admission events predate the command; select the exact claim payloads by their source states/assignment identity.
  const records = outbox.rows.filter(
    (row) =>
      row.topic === 'rait.assignment.changed' ||
      (row.payload.fromState === 'ADMITIDO' &&
        row.payload.toState === 'DISTRIBUIDO') ||
      (row.payload.fromState === 'DISTRIBUIDO' &&
        row.payload.toState === 'EM_INSTRUCAO'),
  );
  expect(records).toHaveLength(events.length);
  const ordered = (items: Record<string, unknown>[]) =>
    [...items].sort((a, b) =>
      canonicalBytes(a) < canonicalBytes(b)
        ? -1
        : canonicalBytes(a) > canonicalBytes(b)
          ? 1
          : 0,
    );
  expect(ordered(records.map((row) => row.payload))).toEqual(ordered(events));
  expect(records.every((row) => row.topic === row.payload.type)).toBe(true);
  expect(new Set(records.map((row) => row.idempotency_key)).size).toBe(
    events.length,
  );
  const flags = await fixture.owner.query(
    `select count(*)::int n from integration.outbox where tenant_id=$1 and topic='rait.clock.flag-changed' and (aggregate_id=$2 or aggregate_id in(select id::text from inf.rait_clock where case_id=$2) or payload->>'caseId'=$2 or payload->>'clockId' in(select id::text from inf.rait_clock where case_id=$2))`,
    [RAIT_TENANT, caseId],
  );
  expect(flags.rows[0]!.n).toBe(0);
}

describe('S2 actual SQL factory with independently admitted synthetic provenance only', () => {
  it('mounts the public narrow provenance port while retaining the actual SQL factory', () => {
    expect(
      typeof (CasePublic as unknown as Record<string, unknown>)
        .RAIT_RISK_PROVENANCE_READER,
    ).toBe('symbol');
    expect(
      typeof (CasePublic as unknown as Record<string, unknown>)
        .RAIT_RISK_SNAPSHOT_FACTORY,
    ).toBe('symbol');
  });
  it('qualified new HTTP admission claims exactly two state versions and a real assignment', async () => {
    const c = await fixture.admitted(app);
    await fixture.prepareRisk(c.id);
    const before = await fixture.effects();
    const observation = await fixture.observeStages(c.id);
    try {
      const r = await claim();
      expect(r.status, JSON.stringify(r.body)).toBe(200);
      expect(r.body.data).toMatchObject({
        id: c.id,
        state: 'EM_INSTRUCAO',
        version: c.version + 2,
        instance: 'defesa_previa',
      });
      expect(r.headers.etag).toBe('"' + (c.version + 2) + '"');
      expect(r.body.data.assignment_id).toMatch(/^[0-9a-f-]{36}$/);
      const after = await fixture.effects();
      expect(after.history - before.history).toBe(2);
      expect(after.assignments).toHaveLength(1);
      expect(after.assignments[0]).toMatchObject({
        id: r.body.data.assignment_id,
        case_id: c.id,
        member_id: fixture.member,
        active: true,
      });
      const stages = await fixture.owner.query(
        'select from_state,to_state from inf.rait_case_event where case_id=$1 order by occurred_at desc,id desc limit 2',
        [c.id],
      );
      expect(
        stages.rows.sort((a, b) =>
          a.from_state < b.from_state
            ? -1
            : a.from_state > b.from_state
              ? 1
              : 0,
        ),
      ).toEqual([
        { from_state: 'ADMITIDO', to_state: 'DISTRIBUIDO' },
        { from_state: 'DISTRIBUIDO', to_state: 'EM_INSTRUCAO' },
      ]);
      expect(after.outbox - before.outbox).toBe(3);
      expect(after.ledger - before.ledger).toBe(1);
      expect(after.clocks).toEqual(before.clocks);
      expect(after.alerts).toBe(before.alerts);
      expect(fixture.provenanceChecks).toBeGreaterThan(0);
      expect(await observation.read(2)).toEqual([
        { from: 'ADMITIDO', state: 'DISTRIBUIDO', version: c.version + 1 },
        { from: 'DISTRIBUIDO', state: 'EM_INSTRUCAO', version: c.version + 2 },
      ]);
      expect(r.body.events).toEqual([
        {
          type: 'rait.case.changed',
          aggregateId: c.id,
          caseId: c.id,
          fromState: 'ADMITIDO',
          toState: 'DISTRIBUIDO',
          instance: 'defesa_previa',
        },
        {
          type: 'rait.assignment.changed',
          aggregateId: r.body.data.assignment_id,
          caseId: c.id,
          assignmentId: r.body.data.assignment_id,
          poolId: fixture.pool,
          active: true,
        },
        {
          type: 'rait.case.changed',
          aggregateId: c.id,
          caseId: c.id,
          fromState: 'DISTRIBUIDO',
          toState: 'EM_INSTRUCAO',
          instance: 'defesa_previa',
        },
      ]);
      expect(after.audit - before.audit).toBe(1);
      await exactClaimPersistence(c.id, r.body.events);
    } finally {
      await observation.close();
    }
  });
  it('qualified historical admission/distribution advances exactly one version', async () => {
    const c = await fixture.admitted(app);
    const disposition = await fixture.historicallyDistributed(c.id);
    await fixture.prepareRisk(c.id);
    await fixture.qualifyLegacy(c.id, disposition);
    const before = await fixture.effects();
    const observation = await fixture.observeStages(c.id);
    try {
      const r = await claim();
      expect(r.status, JSON.stringify(r.body)).toBe(200);
      expect(r.body.data).toMatchObject({
        id: c.id,
        state: 'EM_INSTRUCAO',
        version: c.version + 2,
      });
      expect(r.headers.etag).toBe('"' + (c.version + 2) + '"');
      const after = await fixture.effects();
      expect(after.history - before.history).toBe(1);
      expect(after.outbox - before.outbox).toBe(2);
      expect(after.assignments).toHaveLength(1);
      expect(after.clocks).toEqual(before.clocks);
      expect(after.alerts).toBe(before.alerts);
      expect(await observation.read(1)).toEqual([
        { from: 'DISTRIBUIDO', state: 'EM_INSTRUCAO', version: c.version + 2 },
      ]);
      expect(r.body.events).toEqual([
        {
          type: 'rait.assignment.changed',
          aggregateId: r.body.data.assignment_id,
          caseId: c.id,
          assignmentId: r.body.data.assignment_id,
          poolId: fixture.pool,
          active: true,
        },
        {
          type: 'rait.case.changed',
          aggregateId: c.id,
          caseId: c.id,
          fromState: 'DISTRIBUIDO',
          toState: 'EM_INSTRUCAO',
          instance: 'defesa_previa',
        },
      ]);
      expect(after.audit - before.audit).toBe(1);
      await exactClaimPersistence(c.id, r.body.events);
    } finally {
      await observation.close();
    }
  });
  for (const missing of [
    'A',
    'C',
    'D',
    'track',
    'movement',
    'interruption',
    'applicability',
    'parameter',
  ])
    it(`missing independent ${missing} proof is503 despite otherwise complete actual rows`, async () => {
      const c = await fixture.admitted(app);
      const sources = await fixture.prepareRisk(c.id);
      const control = await request(app.getHttpServer())
        .get(`${PREFIX}/cases/${c.id}/risk`)
        .set(fixture.riskHeaders());
      expect(control.status, JSON.stringify(control.body)).toBe(200);
      for (const receipt of fixture.receipts)
        if (
          receipt.core.kind === missing ||
          (['A', 'C', 'D'].includes(missing) &&
            receipt.core.kind === 'timer' &&
            receipt.core.bindings.some(
              (b) =>
                b.sourceRef ===
                'sql:inf.rait_clock:' + sources.records.get(missing)!.clock,
            ))
        )
          fixture.revokedReceipts.add(receipt.digest);
      const before = await fixture.effects();
      const r = await claim();
      expect(r.status, JSON.stringify(r.body)).toBe(503);
      expect(r.body.code).toBe('RAIT.RISK_SOURCE_UNAVAILABLE');
      expect(r.body.context ?? {}).toEqual({});
      expect(await fixture.effects()).toEqual(before);
    });
  it('qualified ORIGINAL D requires independently verified complete original history, never absence inference', async () => {
    const c = await fixture.admitted(app);
    await fixture.prepareRisk(c.id, 360, { originalMissing: true });
    const before = await fixture.effects();
    const r = await claim();
    expect(r.status, JSON.stringify(r.body)).toBe(503);
    expect(r.body.code).toBe('RAIT.RISK_SOURCE_UNAVAILABLE');
    expect(await fixture.effects()).toEqual(before);
  });
  for (const field of ['raw_due_on', 'due_on'])
    it(`trusted receipt cannot authorize a shifted canonical ${field}`, async () => {
      const c = await fixture.admitted(app);
      const source = await fixture.prepareRisk(c.id);
      const a = source.records.get('A')!;
      const control = await request(app.getHttpServer())
        .get(`${PREFIX}/cases/${c.id}/risk`)
        .set(fixture.riskHeaders());
      expect(control.status, JSON.stringify(control.body)).toBe(200);
      await fixture.owner.query(
        `update inf.infraction_timer set ${field}=${field}+1 where id=$1`,
        [a.timer],
      );
      if (field === 'due_on')
        await fixture.owner.query(
          'update inf.rait_clock set ceiling_on=ceiling_on+1 where id=$1',
          [a.clock],
        );
      // Re-admit actual adjusted rows independently: failure must be date qualification, not stale digest.
      const rebound = new Map<string, string>();
      for (const receipt of [...fixture.receipts]) {
        fixture.revokedReceipts.add(receipt.digest);
        const fresh = await fixture.admitReceipt(
          receipt.core.kind,
          receipt.core.caseId,
          receipt.core.bindings.map((b) => b.sourceRef),
          receipt.core.dependencies.map((d) => {
            const next = rebound.get(d);
            if (!next) throw Error('Unrebound fixture dependency');
            return next;
          }),
          receipt.core.policySources,
        );
        rebound.set(receipt.digest, fresh.digest);
      }
      const before = await fixture.effects();
      const r = await claim();
      expect(r.status, JSON.stringify(r.body)).toBe(503);
      expect(r.body.code).toBe('RAIT.RISK_SOURCE_UNAVAILABLE');
      expect(await fixture.effects()).toEqual(before);
    });
  it('consumed SQL source mutation invalidates pre-admitted receipt rather than echoing request digest', async () => {
    const c = await fixture.admitted(app);
    const source = await fixture.prepareRisk(c.id);
    await fixture.owner.query(
      'update inf.infraction_timer set legal_basis=legal_basis||$2 where id=$1',
      [source.records.get('A')!.timer, ' changed'],
    );
    const before = await fixture.effects();
    const r = await claim();
    expect(r.status, JSON.stringify(r.body)).toBe(503);
    expect(r.body.code).toBe('RAIT.RISK_SOURCE_UNAVAILABLE');
    expect(await fixture.effects()).toEqual(before);
  });
  it('a qualified read does not alter flags, clocks, history, ledger or outbox', async () => {
    const c = await fixture.admitted(app);
    await fixture.prepareRisk(c.id);
    const before = await fixture.effects();
    const r = await request(app.getHttpServer())
      .get(`${PREFIX}/cases/${c.id}/risk`)
      .set(fixture.riskHeaders());
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    expect(r.body.data.clocks).toHaveLength(4);
    expect(r.body.data.sourceVersions.length).toBeGreaterThan(0);
    expect(fixture.provenanceChecks).toBeGreaterThan(0);
    expect(await fixture.effects()).toEqual(before);
  });
  it('same actor exact retry returns original typed result without any additional effects', async () => {
    const c = await fixture.admitted(app);
    await fixture.prepareRisk(c.id);
    const key = randomUUID();
    const first = await claim(key);
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    const before = await fixture.effects();
    const second = await claim(key);
    expect(second.status, JSON.stringify(second.body)).toBe(200);
    expect(second.body.data).toEqual(first.body.data);
    expect(second.headers.etag).toBe(first.headers.etag);
    expect(await fixture.effects()).toEqual(before);
  });
  it('replay still denies revoked current membership without replay effects', async () => {
    const c = await fixture.admitted(app);
    await fixture.prepareRisk(c.id);
    const key = randomUUID();
    const first = await claim(key);
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    await fixture.owner.query(
      "update inf.rait_pool_member set status='ADVERTIDO' where id=$1",
      [fixture.member],
    );
    const before = await fixture.effects();
    const replay = await claim(key);
    expect(replay.status, JSON.stringify(replay.body)).toBe(404);
    expect(replay.body).not.toHaveProperty('data');
    expect(await fixture.effects()).toEqual(before);
  });
  it('valid canonical actor change under the existing key conflicts409 without disclosing original result', async () => {
    const c = await fixture.admitted(app);
    await fixture.prepareRisk(c.id);
    const key = randomUUID();
    const first = await claim(key);
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    const before = await fixture.effects();
    const replay = await request(app.getHttpServer())
      .post(`${PREFIX}/pools/${fixture.pool}/claim-next`)
      .set(fixture.headers('rait-analyst', fixture.secondActor, key))
      .send({});
    expect(replay.status, JSON.stringify(replay.body)).toBe(409);
    expect(replay.body.code).toBe('RAIT.IDEMPOTENCY_REPLAY');
    expect(await fixture.effects()).toEqual(before);
  });
});

describe('S2 internal qualification has no public CRUD authority', () => {
  for (const method of ['get', 'post', 'patch', 'delete'] as const)
    it(`no ${method.toUpperCase()} internal qualification route`, async () => {
      // Real mounted route control prevents treating a wholly absent application as evidence.
      const control = await request(app.getHttpServer())
        .get(`${PREFIX}/claim-context`)
        .set(fixture.headers());
      expect(control.status, JSON.stringify(control.body)).toBe(200);
      expect(control.body.data.eligiblePoolCount).toBe(1);
      const before = await fixture.effects();
      const paths = [
        '/v1/inf/rait-claim-legacy-qualifications',
        '/v1/inf/rait/claim-legacy-qualifications',
      ];
      for (const path of paths) {
        const r = await request(app.getHttpServer())
          [method](path)
          .set(fixture.headers('rait-secretary'))
          .send({});
        expect(r.status).toBe(404);
        expect(r.body.message).toContain('Cannot');
      }
      expect(await fixture.effects()).toEqual(before);
    });
});

describe('S2 transaction rollback boundaries through actual HTTP', () => {
  for (const stage of [
    'distribution',
    'instruction',
    'assignment',
    'legalAudit',
    'outbox',
    'ledger',
  ] as const)
    it(`failure during ${stage} rolls back both case stages and all claim effects`, async () => {
      const c = await fixture.admitted(app);
      await fixture.prepareRisk(c.id);
      const before = await fixture.effects();
      const name = 's2_fail_' + randomUUID().replaceAll('-', '');
      const targets = {
        distribution: [
          'inf.rait_case_event',
          `NEW.case_id='${c.id}'::uuid AND NEW.to_state='DISTRIBUIDO'`,
        ],
        instruction: [
          'inf.rait_case_event',
          `NEW.case_id='${c.id}'::uuid AND NEW.to_state='EM_INSTRUCAO'`,
        ],
        assignment: ['inf.rait_assignment', `NEW.case_id='${c.id}'::uuid`],
        legalAudit: [
          'audit.events',
          `NEW.entity_id='${c.id}'::uuid AND NEW.action='INF_RAIT_CASE_CLAIM_NEXT'`,
        ],
        outbox: ['integration.outbox', `NEW.aggregate_id='${c.id}'`],
        ledger: [
          'integration.idempotency_keys',
          `NEW.tenant_id='${RAIT_TENANT}'::uuid`,
        ],
      } as const;
      const [table, predicate] = targets[stage];
      // Additive test-only trigger is scoped to this fixture; no existing constraint/trigger is disabled.
      await fixture.owner.query(`create sequence inf.${name}_seq`);
      await fixture.owner.query(
        `grant usage,select on sequence inf.${name}_seq to role_app_backend`,
      );
      await fixture.owner.query(
        `create function inf.${name}() returns trigger language plpgsql as $$ begin perform nextval('inf.${name}_seq'); raise exception 'S2_INSPECTOR_ROLLBACK'; end $$`,
      );
      try {
        await fixture.owner.query(
          `create trigger ${name} before insert on ${table} for each row when (${predicate}) execute function inf.${name}()`,
        );
        const r = await claim();
        expect(r.status, JSON.stringify(r.body)).toBe(500);
        const hit = await fixture.owner.query(
          `select last_value::int n,is_called from inf.${name}_seq`,
        );
        expect(hit.rows).toEqual([{ n: 1, is_called: true }]);
        expect(await fixture.effects()).toEqual(before);
      } finally {
        await fixture.owner.query(`drop trigger if exists ${name} on ${table}`);
        await fixture.owner.query(`drop function if exists inf.${name}()`);
        await fixture.owner.query(`drop sequence if exists inf.${name}_seq`);
      }
    });
});

describe('S2 source authority is independent of matching SQL content', () => {
  for (const mode of [
    'revoked',
    'foreignTenant',
    'unadmittedOrigin',
    'ambiguous',
  ] as const)
    it(`${mode} receipt cannot authorize a claim`, async () => {
      const c = await fixture.admitted(app);
      await fixture.prepareRisk(c.id);
      const timer = fixture.receipts.find((r) => r.core.kind === 'timer')!;
      if (mode === 'revoked') fixture.revokedReceipts.add(timer.digest);
      if (mode === 'foreignTenant') timer.core.tenantId = randomUUID();
      if (mode === 'unadmittedOrigin')
        (timer as unknown as { admittedOrigin: string }).admittedOrigin =
          'untrusted-request';
      if (mode === 'ambiguous')
        await fixture.admitReceipt(
          timer.core.kind,
          timer.core.caseId,
          timer.core.bindings.map((b) => b.sourceRef),
        );
      const before = await fixture.effects();
      const r = await claim();
      expect(r.status, JSON.stringify(r.body)).toBe(503);
      expect(r.body.code).toBe('RAIT.RISK_SOURCE_UNAVAILABLE');
      expect(await fixture.effects()).toEqual(before);
    });
});

async function waitForActualClaimLock() {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const observed = await fixture.owner.query<{ n: number }>(
      "select count(*)::int n from pg_stat_activity where datname=current_database() and pid<>pg_backend_pid() and wait_event_type='Lock' and query ilike '%rait_%'",
    );
    if (observed.rows[0]!.n > 0) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw Error(
    'PREREQUISITE_PENDING: real claim never reached the observed PostgreSQL lock; no race-protection claim',
  );
}

describe('S2 observed PostgreSQL contention, no clock or transaction adapter substitute', () => {
  it('two genuinely authenticated analysts cannot assign the same candidate twice', async () => {
    const c = await fixture.admitted(app);
    await fixture.prepareRisk(c.id);
    await fixture.owner.query('begin');
    let first: Promise<request.Response> | undefined,
      second: Promise<request.Response> | undefined;
    try {
      await fixture.owner.query(
        'select id from inf.rait_case where id=$1 for update',
        [c.id],
      );
      first = claim().then((r) => r);
      // First request has captured its real identity before changing local-profile identity.
      await waitForActualClaimLock();
      second = request(app.getHttpServer())
        .post(`${PREFIX}/pools/${fixture.pool}/claim-next`)
        .set(fixture.headers('rait-analyst', fixture.secondActor))
        .send({})
        .then((r) => r);
      await fixture.owner.query('commit');
      const results = await Promise.all([first, second]);
      expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
      const assignments = await fixture.owner.query(
        'select member_id from inf.rait_assignment where case_id=$1 and active',
        [c.id],
      );
      expect(assignments.rows).toHaveLength(1);
      expect([fixture.member, fixture.secondMember]).toContain(
        assignments.rows[0]!.member_id,
      );
      expect(
        results.filter((r) => r.status === 409)[0]!.body,
      ).not.toHaveProperty('data');
    } finally {
      await fixture.owner.query('rollback');
      await Promise.allSettled(
        [first, second].filter((p): p is Promise<request.Response> => !!p),
      );
    }
  });
  it('concurrent same-actor claims serialize WIP1 across two independently qualified cases', async () => {
    const a = await fixture.admitted(app),
      b = await fixture.admitted(app);
    await fixture.prepareRisk(a.id);
    await fixture.prepareRisk(b.id);
    await fixture.owner.query(
      'update inf.rait_schedule set wip_limit=1 where member_id=$1',
      [fixture.member],
    );
    await fixture.owner.query('begin');
    let first: Promise<request.Response> | undefined,
      second: Promise<request.Response> | undefined;
    try {
      await fixture.owner.query(
        'select id from inf.rait_pool_member where id=$1 for update',
        [fixture.member],
      );
      first = claim().then((r) => r);
      await waitForActualClaimLock();
      second = claim().then((r) => r);
      await fixture.owner.query('commit');
      const results = await Promise.all([first, second]);
      expect(results.map((r) => r.status).sort()).toEqual([200, 422]);
      const denied = results.find((r) => r.status === 422)!;
      expect(denied.body.code).toBe('RAIT.ASSIGNMENT_WIP_LIMIT');
      expect(denied.body).not.toHaveProperty('data');
      const assignments = await fixture.owner.query(
        'select case_id from inf.rait_assignment where member_id=$1 and active',
        [fixture.member],
      );
      expect(assignments.rows).toHaveLength(1);
      expect([a.id, b.id]).toContain(assignments.rows[0]!.case_id);
      const states = await fixture.owner.query(
        'select state from inf.rait_case where id=any($1::uuid[]) order by state',
        [[a.id, b.id]],
      );
      expect(states.rows.map((r) => r.state)).toEqual([
        'ADMITIDO',
        'EM_INSTRUCAO',
      ]);
    } finally {
      await fixture.owner.query('rollback');
      await Promise.allSettled(
        [first, second].filter((p): p is Promise<request.Response> => !!p),
      );
    }
  });
  it('membership revoked during real lock wait denies claim without side effects', async () => {
    const c = await fixture.admitted(app);
    await fixture.prepareRisk(c.id);
    await fixture.owner.query('begin');
    let pending: Promise<request.Response> | undefined;
    try {
      await fixture.owner.query(
        'select id from inf.rait_pool_member where id=$1 for update',
        [fixture.member],
      );
      pending = claim().then((r) => r);
      await waitForActualClaimLock();
      await fixture.owner.query(
        "update inf.rait_pool_member set status='ADVERTIDO' where id=$1",
        [fixture.member],
      );
      await fixture.owner.query('commit');
      const before = await fixture.effects();
      const r = await pending;
      expect(r.status, JSON.stringify(r.body)).toBe(404);
      expect(r.body).not.toHaveProperty('data');
      expect(await fixture.effects()).toEqual(before);
    } finally {
      await fixture.owner.query('rollback');
      await pending;
    }
  });
});

describe('S2 complete pool inventory precedes pagination', () => {
  // Real306 HTTP setup commands are independent preparation phases, each keeps the unchanged10s hook budget.
  beforeEach(async () => {
    if (expect.getState().currentTestName?.includes('incident blocker'))
      fixture.practiceOn = '2019-06-15';
    await fixture.prepareBatchSources(51);
  });
  for (let start = 0; start < 51; start += 17)
    beforeEach(async () => {
      await fixture.protocolBatch(app, start, start + 17);
    });
  for (const stage of [
    'triage',
    'legitimidade',
    'assinatura',
    'pedido_compativel',
    'admit',
  ])
    for (let start = 0; start < 51; start += 17)
      beforeEach(async () => {
        await fixture.transitionBatch(app, stage, start, start + 17);
      });
  for (let start = 0; start < 51; start += 6)
    beforeEach(async () => {
      for (const c of fixture.batchCases.slice(start, start + 6)) {
        const risk = await fixture.prepareRisk(c.id);
        if (expect.getState().currentTestName?.includes('incident blocker'))
          await fixture.operationalIncidents(c.id, risk.records);
      }
    });

  for (const missing of ['risk', 'legacy', 'routing', 'incident'] as const)
    it(`a ${missing} blocker beyond position50 blocks the whole pool`, async () => {
      const cases = fixture.batchCases;
      // First prove the exact complete qualified population, rather than observing an earlier unrelated failure.
      const control = await request(app.getHttpServer())
        .get(`${PREFIX}/claim-context`)
        .query({ pool_id: fixture.pool, limit: 50 })
        .set(fixture.headers());
      expect(control.status, JSON.stringify(control.body)).toBe(200);
      expect(control.body.data.queue.items).toHaveLength(50);
      expect(control.body.data.queue.nextCursor).toEqual(expect.any(String));
      const page = await request(app.getHttpServer())
        .get(`${PREFIX}/claim-context`)
        .query({
          pool_id: fixture.pool,
          limit: 50,
          queue_cursor: control.body.data.queue.nextCursor,
        })
        .set(fixture.headers());
      expect(page.status, JSON.stringify(page.body)).toBe(200);
      expect(page.body.data.queue.items).toHaveLength(1);
      const last = page.body.data.queue.items[0].id as string;
      expect(cases.map((c) => c.id)).toContain(last);
      if (missing === 'risk' || missing === 'incident')
        for (const receipt of fixture.receipts)
          if (
            receipt.core.caseId === last &&
            receipt.core.kind ===
              (missing === 'incident' ? 'incident' : 'timer')
          )
            fixture.revokedReceipts.add(receipt.digest);
      if (missing === 'legacy') await fixture.historicallyDistributed(last); // Actual history and disposition row, independently trusted legacy receipt intentionally absent.
      if (missing === 'routing')
        await fixture.owner.query(
          'update inf.rait_case_pool_scope set active=false,updated_at=clock_timestamp() where case_id=$1 and pool_id=$2',
          [last, fixture.pool],
        );
      const before = await fixture.effects();
      const discovery = await request(app.getHttpServer())
        .get(`${PREFIX}/claim-context`)
        .query({ pool_id: fixture.pool, limit: 1 })
        .set(fixture.headers());
      const claimed = await claim();
      for (const r of [discovery, claimed]) {
        expect(r.status, JSON.stringify(r.body)).toBe(
          missing === 'risk' || missing === 'incident' ? 503 : 409,
        );
        expect(r.body.code).toBe(
          missing === 'risk' || missing === 'incident'
            ? 'RAIT.RISK_SOURCE_UNAVAILABLE'
            : missing === 'legacy'
              ? 'RAIT.CLAIM_LEGACY_UNVERIFIED'
              : 'RAIT.CASE_POOL_UNRESOLVED',
        );
        expect(r.body).not.toHaveProperty('data');
        expect(r.body.context ?? {}).toEqual({});
      }
      expect(await fixture.effects()).toEqual(before);
    });
});

describe('S2 actual canonical date ownership and applicability', () => {
  for (const track of [180, 360] as const)
    it(`true ${track}-day source has explicit track proof, actual civil dates and defense B NA`, async () => {
      const c =
        track === 180
          ? await fixture.triaged(app)
          : await fixture.admitted(app);
      const source = await fixture.prepareRisk(c.id, track);
      const before = await fixture.effects();
      const r = await request(app.getHttpServer())
        .get(`${PREFIX}/cases/${c.id}/risk`)
        .set(
          track === 180
            ? fixture.riskHeaders('rait-analyst', fixture.actor)
            : fixture.riskHeaders(),
        );
      expect(r.status, JSON.stringify(r.body)).toBe(200);
      expect(r.body.data.clocks).toHaveLength(4);
      expect(
        r.body.data.clocks.map((v: { clockCode: string }) => v.clockCode),
      ).toEqual(['A', 'B', 'C', 'D']);
      expect(r.body.data.clocks[1]).toEqual({
        clockCode: 'B',
        applicability: 'not_applicable',
      });
      const timer = await fixture.owner.query<{ raw: string; due: string }>(
        'select raw_due_on::text raw,due_on::text due from inf.infraction_timer where id=$1',
        [source.records.get('A')!.timer],
      );
      const elapsed =
        (Date.parse(r.body.data.today) - Date.parse(fixture.practiceOn)) /
        86400000;
      const steps = track === 180 ? [90, 135, 162] : [180, 270, 324];
      const flag =
        elapsed >= track
          ? 'PRESCRITO_OPERACIONAL'
          : elapsed >= steps[2]!
            ? 'CRITICO'
            : elapsed >= steps[1]!
              ? 'ALERTA_N2'
              : elapsed >= steps[0]!
                ? 'ALERTA_N1'
                : 'SEM_RISCO';
      expect(r.body.data.clocks[0]).toEqual({
        clockCode: 'A',
        applicability: 'applicable',
        flag,
        ceilingOn: timer.rows[0]!.due,
      });
      const expectedRaw = await fixture.owner.query<{ raw: string }>(
        'select ($1::date+$2::int)::text raw',
        [fixture.practiceOn, track],
      );
      expect(timer.rows[0]!.raw).toBe(expectedRaw.rows[0]!.raw);
      expect(timer.rows[0]!.due).toBe(
        await fixture.forwardBusinessDay(timer.rows[0]!.raw),
      );
      expect(
        r.body.data.sourceVersions.every((v: string) =>
          /^rrv1:[a-f0-9]{64}$/.test(v),
        ),
      ).toBe(true);
      const b = await fixture.owner.query(
        "select id from inf.rait_clock where case_id=$1 and clock_code='B'",
        [c.id],
      );
      expect(b.rows).toEqual([]);
      expect(await fixture.effects()).toEqual(before);
    });
});

describe('S2 operational incident actual SQL linkage and independent provenance', () => {
  for (const mode of [
    'qualified',
    'missingReceipt',
    'missingIncident',
    'wrongCase',
    'foreignTenant',
    'clockOnly',
  ] as const)
    it(`operational source ${mode} has exact actual incident linkage`, async () => {
      fixture.practiceOn = '2019-06-15';
      const c = await fixture.admitted(app),
        source = await fixture.prepareRisk(c.id);
      const incidents = await fixture.operationalIncidents(
        c.id,
        source.records,
      );
      const control = await request(app.getHttpServer())
        .get(`${PREFIX}/cases/${c.id}/risk`)
        .set(fixture.riskHeaders());
      expect(control.status, JSON.stringify(control.body)).toBe(200);
      expect(control.body.data.worstFlag).toBe('PRESCRITO_OPERACIONAL');
      const target = incidents[0]!;
      if (mode === 'missingReceipt')
        fixture.revokedReceipts.add(target.receipt.digest);
      if (mode === 'missingIncident')
        await fixture.owner.query(
          'update inf.rait_clock_alert set incident_ref=$2 where id=$1',
          [target.alert, 'INC-9999-9999'],
        );
      if (mode === 'wrongCase') {
        const other = await fixture.admitted(app);
        await fixture.owner.query(
          'update inf.rait_incident set case_id=$2 where id=$1',
          [target.incident, other.id],
        );
      }
      if (mode === 'foreignTenant')
        await fixture.owner.query(
          'update inf.rait_incident set tenant_id=$2 where id=$1',
          [target.incident, randomUUID()],
        );
      if (mode === 'clockOnly') {
        await fixture.owner.query(
          'update inf.rait_incident set case_id=null where id=$1',
          [target.incident],
        );
        fixture.revokedReceipts.add(target.receipt.digest);
        await fixture.admitReceipt(
          'incident',
          c.id,
          target.receipt.core.bindings.map((b) => b.sourceRef),
        );
      }
      const before = await fixture.effects();
      const r = await request(app.getHttpServer())
        .get(`${PREFIX}/cases/${c.id}/risk`)
        .set(fixture.riskHeaders());
      expect(r.status, JSON.stringify(r.body)).toBe(
        mode === 'qualified' || mode === 'clockOnly' ? 200 : 503,
      );
      if (r.status === 503) {
        expect(r.body.code).toBe('RAIT.RISK_SOURCE_UNAVAILABLE');
        expect(r.body.context ?? {}).toEqual({});
        expect(r.body).not.toHaveProperty('data');
      }
      expect(await fixture.effects()).toEqual(before);
    });
  it('the actual PostgreSQL rate limiter was exercised under the isolated fixture cap', async () => {
    const before = (
      await fixture.owner.query<{
        bucket_key: string;
        win: string;
        hits: number;
      }>(
        'select bucket_key,window_start::text win,hits from integration.rate_limit_windows where tenant_id=$1',
        [RAIT_TENANT],
      )
    ).rows;
    const c = await fixture.admitted(app);
    expect(c.state).toBe('ADMITIDO');
    const windows = (
      await fixture.owner.query<{
        bucket_key: string;
        win: string;
        hits: number;
      }>(
        'select bucket_key,window_start::text win,hits from integration.rate_limit_windows where tenant_id=$1',
        [RAIT_TENANT],
      )
    ).rows;
    expect(
      windows.some(
        (row) =>
          row.hits >
          (before.find(
            (old) =>
              old.bucket_key === row.bucket_key && old.win === row.win,
          )?.hits ?? 0),
      ),
    ).toBe(true);
    expect(process.env.STYNX_RATE_LIMIT_DEFAULT).toBe('10000');
  });
});

describe('S2 server selection, risk/priority/FIFO/id and inherited NULL exclusion', () => {
  it('risk precedes legal priority, then priority precedes identical protocol time', async () => {
    const low = await fixture.admitted(app, [
      {
        basis_code: 'age_80_plus',
        source_kind: 'presented_cnh',
        source_ref: 'Inspector independently verified synthetic CNH age80',
        birth_date: '1940-01-01',
      },
    ]);
    await fixture.prepareRisk(low.id);
    fixture.practiceOn = '2026-01-01';
    const none = await fixture.admitted(app);
    await fixture.prepareRisk(none.id);
    const legal = await fixture.admitted(app, [
      {
        basis_code: 'age_60_plus',
        source_kind: 'presented_cnh',
        source_ref: 'Inspector independently verified synthetic CNH age60',
        birth_date: '1960-01-01',
      },
    ]);
    await fixture.prepareRisk(legal.id);
    const before = await fixture.effects();
    const r = await request(app.getHttpServer())
      .get(`${PREFIX}/claim-context`)
      .query({ pool_id: fixture.pool })
      .set(fixture.headers());
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    expect(r.body.data.queue.items.map((c: { id: string }) => c.id)).toEqual([
      legal.id,
      none.id,
      low.id,
    ]);
    expect(await fixture.effects()).toEqual(before);
    const selected = await claim();
    expect(selected.status, JSON.stringify(selected.body)).toBe(200);
    expect(selected.body.data.id).toBe(legal.id);
  });
  it('equal risk/priority/protocol time resolves by ascending actual case id', async () => {
    const a = await fixture.admitted(app),
      b = await fixture.admitted(app);
    await fixture.prepareRisk(a.id);
    await fixture.prepareRisk(b.id);
    const before = await fixture.effects();
    const r = await request(app.getHttpServer())
      .get(`${PREFIX}/claim-context`)
      .query({ pool_id: fixture.pool })
      .set(fixture.headers());
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    expect(r.body.data.queue.items.map((c: { id: string }) => c.id)).toEqual(
      [a.id, b.id].sort(),
    );
    expect(await fixture.effects()).toEqual(before);
  });
  it('complete two-pool membership requires choice despite a one-item pool page', async () => {
    await fixture.extraPool();
    const before = await fixture.effects();
    const r = await request(app.getHttpServer())
      .get(`${PREFIX}/claim-context`)
      .query({ limit: 1 })
      .set(fixture.headers());
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    expect(r.body.data).toMatchObject({
      eligiblePoolCount: 2,
      selection: 'choice',
      selectedPoolId: null,
      queue: { items: [], nextCursor: null },
    });
    expect(r.body.data.pools.items).toHaveLength(1);
    expect(r.body.data.pools.nextCursor).toEqual(expect.any(String));
    expect(await fixture.effects()).toEqual(before);
  });
  it('same-unit other pool without actual membership does not inherit claim authority', async () => {
    const other = await fixture.extraPool(fixture.unit, false);
    const before = await fixture.effects();
    const context = await request(app.getHttpServer())
      .get(`${PREFIX}/claim-context`)
      .set(fixture.headers());
    expect(context.status, JSON.stringify(context.body)).toBe(200);
    expect(context.body.data.eligiblePoolCount).toBe(1);
    for (const pool of [other, randomUUID()]) {
      const r = await request(app.getHttpServer())
        .get(`${PREFIX}/claim-context`)
        .query({ pool_id: pool })
        .set(fixture.headers());
      expect(r.status).toBe(404);
      expect(r.body).not.toHaveProperty('data');
    }
    expect(await fixture.effects()).toEqual(before);
  });
  it('historical NULL priority remains excluded before legacy/risk qualification, without factual repair', async () => {
    const canonical = await fixture.owner.query<{ id: string }>(
      "select id from inf.rait_pool where tenant_id=$1 and instance='defesa_previa' and unit_id is null",
      [RAIT_TENANT],
    );
    expect(canonical.rows).toHaveLength(1);
    const pool = canonical.rows[0]!.id;
    await fixture.joinExistingPool(pool);
    const historical = '00000000-0000-7000-8000-000010000006';
    const source = await fixture.owner.query(
      'select state,unit_id,legal_priority from inf.rait_case where id=$1',
      [historical],
    );
    expect(source.rows).toEqual([
      { state: 'DISTRIBUIDO', unit_id: null, legal_priority: null },
    ]);
    await fixture.owner.query(
      "insert into inf.rait_case_pool_scope(tenant_id,case_id,pool_id,active,authorization_ref,source_ref) values($1,$2,$3,true,$4,'S2 historical NULL exclusion observation')",
      [
        RAIT_TENANT,
        historical,
        pool,
        'Owner-approved isolated Inspector fixture',
      ],
    );
    const before = await fixture.effects();
    const r = await request(app.getHttpServer())
      .get(`${PREFIX}/claim-context`)
      .query({ pool_id: pool })
      .set(fixture.headers());
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    expect(r.body.data.queue.items).toEqual([]);
    const claimed = await request(app.getHttpServer())
      .post(`${PREFIX}/pools/${pool}/claim-next`)
      .set(fixture.headers())
      .send({});
    expect(claimed.status, JSON.stringify(claimed.body)).toBe(409);
    expect(claimed.body.code).toBe('RAIT.QUEUE_EMPTY');
    expect(await fixture.effects()).toEqual(before);
    expect(
      (
        await fixture.owner.query(
          'select state,unit_id,legal_priority from inf.rait_case where id=$1',
          [historical],
        )
      ).rows,
    ).toEqual(source.rows);
  });
});

describe('S2 explicit current legacy dispositions', () => {
  for (const disposition of ['hold', 'preserve_assigned'] as const)
    it(`trusted ${disposition} is preserved and cannot be reclaimed`, async () => {
      const c = await fixture.admitted(app),
        record = await fixture.historicallyDistributed(c.id, disposition);
      await fixture.prepareRisk(c.id);
      await fixture.qualifyLegacy(c.id, record);
      const before = await fixture.effects();
      const context = await request(app.getHttpServer())
        .get(`${PREFIX}/claim-context`)
        .query({ pool_id: fixture.pool })
        .set(fixture.headers());
      expect(context.status, JSON.stringify(context.body)).toBe(200);
      expect(context.body.data.queue.items).toEqual([]);
      const r = await claim();
      expect(r.status, JSON.stringify(r.body)).toBe(409);
      expect(r.body.code).toBe('RAIT.QUEUE_EMPTY');
      expect(await fixture.effects()).toEqual(before);
      const inventory = await request(app.getHttpServer())
        .get(`${PREFIX}/cases/${c.id}`)
        .set(disposition === 'hold' ? fixture.riskHeaders() : fixture.headers());
      expect(inventory.status, JSON.stringify(inventory.body)).toBe(200);
      expect(inventory.body.data.state).toBe('DISTRIBUIDO');
      expect(await fixture.effects()).toEqual(before);
    });
  it('stale observed legacy version fails409 without automatic reclassification', async () => {
    const c = await fixture.admitted(app),
      record = await fixture.historicallyDistributed(c.id);
    await fixture.prepareRisk(c.id);
    await fixture.qualifyLegacy(c.id, record);
    const control = await request(app.getHttpServer())
      .get(`${PREFIX}/claim-context`)
      .query({ pool_id: fixture.pool })
      .set(fixture.headers());
    expect(control.status, JSON.stringify(control.body)).toBe(200);
    await fixture.owner.query(
      'update inf.rait_case set version=version+1 where id=$1',
      [c.id],
    );
    const before = await fixture.effects(),
      r = await claim();
    expect(r.status, JSON.stringify(r.body)).toBe(409);
    expect(r.body.code).toBe('RAIT.CLAIM_LEGACY_UNVERIFIED');
    expect(r.body.context ?? {}).toEqual({});
    expect(await fixture.effects()).toEqual(before);
  });
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
async function withDeadline<T>(promise: Promise<T>, message: string) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      const timer = setTimeout(() => reject(Error(message)), 5000);
      timer.unref();
    }),
  ]);
}

describe('S2 source consistency across the actual claim transaction', () => {
  it('parameter revocation after verified SQL read is serialized or revalidated before any stale claim effects', async () => {
    const c = await fixture.admitted(app);
    await fixture.prepareRisk(c.id);
    const selected = fixture.parameters.get('A')!;
    const reached = deferred<void>(),
      resume = deferred<void>();
    let paused = false;
    fixture.onQualified = async (req) => {
      if (
        !paused &&
        req.kind === 'parameter' &&
        req.sourceRefs.includes('sql:ops.parameter:' + selected.id)
      ) {
        paused = true;
        reached.resolve();
        await resume.promise;
      }
    };
    const writer = new Client({
      connectionString: process.env.STYNX_OWNER_DATABASE_URL,
    });
    await writer.connect();
    const writerPid = (
      await writer.query<{ id: number }>('select pg_backend_pid() id')
    ).rows[0]!.id;
    const before = await fixture.effects();
    let mutated = false;
    let mutation: Promise<void> | undefined;
    const pending = claim().then((r) => r);
    try {
      await withDeadline(
        Promise.race([
          reached.promise,
          pending.then((r) => {
            throw Error(
              'PREREQUISITE_PENDING: claim returned' +
                r.status +
                ' before actual qualified parameter read',
            );
          }),
        ]),
        'PREREQUISITE_PENDING: no actual SQL parameter qualification reached',
      );
      mutation = (async () => {
        await writer.query('begin');
        await writer.query(
          'update ops.parameter set source_pending=true where id=$1',
          [selected.id],
        );
        await writer.query('commit');
        mutated = true;
      })();
      let locked = false;
      const end = Date.now() + 5000;
      while (!mutated && !locked && Date.now() < end) {
        const row = await fixture.owner.query<{ waiting: boolean }>(
          "select wait_event_type='Lock' waiting from pg_stat_activity where pid=$1",
          [writerPid],
        );
        locked = row.rows[0]?.waiting === true;
        if (!locked && !mutated) await new Promise((r) => setTimeout(r, 10));
      }
      expect(
        locked || mutated,
        'real second connection must either wait on the source lock or commit its source change',
      ).toBe(true);
      resume.resolve();
      const r = await pending;
      if (locked) {
        expect(r.status, JSON.stringify(r.body)).toBe(200);
        expect(r.body.data).toMatchObject({
          id: c.id,
          state: 'EM_INSTRUCAO',
          version: c.version + 2,
        });
      } else {
        expect(r.status, JSON.stringify(r.body)).toBe(503);
        expect(r.body.code).toBe('RAIT.RISK_SOURCE_UNAVAILABLE');
        expect(await fixture.effects()).toEqual(before);
      }
      await mutation;
      expect(mutated).toBe(true);
      expect(
        (
          await fixture.owner.query(
            'select source_pending from ops.parameter where id=$1',
            [selected.id],
          )
        ).rows,
      ).toEqual([{ source_pending: true }]);
    } finally {
      resume.resolve();
      await Promise.allSettled([pending, ...(mutation ? [mutation] : [])]);
      await writer.query('rollback');
      await writer.end();
      fixture.onQualified = undefined;
    }
  });
});

async function readQualifiedRisk(caseId: string) {
  const r = await request(app.getHttpServer())
    .get(`${PREFIX}/cases/${caseId}/risk`)
    .set(fixture.riskHeaders());
  expect(r.status, JSON.stringify(r.body)).toBe(200);
  return r;
}
async function rebindActualReceipts() {
  const replacements = new Map<string, string>();
  for (const receipt of [...fixture.receipts].filter(
    (r) => !fixture.revokedReceipts.has(r.digest),
  )) {
    fixture.revokedReceipts.add(receipt.digest);
    const fresh = await fixture.admitReceipt(
      receipt.core.kind,
      receipt.core.caseId,
      receipt.core.bindings.map((b) => b.sourceRef),
      receipt.core.dependencies.map((d) => replacements.get(d) ?? d),
      receipt.core.policySources,
    );
    replacements.set(receipt.digest, fresh.digest);
  }
}

describe('S2 SQL source/date qualification rather than permissive pure inputs', () => {
  it('actual C movement resets only C while independently qualified D retains original practice start', async () => {
    const c = await fixture.admitted(app),
      source = await fixture.prepareRisk(c.id);
    const before = await fixture.effects(),
      r = await readQualifiedRisk(c.id);
    const dates = await fixture.owner.query<{
      code: string;
      start: string;
      ceiling: string;
    }>(
      'select clock_code code,started_on::text start,ceiling_on::text ceiling from inf.rait_clock where case_id=$1 order by clock_code',
      [c.id],
    );
    const movement = (
      await fixture.owner.query<{ day: string }>(
        "select (occurred_at at time zone 'America/Manaus')::date::text AS \"day\" from inf.rait_case_event where case_id=$1 and to_state='ADMITIDO' order by occurred_at desc,id limit 1",
        [c.id],
      )
    ).rows[0]!.day;
    const cRaw = (
      await fixture.owner.query<{ raw: string }>(
        "select ($1::date+interval '36 months')::date::text raw",
        [movement],
      )
    ).rows[0]!.raw;
    const dRaw = (
      await fixture.owner.query<{ raw: string }>(
        "select ($1::date+interval '60 months')::date::text raw",
        [fixture.practiceOn],
      )
    ).rows[0]!.raw;
    expect(dates.rows.find((d) => d.code === 'C')).toEqual({
      code: 'C',
      start: movement,
      ceiling: await fixture.forwardBusinessDay(cRaw),
    });
    expect(dates.rows.find((d) => d.code === 'D')).toEqual({
      code: 'D',
      start: fixture.practiceOn,
      ceiling: await fixture.forwardBusinessDay(dRaw),
    });
    expect(movement).not.toBe(fixture.practiceOn);
    expect(r.body.data.clocks[2]).toMatchObject({
      clockCode: 'C',
      applicability: 'applicable',
      ceilingOn: await fixture.forwardBusinessDay(cRaw),
    });
    expect(r.body.data.clocks[3]).toMatchObject({
      clockCode: 'D',
      applicability: 'applicable',
      ceilingOn: await fixture.forwardBusinessDay(dRaw),
    });
    expect(source.records.get('D')).toBeDefined();
    expect(await fixture.effects()).toEqual(before);
  });
  it('unknown D reset cannot masquerade as qualified ORIGINAL even with freshly matching content receipts', async () => {
    const c = await fixture.admitted(app),
      source = await fixture.prepareRisk(c.id);
    await readQualifiedRisk(c.id);
    await fixture.owner.query(
      'update inf.rait_clock set last_reset_at=clock_timestamp() where id=$1',
      [source.records.get('D')!.clock],
    );
    await rebindActualReceipts();
    const before = await fixture.effects(),
      r = await claim();
    expect(r.status, JSON.stringify(r.body)).toBe(503);
    expect(r.body.code).toBe('RAIT.RISK_SOURCE_UNAVAILABLE');
    expect(r.body.context ?? {}).toEqual({});
    expect(await fixture.effects()).toEqual(before);
  });
  for (const mutation of [
    'proposta',
    'sourcePending',
    'ambiguousActivation',
  ] as const)
    it(`actual selected parameter ${mutation} fails closed with no fallback/default`, async () => {
      const c = await fixture.admitted(app);
      await fixture.prepareRisk(c.id);
      await readQualifiedRisk(c.id);
      const selected = fixture.parameters.get('A')!;
      if (mutation === 'proposta')
        await fixture.owner.query(
          "update ops.parameter set status='proposta' where id=$1",
          [selected.id],
        );
      if (mutation === 'sourcePending')
        await fixture.owner.query(
          'update ops.parameter set source_pending=true where id=$1',
          [selected.id],
        );
      if (mutation === 'ambiguousActivation')
        await fixture.admitReceipt(
          'parameter',
          null,
          selected.receipt.core.bindings.map((b) => b.sourceRef),
        );
      else {
        fixture.revokedReceipts.add(selected.receipt.digest);
        await fixture.admitReceipt(
          'parameter',
          null,
          selected.receipt.core.bindings.map((b) => b.sourceRef),
        );
      }
      const before = await fixture.effects(),
        r = await claim();
      expect(r.status, JSON.stringify(r.body)).toBe(503);
      expect(r.body.code).toBe('RAIT.RISK_SOURCE_UNAVAILABLE');
      expect(await fixture.effects()).toEqual(before);
    });
});

describe('S2 complete eligible ordering and idempotency context', () => {
  it('impeded best candidate is skipped for next eligible without leaking skipped identities', async () => {
    const a = await fixture.admitted(app),
      b = await fixture.admitted(app);
    await fixture.prepareRisk(a.id);
    await fixture.prepareRisk(b.id);
    const context = await request(app.getHttpServer())
      .get(`${PREFIX}/claim-context`)
      .query({ pool_id: fixture.pool })
      .set(fixture.headers());
    expect(context.status, JSON.stringify(context.body)).toBe(200);
    const best = context.body.data.queue.items[0].id as string,
      next = context.body.data.queue.items[1].id as string;
    await fixture.owner.query(
      "insert into inf.rait_impediment(tenant_id,member_id,case_id,basis,declared_at) values($1,$2,$3,'foro_intimo',clock_timestamp())",
      [RAIT_TENANT, fixture.member, best],
    );
    const before = (
      await fixture.owner.query(
        'select to_jsonb(c) value from inf.rait_case c where id=$1',
        [best],
      )
    ).rows[0]!.value;
    const r = await claim();
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    expect(r.body.data.id).toBe(next);
    expect(JSON.stringify(r.body)).not.toContain(best);
    expect(
      (
        await fixture.owner.query(
          'select to_jsonb(c) value from inf.rait_case c where id=$1',
          [best],
        )
      ).rows[0]!.value,
    ).toEqual(before);
    expect(
      (
        await fixture.owner.query(
          'select id from inf.rait_assignment where case_id=$1 and active',
          [best],
        )
      ).rows,
    ).toEqual([]);
  });
  it('QUEUE_EMPTY precedes WIP when all eligible work was already consumed', async () => {
    const c = await fixture.admitted(app);
    await fixture.prepareRisk(c.id);
    await fixture.owner.query(
      'update inf.rait_schedule set wip_limit=1 where member_id=$1',
      [fixture.member],
    );
    const first = await claim();
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    const before = await fixture.effects();
    const second = await claim();
    expect(second.status, JSON.stringify(second.body)).toBe(409);
    expect(second.body.code).toBe('RAIT.QUEUE_EMPTY');
    expect(await fixture.effects()).toEqual(before);
  });
  it('valid different pool under a consumed key conflicts409; a fresh key remains a distinct attempt', async () => {
    const c = await fixture.admitted(app);
    await fixture.prepareRisk(c.id);
    const other = await fixture.extraPool();
    const key = randomUUID(),
      first = await claim(key);
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    const before = await fixture.effects();
    const changed = await request(app.getHttpServer())
      .post(`${PREFIX}/pools/${other}/claim-next`)
      .set(fixture.headers('rait-analyst', fixture.actor, key))
      .send({});
    expect(changed.status, JSON.stringify(changed.body)).toBe(409);
    expect(changed.body.code).toBe('RAIT.IDEMPOTENCY_REPLAY');
    expect(changed.body).not.toHaveProperty('data');
    const fresh = await request(app.getHttpServer())
      .post(`${PREFIX}/pools/${other}/claim-next`)
      .set(fixture.headers())
      .send({});
    expect(fresh.status, JSON.stringify(fresh.body)).toBe(409);
    expect(fresh.body.code).toBe('RAIT.QUEUE_EMPTY');
    expect(await fixture.effects()).toEqual(before);
  });
  for (const change of ['pool', 'unauthorizedActor', 'revocation'] as const)
    it(`VALID queue cursor cannot be replayed across ${change}`, async () => {
      const a = await fixture.admitted(app),
        b = await fixture.admitted(app);
      await fixture.prepareRisk(a.id);
      await fixture.prepareRisk(b.id);
      const first = await request(app.getHttpServer())
        .get(`${PREFIX}/claim-context`)
        .query({ pool_id: fixture.pool, limit: 1 })
        .set(fixture.headers());
      expect(first.status, JSON.stringify(first.body)).toBe(200);
      expect(first.body.data.queue.nextCursor).toEqual(expect.any(String));
      let pool = fixture.pool,
        actor = fixture.actor;
      if (change === 'pool') pool = await fixture.extraPool();
      if (change === 'unauthorizedActor') {
        actor = fixture.secondActor;
        await fixture.owner.query(
          "update inf.rait_pool_member set status='ADVERTIDO' where id=$1",
          [fixture.secondMember],
        );
      }
      if (change === 'revocation')
        await fixture.owner.query(
          "update inf.rait_pool_member set status='ADVERTIDO' where id=$1",
          [fixture.member],
        );
      const before = await fixture.effects();
      const r = await request(app.getHttpServer())
        .get(`${PREFIX}/claim-context`)
        .query({
          pool_id: pool,
          limit: 1,
          queue_cursor: first.body.data.queue.nextCursor,
        })
        .set(fixture.headers('rait-analyst', actor));
      expect(r.status, JSON.stringify(r.body)).toBe(
        change === 'pool' ? 400 : 404,
      );
      if (change === 'pool') expect(r.body.code).toBe('RAIT.VALIDATION_FAILED');
      expect(r.body).not.toHaveProperty('data');
      expect(await fixture.effects()).toEqual(before);
    });
});

describe('S2 exact pool routing under independently valid memberships', () => {
  it('membership in two same-unit pools cannot move a case out of its explicit selected pool', async () => {
    const c = await fixture.admitted(app);
    await fixture.prepareRisk(c.id);
    const other = await fixture.extraPool();
    const before = await fixture.effects();
    const context = await request(app.getHttpServer())
      .get(`${PREFIX}/claim-context`)
      .query({ pool_id: other })
      .set(fixture.headers());
    expect(context.status, JSON.stringify(context.body)).toBe(200);
    expect(context.body.data.selectedPoolId).toBe(other);
    expect(context.body.data.queue.items).toEqual([]);
    expect(JSON.stringify(context.body.data.queue)).not.toContain(c.id);
    const r = await request(app.getHttpServer())
      .post(`${PREFIX}/pools/${other}/claim-next`)
      .set(fixture.headers())
      .send({});
    expect(r.status, JSON.stringify(r.body)).toBe(409);
    expect(r.body.code).toBe('RAIT.QUEUE_EMPTY');
    expect(JSON.stringify(r.body)).not.toContain(c.id);
    expect(await fixture.effects()).toEqual(before);
    const original = await request(app.getHttpServer())
      .get(`${PREFIX}/claim-context`)
      .query({ pool_id: fixture.pool })
      .set(fixture.headers());
    expect(original.status, JSON.stringify(original.body)).toBe(200);
    expect(
      original.body.data.queue.items.map((v: { id: string }) => v.id),
    ).toEqual([c.id]);
    expect(await fixture.effects()).toEqual(before);
  });
});

describe('S2 risk read preserves complete S1 role-purpose authorization', () => {
  it('a separately bound coordinator can read unassigned risk while an unassigned analyst cannot borrow that purpose', async () => {
    const c = await fixture.admitted(app);
    await fixture.prepareRisk(c.id);
    await readQualifiedRisk(c.id);
    const before = await fixture.effects();
    const r = await request(app.getHttpServer())
      .get(`${PREFIX}/cases/${c.id}/risk`)
      .set(fixture.riskHeaders('rait-analyst', fixture.actor));
    expect(r.status, JSON.stringify(r.body)).toBe(404);
    expect(r.body).not.toHaveProperty('data');
    expect(await fixture.effects()).toEqual(before);
  });
  it('after a real claim the analyst owns the case purpose; changed risk sources remain fail-closed503', async () => {
    const c = await fixture.admitted(app);
    await fixture.prepareRisk(c.id);
    const claimed = await claim();
    expect(claimed.status, JSON.stringify(claimed.body)).toBe(200);
    const before = await fixture.effects();
    const inventory = await request(app.getHttpServer())
      .get(`${PREFIX}/cases/${c.id}`)
      .set(fixture.headers());
    expect(inventory.status, JSON.stringify(inventory.body)).toBe(200);
    expect(inventory.body.data.id).toBe(c.id);
    const r = await request(app.getHttpServer())
      .get(`${PREFIX}/cases/${c.id}/risk`)
      .set(fixture.riskHeaders('rait-analyst', fixture.actor));
    expect(r.status, JSON.stringify(r.body)).toBe(503);
    expect(r.body.code).toBe('RAIT.RISK_SOURCE_UNAVAILABLE');
    expect(await fixture.effects()).toEqual(before);
  });
});
