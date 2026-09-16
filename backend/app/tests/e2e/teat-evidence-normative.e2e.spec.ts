import { randomUUID } from 'node:crypto';
import type { NestFactory } from '@nestjs/core';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * CTG-0003 §4/§6/§10 (R-0008, TASK-0006) — C-0003-39…45: as rotas de
 * evidência, custódia, bodycam e pacote normativo sob o app unificado, com a
 * guarda de política nos dois sentidos (papel mínimo → 200/201, papel fora
 * da regra → 403) e a fronteira de rota `v1/ops/…`/`v1/inf/…` (§1).
 *
 * A maioria dessas rotas ainda não existe hoje (nascem em TASK-0007, §11);
 * até lá cada caso falha pelo comportamento ausente — 404 onde se espera
 * 200/201/403. O controlador `evidence-custody.controller.ts` e
 * `frozen-snapshot.controller.ts` já montam sob `v1/ops/*` (nota do maestro,
 * confirmado por leitura direta do arquivo) — C-0003-45 cobre essa fronteira
 * por enumeração das rotas registradas, não por tentativa de requisição.
 *
 * O perfil local resolve `DETRAN_LOCAL_TENANT_ID`/`DETRAN_LOCAL_ACTOR_ID` no
 * carregamento do módulo, então as duas variáveis são definidas **antes** do
 * `await import('../../src/app.module.js')` (mesmo padrão de
 * `teat-field-sync.e2e.spec.ts`).
 */

const { Client } = pg;

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const EVIDENCE_BODYCAM_VALIDATED = '00000000-0000-7000-8000-0000ef000001';
const EVIDENCE_QUARANTINED = '00000000-0000-7000-8000-0000ef000004';
const ACCESS_REQUEST_APPROVED = '00000000-0000-7000-8000-0000ef400002';
const CATALOG_ACTIVE = '00000000-0000-7000-8000-0000e0000001';

const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const client = new Client({ connectionString });

let app: Awaited<ReturnType<typeof NestFactory.create>>;
let startedAt: string;
const previousEnv: Record<string, string | undefined> = {};
/** Pacotes e enquadramentos criados pelos casos de C-0003-43b/c (OD-T52); removidos no afterAll. */
const createdPackageIds: string[] = [];
const createdFramingIds: string[] = [];

/**
 * O kernel aplica `@Idempotent()` a toda ação não-leitura (CTG-0001 §13
 * item 6): corpo divergente sob a mesma `Idempotency-Key` devolve 422. Cada
 * requisição leva uma chave nova.
 */
function headers(role: string): Record<string, string> {
  process.env.DETRAN_LOCAL_ROLES = role;
  return {
    authorization: 'Bearer local',
    'x-tenant-id': TENANT_ID,
    'idempotency-key': randomUUID(),
  };
}

function server() {
  return app.getHttpServer();
}

beforeAll(async () => {
  for (const key of [
    'DETRAN_RUNTIME_PROFILE',
    'DETRAN_LOCAL_TENANT_ID',
    'DETRAN_LOCAL_ACTOR_ID',
    'DETRAN_LOCAL_ROLES',
  ]) {
    previousEnv[key] = process.env[key];
  }
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_TENANT_ID = TENANT_ID;
  process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_ID;
  process.env.DETRAN_LOCAL_ROLES = 'field-agent';

  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  const now = await client.query<{ now: string }>('select now()::text as now');
  startedAt = now.rows[0]!.now;

  const { NestFactory: factory } = await import('@nestjs/core');
  const { AppModule } = await import('../../src/app.module.js');
  app = await factory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();
});

afterAll(async () => {
  await app?.close();
  await client.query(`select set_config('app.role', 'owner', false)`);
  // Devolve as fixtures de 27-fixtures-teat-evidence.sql ao estado semeado.
  await client.query(
    `delete from ops.storage_intent where tenant_id = $1 and created_at > $2`,
    [TENANT_ID, startedAt],
  );
  await client.query(
    `delete from ops.evidence_evidence
       where tenant_id = $1 and created_at > $2
         and id not in ($3, $4)`,
    [TENANT_ID, startedAt, EVIDENCE_BODYCAM_VALIDATED, EVIDENCE_QUARANTINED],
  );
  await client.query(
    `update ops.evidence_access_request set status = 'approved', delivery_media_ref = null, delivered_at = null
      where id = $1`,
    [ACCESS_REQUEST_APPROVED],
  );
  if (createdFramingIds.length > 0) {
    await client.query(
      `delete from inf.normative_framing where id = any($1::uuid[])`,
      [createdFramingIds],
    );
  }
  if (createdPackageIds.length > 0) {
    await client.query(
      `delete from inf.normative_mobile_package where id = any($1::uuid[])`,
      [createdPackageIds],
    );
  }
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    TENANT_ID,
  ]);
  await client.end();
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('CTG-0003 §4.1 — upload-intents: papel mínimo × papel fora da regra (C-0003-39)', () => {
  it('C-0003-39 — dado DETRAN_LOCAL_ROLES=field-agent quando POST /v1/ops/evidence/upload-intents então 200', async () => {
    const response = await request(server())
      .post('/v1/ops/evidence/upload-intents')
      .set(headers('field-agent'))
      .send({
        traffic_agency_id: '00000000-0000-7000-8000-0000e2000001',
        local_evidence_id: '00000000-0000-7000-8000-0000ef900010',
        idempotency_key: `e2e-upload-${randomUUID().slice(0, 8)}`,
        entity_type: 'ait',
        entity_id: '00000000-0000-7000-8000-0000f0000001',
        evidence_type: 'foto',
        origin: 'campo',
        mime_type: 'image/jpeg',
        size_bytes: 204800,
        hash_algorithm: 'sha256',
        hash_value: `sha256:${randomUUID().replace(/-/g, '').padEnd(64, '0')}`,
        filename: 'e2e-foto.jpg',
      });
    expect(response.status).toBe(200);
  });

  it('C-0003-39 — dado DETRAN_LOCAL_ROLES=field-supervisor quando POST /v1/ops/evidence/upload-intents então 403', async () => {
    const response = await request(server())
      .post('/v1/ops/evidence/upload-intents')
      .set(headers('field-supervisor'))
      .send({});
    expect(response.status).toBe(403);
  });
});

describe('CTG-0003 §4.3 — validate: papel mínimo × papel fora da regra (C-0003-40)', () => {
  it('C-0003-40 — dado DETRAN_LOCAL_ROLES=processing-operator quando POST /v1/ops/evidence/{id}/validate então 200', async () => {
    const response = await request(server())
      .post(`/v1/ops/evidence/${EVIDENCE_BODYCAM_VALIDATED}/validate`)
      .set(headers('processing-operator'))
      .send({ decision: 'valid' });
    expect(response.status).toBe(200);
  });

  it('C-0003-40 — dado DETRAN_LOCAL_ROLES=field-agent quando POST /v1/ops/evidence/{id}/validate então 403', async () => {
    const response = await request(server())
      .post(`/v1/ops/evidence/${EVIDENCE_BODYCAM_VALIDATED}/validate`)
      .set(headers('field-agent'))
      .send({ decision: 'valid' });
    expect(response.status).toBe(403);
  });
});

describe('CTG-0003 §4.7 — purge-expired-unverified: papel mínimo × papel fora da regra (C-0003-41)', () => {
  it('C-0003-41 — dado DETRAN_LOCAL_ROLES=technical-admin quando POST /v1/ops/evidence/maintenance/purge-expired-unverified então 200', async () => {
    const response = await request(server())
      .post('/v1/ops/evidence/maintenance/purge-expired-unverified')
      .set(headers('technical-admin'))
      .send({});
    expect(response.status).toBe(200);
  });

  it('C-0003-41 — dado DETRAN_LOCAL_ROLES=AUDITOR quando POST /v1/ops/evidence/maintenance/purge-expired-unverified então 403', async () => {
    const response = await request(server())
      .post('/v1/ops/evidence/maintenance/purge-expired-unverified')
      .set(headers('AUDITOR'))
      .send({});
    expect(response.status).toBe(403);
  });
});

describe('CTG-0003 §4.10 — evidence-access-requests/{id}/approve: papel mínimo × papel fora da regra (C-0003-42)', () => {
  it('C-0003-42 — dado DETRAN_LOCAL_ROLES=traffic-authority quando POST /v1/ops/evidence-access-requests/{id}/approve sobre o pedido …ef400002 (já approved) então 409 TEAT.EVIDENCE_ACCESS_STATE_INVALID (papel mínimo alcança o comando; a guarda de estado é quem barra)', async () => {
    const response = await request(server())
      .post(
        `/v1/ops/evidence-access-requests/${ACCESS_REQUEST_APPROVED}/approve`,
      )
      .set(headers('traffic-authority'))
      .send({ legal_basis: 'Art. 13 da Portaria 003/2026' });
    expect(response.status).toBe(409);
    expect(response.body.code).toBe('TEAT.EVIDENCE_ACCESS_STATE_INVALID');
  });

  it('C-0003-42 — dado DETRAN_LOCAL_ROLES=processing-operator quando POST /v1/ops/evidence-access-requests/{id}/approve então 403', async () => {
    const response = await request(server())
      .post(
        `/v1/ops/evidence-access-requests/${ACCESS_REQUEST_APPROVED}/approve`,
      )
      .set(headers('processing-operator'))
      .send({ legal_basis: 'Art. 13 da Portaria 003/2026' });
    expect(response.status).toBe(403);
  });
});

describe('CTG-0003 §6.5/§6.6 — mobile-packages sync-metadata e content (C-0003-43)', () => {
  it('C-0003-43a — dado DETRAN_LOCAL_ROLES=field-agent quando GET /v1/inf/normative/mobile-packages/sync-metadata então 200', async () => {
    const response = await request(server())
      .get('/v1/inf/normative/mobile-packages/sync-metadata')
      .set(headers('field-agent'));
    expect(response.status).toBe(200);
  });

  /**
   * OD-T52 (adenda CTG-0003 §13, 2026-09-16): a guarda de integridade do
   * `content` corre **sempre** — não há exceção por proveniência. A fixture
   * `…e7000001` tem `manifest_hash` placeholder e nunca bate com a
   * recomposição, então este caso gera o pacote pelo próprio backend
   * (`generate` → `publish` → `content`) em vez de usar a fixture, que
   * continua servindo só `sync-metadata`.
   */
  it('C-0003-43b — dado um pacote gerado e publicado pelo backend quando GET /v1/inf/normative/mobile-packages/{id}/content então 200 com manifest_hash igual ao gerado e signature.kind=local-unsigned', async () => {
    const generateResponse = await request(server())
      .post('/v1/inf/normative/mobile-packages/generate')
      .set(headers('agency-admin'))
      .send({
        catalog_id: CATALOG_ACTIVE,
        package_version: `e2e-content-${randomUUID().slice(0, 8)}`,
      });
    expect(generateResponse.status).toBe(201);
    const packageId = generateResponse.body.id as string;
    const generatedHash = generateResponse.body.manifest_hash as string;
    createdPackageIds.push(packageId);

    const publishResponse = await request(server())
      .post(`/v1/inf/normative/mobile-packages/${packageId}/publish`)
      .set(headers('agency-admin'))
      .send({});
    expect(publishResponse.status).toBe(200);

    const contentResponse = await request(server())
      .get(`/v1/inf/normative/mobile-packages/${packageId}/content`)
      .set(headers('field-agent'));
    expect(contentResponse.status).toBe(200);
    expect(contentResponse.body).toMatchObject({
      manifest_hash: generatedHash,
      signature: expect.objectContaining({ kind: 'local-unsigned' }),
    });
  });

  it('C-0003-43c — dado o catálogo alterado (novo enquadramento ativo) depois da geração então GET .../content então 422 TEAT.PACKAGE_MANIFEST_MISMATCH', async () => {
    const generateResponse = await request(server())
      .post('/v1/inf/normative/mobile-packages/generate')
      .set(headers('agency-admin'))
      .send({
        catalog_id: CATALOG_ACTIVE,
        package_version: `e2e-mismatch-${randomUUID().slice(0, 8)}`,
      });
    expect(generateResponse.status).toBe(201);
    const packageId = generateResponse.body.id as string;
    createdPackageIds.push(packageId);

    const publishResponse = await request(server())
      .post(`/v1/inf/normative/mobile-packages/${packageId}/publish`)
      .set(headers('agency-admin'))
      .send({});
    expect(publishResponse.status).toBe(200);

    // Altera o catálogo sob o pacote já gerado: um novo enquadramento ativo
    // muda o manifesto recomposto sem tocar em manifest_hash gravado.
    const extraFramingId = randomUUID();
    createdFramingIds.push(extraFramingId);
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(`select set_config('app.tenant_id', $1, false)`, [
      TENANT_ID,
    ]);
    await client.query(
      `insert into inf.normative_framing
         (id, tenant_id, catalog_id, framing_code, description, approach_class, status)
       values ($1, $2, $3, $4, 'Enquadramento extra do e2e (C-0003-43c)', 'caso_1', 'active')`,
      [
        extraFramingId,
        TENANT_ID,
        CATALOG_ACTIVE,
        `E2E-${extraFramingId.slice(0, 8)}`,
      ],
    );

    const contentResponse = await request(server())
      .get(`/v1/inf/normative/mobile-packages/${packageId}/content`)
      .set(headers('field-agent'));
    expect(contentResponse.status).toBe(422);
    expect(contentResponse.body.code).toBe('TEAT.PACKAGE_MANIFEST_MISMATCH');
  });
});

/**
 * CTG-0003 §6.5/§14.2 (adenda do maestro, 2026-09-16, delivery-review ciclo 1
 * achado §14.2) — TASK-0006 iteração 3: `GET .../content` carrega
 * `ETag: "<manifest_hash>"`; `If-None-Match` igual devolve 304 sem corpo;
 * `If-None-Match` diferente devolve 200 de novo. Mesmo desenho de pacote do
 * C-0003-43b (gerado pelo backend, nunca a fixture `…e7000001`).
 */
describe('CTG-0003 §14.2 — mobile-packages/{id}/content: ETag e If-None-Match', () => {
  it('dado um pacote gerado e publicado então GET .../content traz ETag: "<manifest_hash>"; If-None-Match igual devolve 304 sem corpo; If-None-Match diferente devolve 200', async () => {
    const generateResponse = await request(server())
      .post('/v1/inf/normative/mobile-packages/generate')
      .set(headers('agency-admin'))
      .send({
        catalog_id: CATALOG_ACTIVE,
        package_version: `e2e-etag-${randomUUID().slice(0, 8)}`,
      });
    expect(generateResponse.status).toBe(201);
    const packageId = generateResponse.body.id as string;
    createdPackageIds.push(packageId);

    const publishResponse = await request(server())
      .post(`/v1/inf/normative/mobile-packages/${packageId}/publish`)
      .set(headers('agency-admin'))
      .send({});
    expect(publishResponse.status).toBe(200);

    const first = await request(server())
      .get(`/v1/inf/normative/mobile-packages/${packageId}/content`)
      .set(headers('field-agent'));
    expect(first.status).toBe(200);
    const etag = first.headers.etag as string;
    expect(etag).toBe(`"${first.body.manifest_hash}"`);

    const notModified = await request(server())
      .get(`/v1/inf/normative/mobile-packages/${packageId}/content`)
      .set(headers('field-agent'))
      .set('if-none-match', etag);
    expect(notModified.status).toBe(304);
    expect(notModified.body).toEqual({});

    const changed = await request(server())
      .get(`/v1/inf/normative/mobile-packages/${packageId}/content`)
      .set(headers('field-agent'))
      .set('if-none-match', '"sha256:outro-hash-qualquer"');
    expect(changed.status).toBe(200);
    expect(changed.body.manifest_hash).toBe(first.body.manifest_hash);
  });
});

describe('CTG-0003 §6.2 — mobile-packages/generate: papel mínimo × papel fora da regra (C-0003-44)', () => {
  it('C-0003-44 — dado DETRAN_LOCAL_ROLES=agency-admin quando POST /v1/inf/normative/mobile-packages/generate então 201', async () => {
    const response = await request(server())
      .post('/v1/inf/normative/mobile-packages/generate')
      .set(headers('agency-admin'))
      .send({
        catalog_id: CATALOG_ACTIVE,
        package_version: `e2e-${randomUUID().slice(0, 8)}`,
      });
    expect(response.status).toBe(201);
    createdPackageIds.push(response.body.id as string);
  });

  it('C-0003-44 — dado DETRAN_LOCAL_ROLES=field-agent quando POST /v1/inf/normative/mobile-packages/generate então 403', async () => {
    const response = await request(server())
      .post('/v1/inf/normative/mobile-packages/generate')
      .set(headers('field-agent'))
      .send({ catalog_id: CATALOG_ACTIVE, package_version: 'e2e-denied' });
    expect(response.status).toBe(403);
  });
});

describe('CTG-0003 §1 — fronteira de rota v1/ops/* (C-0003-45)', () => {
  /**
   * Mesmo padrão de `teat-field-sync.e2e.spec.ts` C-0002-50: a forma da
   * propriedade mudou entre versões do Express (`router` na 5, `_router` na
   * 4), então as duas são aceitas.
   */
  function mountedPaths(): string[] {
    const instance = app.getHttpAdapter().getInstance() as {
      router?: { stack?: { route?: { path?: string } }[] };
      _router?: { stack?: { route?: { path?: string } }[] };
    };
    const stack = instance.router?.stack ?? instance._router?.stack ?? [];
    return stack
      .map((layer) => layer.route?.path)
      .filter((path): path is string => typeof path === 'string');
  }

  it('C-0003-45 — dado o app montado quando as rotas manuscritas de ops/evidence e ops/snapshots são enumeradas então todas começam por v1/ops/ (nenhuma rota /ops/evidence* ou /ops/snapshots* sem o prefixo)', () => {
    const offending = mountedPaths().filter(
      (path) =>
        (path.startsWith('/ops/evidence') ||
          path.startsWith('/ops/snapshots') ||
          path === '/ops/evidence' ||
          path === '/ops/snapshots') &&
        !path.startsWith('/v1/'),
    );
    expect(
      offending,
      `rotas manuscritas de evidence/snapshots fora de /v1/ops/ (§1): ${offending.join(', ')}`,
    ).toEqual([]);
  });

  it('C-0003-45 — dado as rotas de evidence e snapshots já montadas então todas começam efetivamente por /v1/ops/', () => {
    const evidenceOrSnapshots = mountedPaths().filter(
      (path) => path.includes('ops/evidence') || path.includes('ops/snapshots'),
    );
    for (const path of evidenceOrSnapshots) {
      expect(path.startsWith('/v1/ops/')).toBe(true);
    }
  });
});
