// TASK25 / JW01-admissibility.md. Real HTTP, current PolicyGuard, app-role SQL and tenant RLS.
// The test profile's local verifier does NOT prove cryptographic JWT validation (OD-R25-017).
import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  Jw01AdmissibilityFixture,
  assertDedicatedDatabaseEnvironment,
  RAIT_ACTOR,
  RAIT_SECRETARY,
  RAIT_TENANT,
  JW_CASE,
  FOREIGN_CASE,
  HUMAN_CRITERIA,
  humanBody,
} from '../shared/rait-jw01-admissibility.fixture.js';

let app: INestApplication;
let fixture: Jw01AdmissibilityFixture;
let prepared = false;
const triagePath = (id = JW_CASE) => `/v1/inf/rait/cases/${id}/commands/triage`;
const savePath = '/v1/inf/rait/admissibility';
function headers(
  role = 'rait-analyst',
  match: string | null = '"1"',
  key = `r25-jw01-${randomUUID()}`,
) {
  process.env.DETRAN_LOCAL_ROLES = role;
  process.env.DETRAN_LOCAL_ACTOR_ID =
    role === 'rait-secretary' ? RAIT_SECRETARY : RAIT_ACTOR;
  return {
    authorization: 'Bearer local',
    'x-tenant-id': RAIT_TENANT,
    'idempotency-key': key,
    ...(match === null ? {} : { 'if-match': match }),
  };
}
async function start() {
  const result = await request(app.getHttpServer())
    .post(triagePath())
    .set(headers())
    .send({});
  expect(result.status, JSON.stringify(result.body)).toBe(200);
  return result;
}
async function saveAll(verdicts: readonly boolean[] = [true, true, true]) {
  let match = (await start()).headers.etag;
  for (const [index, criterion] of HUMAN_CRITERIA.entries()) {
    const response = await request(app.getHttpServer())
      .post(savePath)
      .set(headers('rait-analyst', match))
      .send(humanBody(criterion, verdicts[index]));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    match = response.headers.etag;
  }
  return match as string;
}
beforeAll(async () => {
  assertDedicatedDatabaseEnvironment();
  process.env.DETRAN_LOCAL_TENANT_ID = RAIT_TENANT;
  process.env.DETRAN_LOCAL_ACTOR_ID = RAIT_ACTOR;
  fixture = new Jw01AdmissibilityFixture();
  await fixture.connect();
  const { AppModule } = await import('../../src/app.module.js');
  app = await NestFactory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();
});
beforeEach(async () => {
  await fixture.prepare();
  prepared = true;
});
afterAll(async () => {
  await app?.close();
  if (fixture) {
    await fixture.cleanupForeign();
    if (prepared) await fixture.close();
    else await fixture.owner.end();
  }
});

describe('TASK25 F01 and R01 real persistence', () => {
  for (const role of ['rait-analyst', 'rait-secretary'])
    it(`${role} starts strict F01 with one engine-owned verdict and a case ETag`, async () => {
      const before = await fixture.snapshot();
      const response = await request(app.getHttpServer())
        .post(triagePath())
        .set(headers(role))
        .send({});
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      expect(response.headers.etag).toBe('"2"');
      expect(response.body).toMatchObject({
        data: { id: JW_CASE, state: 'TRIAGEM_ADMISSIBILIDADE', version: 2 },
        events: expect.any(Array),
      });
      expect(response.body).not.toHaveProperty('etag');
      const after = await fixture.snapshot();
      expect(after.verdicts).toHaveLength(1);
      expect(after.verdicts[0]).toMatchObject({
        criterion: 'tempestividade',
        verdict: true,
        evaluated_by: role === 'rait-secretary' ? RAIT_SECRETARY : RAIT_ACTOR,
      });
      expect(after.verdicts[0].evaluated_at).toBeInstanceOf(Date);
      expect(after.effects.outbox - before.effects.outbox).toBe(1);
      expect(after.effects.audit - before.effects.audit).toBe(1);
    });
  it('starts, saves three individual human criteria, upserts and admits with current ETag', async () => {
    let match = await saveAll();
    let after = await fixture.snapshot();
    expect(after.verdicts.map((row) => row.criterion).sort()).toEqual(
      [...HUMAN_CRITERIA, 'tempestividade'].sort(),
    );
    expect(after.caso).toMatchObject({
      state: 'TRIAGEM_ADMISSIBILIDADE',
      version: 5,
    });
    const updated = await request(app.getHttpServer())
      .post(savePath)
      .set(headers('rait-analyst', match))
      .send({
        ...humanBody('legitimidade'),
        reason: 'Conferência complementar da fixture.',
      });
    expect(updated.status, JSON.stringify(updated.body)).toBe(200);
    match = updated.headers.etag;
    after = await fixture.snapshot();
    expect(after.verdicts).toHaveLength(4);
    expect(after.caso.version).toBe(6);
    const human = after.verdicts.find(
      (row) => row.criterion === 'legitimidade',
    )!;
    const server = after.verdicts.find(
      (row) => row.criterion === 'tempestividade',
    )!;
    expect(human.evaluated_by).toBe(RAIT_ACTOR);
    expect(server.evaluated_by).toBe(RAIT_ACTOR);
    expect(human.evaluated_at).toEqual(server.evaluated_at);
    const admitted = await request(app.getHttpServer())
      .post(`/v1/inf/rait/cases/${JW_CASE}/commands/admit`)
      .set(headers('rait-analyst', match))
      .send({});
    expect(admitted.status, JSON.stringify(admitted.body)).toBe(200);
    expect(admitted.headers.etag).toBe('"7"');
    expect((await fixture.snapshot()).caso).toMatchObject({
      state: 'ADMITIDO',
      version: 7,
    });
  });
  it('rejects with canonical reason and operator grounds; no client inferred legal basis', async () => {
    const match = await saveAll([false, true, true]);
    const body = {
      reason: 'ilegitimo',
      legalBasis: 'Resolução CONTRAN 900 art. 4º II — conferência da fixture.',
    };
    const result = await request(app.getHttpServer())
      .post(`/v1/inf/rait/cases/${JW_CASE}/commands/non-admission`)
      .set(headers('rait-analyst', match))
      .send(body);
    expect(result.status, JSON.stringify(result.body)).toBe(200);
    expect((await fixture.snapshot()).caso).toMatchObject({
      state: 'NAO_CONHECIDO',
      non_admission_reason: 'ilegitimo',
      version: 6,
    });
  });
  it('admit cannot bypass incomplete human checklist', async () => {
    const match = (await start()).headers.etag;
    const before = await fixture.snapshot();
    const result = await request(app.getHttpServer())
      .post(`/v1/inf/rait/cases/${JW_CASE}/commands/admit`)
      .set(headers('rait-analyst', match))
      .send({});
    expect(result.status).toBe(422);
    expect(result.body.code).toBe('RAIT.TRIAGE_INCOMPLETE');
    expect(await fixture.snapshot()).toEqual(before);
  });
  it('engine missing timer input fails closed before any state/verdict/event/audit write', async () => {
    await fixture.prepareAdmitBinding(JW_CASE, { timer: 'missing' });
    await fixture.owner.query(
      "update inf.rait_case set state='PROTOCOLADO',version=1 where id=$1",
      [JW_CASE],
    );
    await fixture.owner.query(
      'delete from inf.rait_admissibility where case_id=$1',
      [JW_CASE],
    );
    // The existing fixture's missing branch preserves a defence timer; explicitly remove that input.
    await fixture.owner.query(
      "update inf.infraction_timer set status='satisfeito',satisfied_at=now() where tenant_id=$1 and timer_code='T-DEF' and infraction_id in (select id from inf.infraction where ait_id=(select ait_id from inf.rait_case where id=$2))",
      [RAIT_TENANT, JW_CASE],
    );
    const before = await fixture.snapshot();
    const result = await request(app.getHttpServer())
      .post(triagePath())
      .set(headers())
      .send({});
    expect(result.status).toBe(422);
    expect(result.body.code).toBe('RAIT.TRIAGE_TIMELINESS_READONLY');
    expect(await fixture.snapshot()).toEqual(before);
  });
});

describe('TASK25 fail-closed authorization, headers and payload', () => {
  for (const role of ['bi-analyst', 'rait-chair', 'rait-rapporteur'])
    for (const operation of ['triage', 'save'] as const)
      it(`${role} cannot ${operation}; no persisted effect`, async () => {
        if (operation === 'save') await start();
        const before = await fixture.snapshot();
        const result = await request(app.getHttpServer())
          .post(operation === 'triage' ? triagePath() : savePath)
          .set(headers(role, operation === 'save' ? '"2"' : '"1"'))
          .send(operation === 'triage' ? {} : humanBody('assinatura'));
        expect(result.status).toBe(403);
        expect(result.body.code).toBe('RAIT.FORBIDDEN_ACTION');
        expect(await fixture.snapshot()).toEqual(before);
      });
  for (const field of [
    'tenant_id',
    'evaluated_by',
    'evaluated_at',
    'version',
    'tempestividade',
  ])
    it(`R01 rejects server-owned field ${field}`, async () => {
      const match = (await start()).headers.etag;
      const before = await fixture.snapshot();
      const result = await request(app.getHttpServer())
        .post(savePath)
        .set(headers('rait-analyst', match))
        .send({
          ...humanBody('assinatura'),
          [field]: field === 'version' ? 99 : RAIT_ACTOR,
        });
      expect(result.status).toBe(400);
      expect(await fixture.snapshot()).toEqual(before);
    });
  for (const body of [
    { verdict: true },
    { tenant_id: RAIT_TENANT },
    { case_id: JW_CASE },
  ])
    it(`F01 rejects nonempty body ${JSON.stringify(body)}`, async () => {
      const before = await fixture.snapshot();
      const result = await request(app.getHttpServer())
        .post(triagePath())
        .set(headers())
        .send(body);
      expect(result.status).toBe(400);
      expect(await fixture.snapshot()).toEqual(before);
    });
  for (const [match, status, code] of [
    [null, 428, 'RAIT.IF_MATCH_REQUIRED'],
    ['"0"', 412, 'RAIT.VERSION_CONFLICT'],
  ] as const)
    for (const operation of ['triage', 'save'] as const)
      it(`${operation}: ${status} for ${match}`, async () => {
        if (operation === 'save') await start();
        const before = await fixture.snapshot();
        const result = await request(app.getHttpServer())
          .post(operation === 'triage' ? triagePath() : savePath)
          .set(headers('rait-analyst', match))
          .send(operation === 'triage' ? {} : humanBody('assinatura'));
        expect(result.status).toBe(status);
        expect(result.body.code).toBe(code);
        expect(await fixture.snapshot()).toEqual(before);
      });
  it('requires idempotency key and does not accept supplied tempestividade as a human criterion', async () => {
    const match = (await start()).headers.etag;
    const h = headers('rait-analyst', match);
    delete (h as Partial<typeof h>)['idempotency-key'];
    const result = await request(app.getHttpServer())
      .post(savePath)
      .set(h)
      .send(humanBody('assinatura'));
    expect(result.status).toBe(400);
    const server = await request(app.getHttpServer())
      .post(savePath)
      .set(headers('rait-analyst', match))
      .send({ ...humanBody('assinatura'), criterion: 'tempestividade' });
    expect(server.status).toBe(400);
  });
  it('cross-tenant resource ID is indistinguishable from missing and produces no writes', async () => {
    await fixture.prepareForeign();
    const before = await fixture.snapshot();
    const response = await request(app.getHttpServer())
      .post(triagePath(FOREIGN_CASE))
      .set(headers())
      .send({});
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('RAIT.TENANT_MISMATCH');
    expect(await fixture.snapshot()).toEqual(before);
  });
  for (const method of ['patch', 'delete'] as const)
    it(`${method} cannot bypass controlled admissibility POST`, async () => {
      const response = await request(app.getHttpServer())
        [method](`${savePath}/${JW_CASE}`)
        .set(headers())
        .send({ verdict: true });
      expect(response.status).toBe(404);
    });
  it('triage rejects a later case state rather than rewinding workflow', async () => {
    await start();
    const before = await fixture.snapshot();
    const response = await request(app.getHttpServer())
      .post(triagePath())
      .set(headers('rait-analyst', '"2"'))
      .send({});
    expect(response.status).toBe(409);
    expect(response.body.code).toBe('RAIT.CASE_STATE_INVALID');
    expect(await fixture.snapshot()).toEqual(before);
  });
});

describe('TASK25 transactional replay and rollback', () => {
  for (const mode of ['serial', 'parallel'] as const)
    for (const operation of ['triage', 'save'] as const)
      it(`${operation} ${mode} replay has one version/audit/outbox`, async () => {
        const match =
          operation === 'save' ? (await start()).headers.etag : '"1"';
        const before = await fixture.snapshot();
        const h = headers(
          'rait-analyst',
          match,
          `r25-jw01-replay-${operation}-${mode}`,
        );
        const invoke = () =>
          request(app.getHttpServer())
            .post(operation === 'triage' ? triagePath() : savePath)
            .set(h)
            .send(operation === 'triage' ? {} : humanBody('assinatura'));
        const responses =
          mode === 'serial'
            ? [await invoke(), await invoke()]
            : await Promise.all([invoke(), invoke()]);
        expect(
          responses.map((item) => item.status),
          JSON.stringify(responses.map((item) => item.body)),
        ).toEqual([200, 200]);
        expect(responses[1].body).toEqual(responses[0].body);
        expect(responses[1].headers.etag).toBe(responses[0].headers.etag);
        const after = await fixture.snapshot();
        expect(after.caso.version).toBe(before.caso.version + 1);
        expect(after.effects.audit - before.effects.audit).toBe(1);
        expect(after.effects.outbox - before.effects.outbox).toBe(1);
        expect(after.effects.ledger - before.effects.ledger).toBe(1);
      });
  it('reusing R01 key with a different valid payload is 409 without another mutation', async () => {
    const match = (await start()).headers.etag;
    const h = headers('rait-analyst', match, 'r25-jw01-fingerprint');
    const first = await request(app.getHttpServer())
      .post(savePath)
      .set(h)
      .send(humanBody('assinatura'));
    expect(first.status).toBe(200);
    const before = await fixture.snapshot();
    const replay = await request(app.getHttpServer())
      .post(savePath)
      .set(h)
      .send(humanBody('assinatura', false));
    expect(replay.status).toBe(409);
    expect(replay.body.code).toBe('RAIT.IDEMPOTENCY_REPLAY');
    expect(await fixture.snapshot()).toEqual(before);
  });
  for (const operation of ['triage', 'save'] as const)
    it(`${operation} rolls back all state/verdicts/ledger/events if audit persistence fails`, async () => {
      const match = operation === 'save' ? (await start()).headers.etag : '"1"';
      const before = await fixture.snapshot();
      await fixture.enableAuditFailure();
      let response;
      let attempted = false;
      try {
        response = await request(app.getHttpServer())
          .post(operation === 'triage' ? triagePath() : savePath)
          .set(headers('rait-analyst', match))
          .send(operation === 'triage' ? {} : humanBody('assinatura'));
        attempted = await fixture.auditFailureWasInvoked();
      } finally {
        await fixture.disableAuditFailure();
      }
      expect(attempted).toBe(true);
      expect(response?.status).toBeGreaterThanOrEqual(500);
      expect(await fixture.snapshot()).toEqual(before);
    });
});

describe('TASK25 additional R01 state and isolation counterexamples', () => {
  it('cannot save a human verdict before F01 transitions the protocolled case', async () => {
    const before = await fixture.snapshot();
    const response = await request(app.getHttpServer())
      .post(savePath)
      .set(headers())
      .send(humanBody('assinatura'));
    expect(response.status).toBe(409);
    expect(response.body.code).toBe('RAIT.CASE_STATE_INVALID');
    expect(await fixture.snapshot()).toEqual(before);
  });
  it('cannot save against an actual foreign-tenant parent case', async () => {
    await fixture.prepareForeign();
    const before = await fixture.snapshot();
    const response = await request(app.getHttpServer())
      .post(savePath)
      .set(headers())
      .send({ ...humanBody('assinatura'), case_id: FOREIGN_CASE });
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('RAIT.TENANT_MISMATCH');
    expect(await fixture.snapshot()).toEqual(before);
  });
  it('F01 cannot omit its idempotency header', async () => {
    const h = headers();
    delete (h as Partial<typeof h>)['idempotency-key'];
    const before = await fixture.snapshot();
    const response = await request(app.getHttpServer())
      .post(triagePath())
      .set(h)
      .send({});
    expect(response.status).toBe(400);
    expect(await fixture.snapshot()).toEqual(before);
  });
  it('reject cannot omit the operator legal basis or use the legacy body field', async () => {
    const match = await saveAll([false, true, true]);
    const before = await fixture.snapshot();
    for (const body of [
      { reason: 'ilegitimo' },
      { non_admission_reason: 'ilegitimo' },
    ]) {
      const response = await request(app.getHttpServer())
        .post(`/v1/inf/rait/cases/${JW_CASE}/commands/non-admission`)
        .set(headers('rait-analyst', match))
        .send(body);
      expect(response.status).toBe(400);
      expect(await fixture.snapshot()).toEqual(before);
    }
  });
});

// Delivery review cycle1: an attempt is bound to the observed parent version.
describe('review1 current-version persistence and actual audit attribution', () => {
  it('saves all three, edits one, then A→B→A with fresh versions and persisted verdicts', async () => {
    let match = (await start()).headers.etag;
    for (const [batch, signature] of [true, false, true].entries()) {
      for (const criterion of HUMAN_CRITERIA) {
        const body = humanBody(
          criterion,
          criterion === 'assinatura' ? signature : true,
        );
        const response = await request(app.getHttpServer())
          .post(savePath)
          .set(
            headers(
              'rait-analyst',
              match,
              `r25-jw01-resave-${criterion}-${match}`,
            ),
          )
          .send(body);
        expect(response.status, JSON.stringify(response.body)).toBe(200);
        expect(response.body.data).toMatchObject(body);
        match = response.headers.etag;
      }
      expect(match).toBe(`"${5 + batch * 3}"`);
      const persisted = await fixture.snapshot();
      expect(persisted.caso.version).toBe(5 + batch * 3);
      expect(
        persisted.verdicts.filter((row) => row.criterion === 'assinatura'),
      ).toMatchObject([{ verdict: signature }]);
      expect(persisted.verdicts).toHaveLength(4);
    }
  });
  for (const operation of ['triage', 'save', 'admit', 'reject'] as const) {
    it(`${operation}: same key with changed If-Match is 409 without replaying stale success`, async () => {
      const match =
        operation === 'triage'
          ? '"1"'
          : operation === 'save'
            ? (await start()).headers.etag
            : await saveAll(
                operation === 'reject'
                  ? [true, false, true]
                  : [true, true, true],
              );
      const path =
        operation === 'triage'
          ? triagePath()
          : operation === 'save'
            ? savePath
            : `/v1/inf/rait/cases/${JW_CASE}/commands/${operation === 'admit' ? 'admit' : 'non-admission'}`;
      const body =
        operation === 'save'
          ? humanBody('assinatura')
          : operation === 'reject'
            ? {
                reason: 'sem_assinatura',
                legalBasis: 'Art. 4º III — fundamento do operador.',
              }
            : {};
      const key = `r25-jw01-version-collision-${operation}`;
      const first = await request(app.getHttpServer())
        .post(path)
        .set(headers('rait-analyst', match, key))
        .send(body);
      expect(first.status, JSON.stringify(first.body)).toBe(200);
      const before = await fixture.snapshot();
      const originalRetry = await request(app.getHttpServer())
        .post(path)
        .set(headers('rait-analyst', match, key))
        .send(body);
      expect(originalRetry.status, JSON.stringify(originalRetry.body)).toBe(
        200,
      );
      expect(originalRetry.body).toEqual(first.body);
      expect(originalRetry.headers.etag).toBe(first.headers.etag);
      expect(await fixture.snapshot()).toEqual(before);
      const retry = await request(app.getHttpServer())
        .post(path)
        .set(headers('rait-analyst', first.headers.etag, key))
        .send(body);
      expect(retry.status, JSON.stringify(retry.body)).toBe(409);
      expect(retry.body.code).toBe('RAIT.IDEMPOTENCY_REPLAY');
      expect(await fixture.snapshot()).toEqual(before);
    });
  }
  for (const operation of ['triage', 'save'] as const) {
    it(`${operation}: same original key/version but another authorized actor conflicts`, async () => {
      const match =
        operation === 'triage' ? '"1"' : (await start()).headers.etag;
      const path = operation === 'triage' ? triagePath() : savePath;
      const body = operation === 'triage' ? {} : humanBody('assinatura');
      const key = `r25-jw01-actor-collision-${operation}`;
      const first = await request(app.getHttpServer())
        .post(path)
        .set(headers('rait-analyst', match, key))
        .send(body);
      expect(first.status).toBe(200);
      const before = await fixture.snapshot();
      const retry = await request(app.getHttpServer())
        .post(path)
        .set(headers('rait-secretary', match, key))
        .send(body);
      expect(retry.status).toBe(409);
      expect(retry.body.code).toBe('RAIT.IDEMPOTENCY_REPLAY');
      expect(await fixture.snapshot()).toEqual(before);
    });
  }
  for (const [role, expectedRole] of [
    ['rait-secretary', 'rait-secretary'],
    ['technical-admin', 'technical-admin'],
    ['technical-admin,rait-secretary', 'rait-secretary'],
  ] as const) {
    it(`${role}: triage and human save audit the actual authenticated role`, async () => {
      const marker = await fixture.owner.query(
        'select coalesce(max(event_id),0)::text as id from audit.events where tenant_id=$1',
        [RAIT_TENANT],
      );
      const first = await request(app.getHttpServer())
        .post(triagePath())
        .set(headers(role))
        .send({});
      expect(first.status, JSON.stringify(first.body)).toBe(200);
      const second = await request(app.getHttpServer())
        .post(savePath)
        .set(headers(role, first.headers.etag))
        .send(humanBody('assinatura'));
      expect(second.status, JSON.stringify(second.body)).toBe(200);
      const audit = await fixture.owner.query(
        `select actor_id,actor_role,action from audit.events where tenant_id=$1 and event_id>$2 order by event_id`,
        [RAIT_TENANT, marker.rows[0].id],
      );
      expect(audit.rows).toEqual([
        {
          actor_id: role === 'rait-secretary' ? RAIT_SECRETARY : RAIT_ACTOR,
          actor_role: expectedRole,
          action: 'INF_RAIT_CASE_TRIAGE',
        },
        {
          actor_id: role === 'rait-secretary' ? RAIT_SECRETARY : RAIT_ACTOR,
          actor_role: expectedRole,
          action: 'INF_RAIT_ADMISSIBILITY_CREATE',
        },
      ]);
    });
  }
});
