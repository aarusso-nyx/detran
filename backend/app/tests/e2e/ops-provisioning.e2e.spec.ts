import 'reflect-metadata';
import type { NestFactory } from '@nestjs/core';
import request from 'supertest';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import {
  ProofHarness,
  TENANT_A,
  NOW,
} from '../../../domains/ops/provisioning/tests/integration/harness.js';

const previousEnv: Record<string, string | undefined> = {};
const HTTP_ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
let app: Awaited<ReturnType<typeof NestFactory.create>>;
let h: ProofHarness;

beforeAll(async () => {
  for (const key of [
    'DETRAN_RUNTIME_PROFILE',
    'DETRAN_LOCAL_TENANT_ID',
    'DETRAN_LOCAL_ACTOR_ID',
    'DETRAN_LOCAL_ROLES',
  ])
    previousEnv[key] = process.env[key];
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_TENANT_ID = TENANT_A;
  process.env.DETRAN_LOCAL_ACTOR_ID = HTTP_ACTOR_ID;
  process.env.DETRAN_LOCAL_ROLES = 'technical-admin';
  const { NestFactory: factory } = await import('@nestjs/core');
  const { AppModule } = await import('../../src/app.module.js');
  app = await factory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();
}, 30000);
beforeEach(async () => {
  h = new ProofHarness();
  await h.open();
  process.env.DETRAN_LOCAL_ROLES = 'technical-admin';
});
afterEach(async () => {
  await h.close();
});
afterAll(async () => {
  await app?.close();
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function post(path: string, body: Record<string, unknown>, etag = '"1"') {
  return request(app.getHttpServer())
    .post(`/v1/ops/provisioning/${path}`)
    .set('authorization', 'Bearer local')
    .set('x-tenant-id', TENANT_A)
    .set('if-match', etag)
    .set('idempotency-key', String(body.idempotency_key))
    .send(body);
}

async function currentReadiness() {
  const response = await request(app.getHttpServer())
    .get(`/v1/ops/provisioning/devices/${h.deviceId}/readiness`)
    .set('authorization', 'Bearer local')
    .set('x-tenant-id', TENANT_A);
  expect(response.status, JSON.stringify(response.body)).toBe(200);
  expect(response.body.device_id).toBe(h.deviceId);
  expect(response.headers.etag).toMatch(/^"[^"\r\n]+"$/u);
  return response;
}

describe('P0/P2/P5/P6 — HTTP real e contrato público', () => {
  // Identity-based positive A5 vectors live in the domain suite, where the
  // authenticated principal carries explicit claims. This local HTTP adapter
  // has no supported agency/device claim-injection seam; headers cannot grant it.
  it.each(['challenge', 'register', 'issue', 'receipt', 'revoke', 'reconcile'])(
    'dado POST %s sem If-Match quando chega à API então recusa 428 canônico sem efeitos',
    async (operation) => {
      const paths: Record<string, string> = {
        challenge: `devices/${h.deviceId}/key-challenges`,
        register: `devices/${h.deviceId}/keys`,
        issue: 'packages',
        receipt: `packages/${h.packageId}/receipts`,
        revoke: `grants/${h.grantId}/revoke`,
        reconcile: `grants/${h.grantId}/reconcile`,
      };
      const before = await h.snapshot();
      const response = await request(app.getHttpServer())
        .post(`/v1/ops/provisioning/${paths[operation]}`)
        .set('authorization', 'Bearer local')
        .set('x-tenant-id', TENANT_A)
        .set('idempotency-key', `${h.prefix}-missing`);
      expect(response.status, JSON.stringify(response.body)).toBe(428);
      expect(response.body).toMatchObject({ code: 'TEAT.IF_MATCH_REQUIRED' });
      expect(await h.snapshot()).toEqual(before);
    },
  );

  it('dado payload inválido quando challenge recebe versão corrente então recusa 400 sem artefato parcial', async () => {
    const readiness = await currentReadiness();
    const before = await h.snapshot();
    const response = await post(
      `devices/${h.deviceId}/key-challenges`,
      {},
      readiness.headers.etag,
    );
    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body).toMatchObject({ code: 'TEAT.VALIDATION_FAILED' });
    expect(await h.snapshot()).toEqual(before);
  });

  it('dado challenge válido quando API recebe retry então devolve corpo público e ETag persistidos idênticos', async () => {
    await h.owner.query('delete from ops.device_key where id=$1', [h.keyId]);
    const readiness = await currentReadiness();
    expect(readiness.body.ready).toBe(false);
    const body = { idempotency_key: `${h.prefix}-challenge` };
    const first = await post(
      `devices/${h.deviceId}/key-challenges`,
      body,
      readiness.headers.etag,
    );
    expect(first.status, JSON.stringify(first.body)).toBe(201);
    expect(first.headers.etag).toMatch(/^"[^"\r\n]+"$/u);
    expect(first.body).toEqual({
      challenge_id: expect.stringMatching(/^[\da-f-]{36}$/u),
      device_id: h.deviceId,
      challenge: expect.stringMatching(/\S/u),
      expires_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/u),
    });
    const rows = await h.owner.query(
      'select response_body_json,response_etag from ops.provisioning_command_idempotency where idempotency_key=$1',
      [body.idempotency_key],
    );
    expect(rows.rows).toEqual([
      { response_body_json: first.body, response_etag: first.headers.etag },
    ]);
    const before = await h.snapshot();
    const replay = await post(
      `devices/${h.deviceId}/key-challenges`,
      body,
      readiness.headers.etag,
    );
    expect(replay.status).toBe(201);
    expect(replay.body).toEqual(first.body);
    expect(replay.headers.etag).toBe(first.headers.etag);
    expect(await h.snapshot()).toEqual(before);
    expect(JSON.stringify(first.body)).not.toMatch(
      /private[_-]?key|refresh[_-]?token|protected[_-]?value/iu,
    );
  });

  it('dado ETag obsoleto quando API recebe challenge então recusa 412 e mantém o banco', async () => {
    const old = await currentReadiness();
    await h.owner.query(
      'update ops.device_key set version=version+1 where id=$1',
      [h.keyId],
    );
    const current = await currentReadiness();
    expect(current.headers.etag).not.toBe(old.headers.etag);
    const before = await h.snapshot();
    const response = await post(
      `devices/${h.deviceId}/key-challenges`,
      { idempotency_key: `${h.prefix}-stale` },
      old.headers.etag,
    );
    expect(response.status).toBe(412);
    expect(response.body).toMatchObject({ code: 'TEAT.VERSION_CONFLICT' });
    expect(await h.snapshot()).toEqual(before);
  });

  it('dada revogação autorizada quando API responde então status é 200 corpo adere ao contrato e ETag representa grant persistido', async () => {
    const body = h.body('revoke');
    const response = await post(`grants/${h.grantId}/revoke`, body);
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const grant = await h.owner.query(
      'select status, revoked_at from ops.offline_authorization_grant where id=$1',
      [h.grantId],
    );
    expect(grant.rows).toEqual([
      { status: 'revoked', revoked_at: expect.any(Date) },
    ]);
    expect(response.body).toEqual({
      grant_id: h.grantId,
      device_id: h.deviceId,
      revocation_epoch: 1,
      revoked_at: grant.rows[0].revoked_at.toISOString(),
    });
    expect(response.headers.etag).toMatch(/^"[^"\r\n]+"$/u);
    const decision = await h.owner.query(
      'select reason_code, decision_by_subject, revocation_epoch::int, decided_at from ops.device_revocation where grant_id=$1',
      [h.grantId],
    );
    expect(decision.rows).toEqual([
      {
        reason_code: body.reason_code,
        decision_by_subject: HTTP_ACTOR_ID,
        revocation_epoch: 1,
        decided_at: new Date(NOW),
      },
    ]);
    const persisted = await h.owner.query(
      'select response_body_json,response_etag from ops.provisioning_command_idempotency where idempotency_key=$1',
      [body.idempotency_key],
    );
    expect(persisted.rows).toEqual([
      {
        response_body_json: response.body,
        response_etag: response.headers.etag,
      },
    ]);
    const next = await post(
      `grants/${h.grantId}/revoke`,
      {
        ...body,
        idempotency_key: `${h.prefix}-second-revoke`,
        revocation_epoch: 2,
      },
      response.headers.etag,
    );
    expect(next.status, JSON.stringify(next.body)).toBe(200);
    expect(next.body.revocation_epoch).toBe(2);
    expect(next.headers.etag).not.toBe(response.headers.etag);
  });

  it('dado dispositivo sem chave quando API consulta readiness então diagnostica recurso ausente sem cabeçalhos de comando', async () => {
    await h.owner.query('delete from ops.device_key where id=$1', [h.keyId]);
    const response = await request(app.getHttpServer())
      .get(`/v1/ops/provisioning/devices/${h.deviceId}/readiness`)
      .set('authorization', 'Bearer local')
      .set('x-tenant-id', TENANT_A);
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body).toMatchObject({
      device_id: h.deviceId,
      ready: false,
      blockers: expect.arrayContaining([
        { code: expect.stringMatching(/\S/u), resource: 'device_key' },
      ]),
    });
    expect(Object.keys(response.body).sort()).toEqual([
      'blockers',
      'device_id',
      'evaluated_at',
      'ready',
      'remaining_acts',
      'remaining_numbering_count',
    ]);
    expect(response.headers.etag).toMatch(/^"[^"\r\n]+"$/u);
  });

  it.each(['ADMIN', 'GESTOR_DETRAN', 'SUPORTE'])(
    'dado %s quando tenta challenge por wildcard então recusa sem efeito',
    async (role) => {
      const readiness = await currentReadiness();
      process.env.DETRAN_LOCAL_ROLES = role;
      const before = await h.snapshot();
      const response = await post(
        `devices/${h.deviceId}/key-challenges`,
        {
          idempotency_key: `${h.prefix}-denied`,
        },
        readiness.headers.etag,
      );
      expect(response.status, JSON.stringify(response.body)).toBe(403);
      expect(await h.snapshot()).toEqual(before);
    },
  );
});
