import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import pg from 'pg';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../../src/app.module.js';

/**
 * WP-T0 gate: the handwritten AIT lifecycle commands must be mounted by the
 * unified app (AitModule registers AitCommandsController + AitLifecycleService,
 * AppModule mounts the inf modules) and answer on
 * `POST /v1/inf/ait/aits/{id}/finalize` under the local runtime profile.
 */
const { Client } = pg;
// Same ids as the local runtime profile defaults (detran-runtime.ts), which are
// resolved at import time.
const tenantId = '00000000-0000-7000-8000-000000000001';
const actorId = '00000000-0000-4000-8000-000000000002';
const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const client = new Client({ connectionString });
let app: Awaited<ReturnType<typeof NestFactory.create>>;
let fixture: {
  catalogId: string;
  framingId: string;
  vehicleId: string;
  personId: string;
};

beforeAll(async () => {
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_ROLES = 'field-agent';
  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `insert into auth.tenants (id, slug, name) values ($1, 'local-e2e', 'Local E2E')
     on conflict (id) do update set name = excluded.name`,
    [tenantId],
  );
  await client.query(
    `insert into auth.users (id, tenant_id, email, display_name)
     values ($1, $2, 'local-e2e@detran.invalid', 'Local E2E')
     on conflict (id) do update set tenant_id = excluded.tenant_id`,
    [actorId, tenantId],
  );
  await client.query(
    `insert into auth.memberships (tenant_id, user_id) values ($1, $2)
     on conflict (tenant_id, user_id) do update set is_active = true`,
    [tenantId, actorId],
  );
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  await client.query(`select set_config('app.actor_id', $1, false)`, [actorId]);
  const catalog = await client.query<{ id: string }>(
    `insert into inf.normative_catalog (tenant_id, traffic_agency_id, name, catalog_type, version, valid_from, status)
     values ($1, $1, 'CTB', 'traffic-code', $2, '2026-01-01', 'active') returning id`,
    [tenantId, `e2e-${randomUUID().slice(0, 8)}`],
  );
  const framing = await client.query<{ id: string }>(
    `insert into inf.normative_framing (tenant_id, catalog_id, framing_code, description, approach_class, status)
     values ($1, $2, '74550', 'Infraction framing', 'caso_2', 'active') returning id`,
    [tenantId, catalog.rows[0]!.id],
  );
  const vehicle = await client.query<{ id: string }>(
    `insert into ops.snapshots_vehicle (tenant_id, plate, source) values ($1, 'BRA2E19', 'e2e') returning id`,
    [tenantId],
  );
  const person = await client.query<{ id: string }>(
    `insert into ops.snapshots_person (tenant_id, person_type, name, source) values ($1, 'natural', 'Driver', 'e2e') returning id`,
    [tenantId],
  );
  fixture = {
    catalogId: catalog.rows[0]!.id,
    framingId: framing.rows[0]!.id,
    vehicleId: vehicle.rows[0]!.id,
    personId: person.rows[0]!.id,
  };
  app = await NestFactory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();
});

afterAll(async () => {
  await app?.close();
  await client.end();
  delete process.env.DETRAN_LOCAL_ROLES;
});

/**
 * Shared by both `describe` blocks in this file (module scope, not nested
 * inside the first `describe`) so a test in the second block never throws a
 * `headers is not defined` `ReferenceError` — which, left uncaught mid-test,
 * skips this file's own env-var cleanup and can leak `DETRAN_LOCAL_ROLES`/
 * `DETRAN_LOCAL_DECISION_BODY` into whichever e2e spec file vitest runs
 * next (`fileParallelism: false` keeps every e2e file in the same process).
 */
const headers = () => ({
  authorization: 'Bearer local',
  'x-tenant-id': tenantId,
  'idempotency-key': randomUUID(),
});

/**
 * Also module scope (same reasoning as `headers` above): used by both the
 * `CTG-0001 §4` and `CTG-0001 §13 item 6` describe blocks.
 */
async function createDraft(currentStatus = 'RASCUNHO_OFFLINE') {
  const server = app.getHttpServer();
  process.env.DETRAN_LOCAL_ROLES = 'field-agent';
  const created = await request(server)
    .post('/v1/inf/ait/aits')
    .set(headers())
    .send({
      traffic_agency_id: tenantId,
      ait_number: `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-6),
      series: 'E',
      agent_id: randomUUID(),
      shift_id: randomUUID(),
      device_id: randomUUID(),
      framing_id: fixture.framingId,
      catalog_id: fixture.catalogId,
      infraction_at: '2026-09-13T10:00:00.000Z',
      issued_at: '2026-09-13T10:01:00.000Z',
      issuance_mode: 'online',
      constatation_type: 'approach',
      location_description: 'Av. Brasil',
      uf: 'AM',
      current_status: currentStatus,
    });
  expect(created.status, JSON.stringify(created.body)).toBe(201);
  return created.body.id as string;
}

describe('inf/ait routes mounted in the unified app (WP-T0)', () => {
  it('creates a draft through the generated CRUD route and finalizes it through the handwritten command route', async () => {
    const server = app.getHttpServer();
    const created = await request(server)
      .post('/v1/inf/ait/aits')
      .set(headers())
      .send({
        traffic_agency_id: tenantId,
        ait_number: `${Date.now()}`.slice(-6),
        series: 'E',
        agent_id: randomUUID(),
        shift_id: randomUUID(),
        device_id: randomUUID(),
        framing_id: fixture.framingId,
        catalog_id: fixture.catalogId,
        infraction_at: '2026-09-13T10:00:00.000Z',
        issued_at: '2026-09-13T10:01:00.000Z',
        issuance_mode: 'online',
        constatation_type: 'approach',
        location_description: 'Av. Brasil',
        uf: 'AM',
        current_status: 'RASCUNHO_OFFLINE',
      });
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    const id = created.body.id as string;

    // CTG-0001 §1/§4 (M2): every handwritten command on `aits/{id}` requires
    // `If-Match: "<ait_ait.version>"` and answers with the next version as
    // `ETag`; chain one into the next instead of assuming a fixed number.
    let version = '1';

    const vehicleResponse = await request(server)
      .post(`/v1/inf/ait/aits/${id}/vehicles`)
      .set({ ...headers(), 'if-match': version })
      .send({
        vehicle_snapshot_id: fixture.vehicleId,
        role: 'infractor',
        visually_confirmed_by_agent: true,
      });
    expect(vehicleResponse.status, JSON.stringify(vehicleResponse.body)).toBe(
      201,
    );
    version = vehicleResponse.headers.etag.replaceAll('"', '');

    const personResponse = await request(server)
      .post(`/v1/inf/ait/aits/${id}/people`)
      .set({ ...headers(), 'if-match': version })
      .send({
        person_id: fixture.personId,
        role: 'driver',
        identified_by: 'document',
      });
    expect(personResponse.status, JSON.stringify(personResponse.body)).toBe(
      201,
    );
    version = personResponse.headers.etag.replaceAll('"', '');

    const scienceResponse = await request(server)
      .post(`/v1/inf/ait/aits/${id}/science`)
      .set({ ...headers(), 'if-match': version })
      .send({ person_id: fixture.personId, signature_type: 'digital' });
    expect(scienceResponse.status, JSON.stringify(scienceResponse.body)).toBe(
      201,
    );
    version = scienceResponse.headers.etag.replaceAll('"', '');

    const finalized = await request(server)
      .post(`/v1/inf/ait/aits/${id}/finalize`)
      .set({ ...headers(), 'if-match': version })
      .send({});
    // CTG-0001 §4.4: finalize answers 200 (not 201 — it transitions the
    // existing aggregate, it does not create a new resource).
    expect(finalized.status, JSON.stringify(finalized.body)).toBe(200);
    expect(finalized.body.current_status).toBe('FINALIZADO_LOCAL');
    expect(finalized.body.content_hash).toBeTruthy();
  });

  it('denies the finalize command to a role outside the policy matrix', async () => {
    process.env.DETRAN_LOCAL_ROLES = 'bi-analyst';
    const denied = await request(app.getHttpServer())
      .post(`/v1/inf/ait/aits/${randomUUID()}/finalize`)
      .set(headers())
      .send({});
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    expect(denied.status).toBe(403);
  });
});

/**
 * CTG-0001 §4/§8 (R-0008, TASK-0002) — C-0001-37..44: `If-Match` (M2), papel
 * mínimo × papel negado por comando, e as rotas novas de
 * `concurrency-review`/`archive`/`cancel-requests` (M4), que ainda não estão
 * montadas (TASK-0003) — hoje respondem 404 do próprio Nest (rota
 * inexistente), o sinal correto de "comportamento ausente" para uma rota
 * ainda não criada. O padrão do arquivo (tenant/actor locais fixos,
 * `DETRAN_LOCAL_ROLES` mutado por teste) é mantido — M20 confirma que
 * continua válido.
 */
describe('CTG-0001 §4 — If-Match, papéis mínimos e rotas novas do AIT (TASK-0002)', () => {
  afterEach(() => {
    // Roda mesmo quando o teste lança no meio (asserção falha, erro de rede):
    // nenhum DETRAN_LOCAL_ROLES/DETRAN_LOCAL_DECISION_BODY sobrevive para o
    // próximo teste ou arquivo (fileParallelism: false, mesmo processo).
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    delete process.env.DETRAN_LOCAL_DECISION_BODY;
  });

  describe('C-0001-37/38 — If-Match e papel mínimo em finalize', () => {
    it('dado DETRAN_LOCAL_ROLES=field-agent quando POST finalize sem If-Match então 428 TEAT.IF_MATCH_REQUIRED', async () => {
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
      const id = await createDraft();
      const response = await request(app.getHttpServer())
        .post(`/v1/inf/ait/aits/${id}/finalize`)
        .set(headers())
        .send({});
      expect(response.status, JSON.stringify(response.body)).toBe(428);
      expect(response.body.code).toBe('TEAT.IF_MATCH_REQUIRED');
    });

    it('dado If-Match divergente ("999") quando POST finalize então 412 TEAT.VERSION_CONFLICT', async () => {
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
      const id = await createDraft();
      const response = await request(app.getHttpServer())
        .post(`/v1/inf/ait/aits/${id}/finalize`)
        .set({ ...headers(), 'if-match': '999' })
        .send({});
      expect(response.status, JSON.stringify(response.body)).toBe(412);
      expect(response.body.code).toBe('TEAT.VERSION_CONFLICT');
    });

    it('dado If-Match correto ("1") quando POST finalize então 200 com header ETag', async () => {
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
      const id = await createDraft();
      const response = await request(app.getHttpServer())
        .post(`/v1/inf/ait/aits/${id}/finalize`)
        .set({ ...headers(), 'if-match': '1' })
        .send({});
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      expect(response.headers.etag).toBe('"2"');
    });

    it('dado DETRAN_LOCAL_ROLES=processing-operator quando POST finalize então 403; com field-agent então 200', async () => {
      process.env.DETRAN_LOCAL_ROLES = 'processing-operator';
      const idForDenied = await createDraft();
      process.env.DETRAN_LOCAL_ROLES = 'processing-operator';
      const denied = await request(app.getHttpServer())
        .post(`/v1/inf/ait/aits/${idForDenied}/finalize`)
        .set({ ...headers(), 'if-match': '1' })
        .send({});
      expect(denied.status).toBe(403);

      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
      const idForAllowed = await createDraft();
      const allowed = await request(app.getHttpServer())
        .post(`/v1/inf/ait/aits/${idForAllowed}/finalize`)
        .set({ ...headers(), 'if-match': '1' })
        .send({});
      expect(allowed.status, JSON.stringify(allowed.body)).toBe(200);
    });
  });

  describe('C-0001-39 — POST archive (novo, M4, OD-T13)', () => {
    it('dado DETRAN_LOCAL_ROLES=traffic-authority quando POST .../archive num AIT PROCESSADO então 200; com processing-operator então 403', async () => {
      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
      const idForAllowed = await createDraft('PROCESSADO');
      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
      const allowed = await request(app.getHttpServer())
        .post(`/v1/inf/ait/aits/${idForAllowed}/archive`)
        .set({ ...headers(), 'if-match': '1' })
        .send({ reason: 'processamento encerrado' });
      expect(allowed.status, JSON.stringify(allowed.body)).toBe(200);

      process.env.DETRAN_LOCAL_ROLES = 'processing-operator';
      const idForDenied = await createDraft('PROCESSADO');
      process.env.DETRAN_LOCAL_ROLES = 'processing-operator';
      const denied = await request(app.getHttpServer())
        .post(`/v1/inf/ait/aits/${idForDenied}/archive`)
        .set({ ...headers(), 'if-match': '1' })
        .send({ reason: 'processamento encerrado' });
      expect(denied.status).toBe(403);
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    });
  });

  describe('C-0001-40/41 — POST cancel-requests/{id}/decide × decision_body (M3/H.39/OD-T01)', () => {
    /**
     * Cria um pedido post_final real (`entityType='ait-cancel-posfinal-request'`,
     * `addressedTo='diretoria-fiscalizacao'`) contra um AIT FINALIZADO_LOCAL.
     * A criação de um pedido post_final com `targetAitId` também exige
     * `If-Match` (CTG-0001 §4.15: a transição toca `ait_ait`) — o AIT nasce
     * na versão 1 e a própria criação o leva a `SOLICITADO_CANCEL_POSFINAL`,
     * incrementando para a versão 2 (§13 item 2: com `ait_id` presente, o
     * `If-Match`/`ETag` de `review`/`decide` passam a usar essa versão do
     * AIT, não a versão — sempre 1 aqui — de `ait_cancel_request`).
     */
    async function createDiretoriaCancelRequest() {
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
      const aitId = await createDraft('FINALIZADO_LOCAL');
      const created = await request(app.getHttpServer())
        .post('/v1/inf/ait/cancel-requests')
        .set({ ...headers(), 'if-match': '1' })
        .send({
          entityType: 'ait-cancel-posfinal-request',
          addressedTo: 'diretoria-fiscalizacao',
          trafficAgencyId: tenantId,
          idempotencyKey: `e2e-cancel-${aitId}`,
          targetLocalActId: `local-${aitId}`,
          targetAitId: aitId,
          originStatus: 'FINALIZADO_LOCAL',
          justification: 'erro material identificado',
          requestedBy: actorId,
        });
      expect(created.status, JSON.stringify(created.body)).toBe(201);
      return { aitId, requestId: created.body.id as string };
    }

    it('dado um id local sem pedido correspondente quando decide então 404 TEAT.AIT_CANCEL_TARGET_NOT_FOUND (sem pedido não há addressed_to)', async () => {
      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
      delete process.env.DETRAN_LOCAL_DECISION_BODY;
      const response = await request(app.getHttpServer())
        .post(`/v1/inf/ait/cancel-requests/${randomUUID()}/decide`)
        .set({ ...headers(), 'if-match': '1' })
        .send({ decision: 'approve', decision_note: 'deferido' });
      expect(response.status, JSON.stringify(response.body)).toBe(404);
      expect(response.body.code).toBe('TEAT.AIT_CANCEL_TARGET_NOT_FOUND');
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    });

    it('dado um pedido com ait_id presente quando If-Match usa ait_cancel_request.version (1, errado) em vez de ait_ait.version (2) então 412 TEAT.VERSION_CONFLICT (§13 item 2)', async () => {
      const { requestId } = await createDiretoriaCancelRequest();
      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
      process.env.DETRAN_LOCAL_DECISION_BODY = 'diretoria-fiscalizacao';
      const response = await request(app.getHttpServer())
        .post(`/v1/inf/ait/cancel-requests/${requestId}/decide`)
        .set({ ...headers(), 'if-match': '1' })
        .send({
          decision: 'approve',
          decision_note: 'deferido pela Diretoria',
        });
      expect(response.status, JSON.stringify(response.body)).toBe(412);
      expect(response.body.code).toBe('TEAT.VERSION_CONFLICT');
      delete process.env.DETRAN_LOCAL_DECISION_BODY;
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    });

    it('dado um pedido addressed_to=diretoria-fiscalizacao (If-Match=ait_ait.version=2) quando DETRAN_LOCAL_ROLES=traffic-authority sem DETRAN_LOCAL_DECISION_BODY decide então 403 TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN', async () => {
      const { requestId } = await createDiretoriaCancelRequest();
      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
      delete process.env.DETRAN_LOCAL_DECISION_BODY;
      const response = await request(app.getHttpServer())
        .post(`/v1/inf/ait/cancel-requests/${requestId}/decide`)
        .set({ ...headers(), 'if-match': '2' })
        .send({ decision: 'approve', decision_note: 'deferido' });
      expect(response.status, JSON.stringify(response.body)).toBe(403);
      expect(response.body.code).toBe('TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN');
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    });

    it('dado o mesmo pedido (If-Match=ait_ait.version=2) com DETRAN_LOCAL_DECISION_BODY=diretoria-fiscalizacao então 200 e o AIT vai a CANCELADO_POSFINAL', async () => {
      const { requestId } = await createDiretoriaCancelRequest();
      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
      process.env.DETRAN_LOCAL_DECISION_BODY = 'diretoria-fiscalizacao';
      const decided = await request(app.getHttpServer())
        .post(`/v1/inf/ait/cancel-requests/${requestId}/decide`)
        .set({ ...headers(), 'if-match': '2' })
        .send({
          decision: 'approve',
          decision_note: 'deferido pela Diretoria',
        });
      expect(decided.status, JSON.stringify(decided.body)).toBe(200);
      expect(decided.body.ait?.current_status).toBe('CANCELADO_POSFINAL');
      delete process.env.DETRAN_LOCAL_DECISION_BODY;
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    });

    it('dado decision_body informado divergente de addressed_to então 403 TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN antes de qualquer efeito (§13 item 3)', async () => {
      const { requestId } = await createDiretoriaCancelRequest();
      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
      process.env.DETRAN_LOCAL_DECISION_BODY = 'diretoria-fiscalizacao';
      const response = await request(app.getHttpServer())
        .post(`/v1/inf/ait/cancel-requests/${requestId}/decide`)
        .set({ ...headers(), 'if-match': '2' })
        .send({
          decision: 'approve',
          decision_note: 'deferido',
          decision_body: 'traffic-authority',
        });
      expect(response.status, JSON.stringify(response.body)).toBe(403);
      expect(response.body.code).toBe('TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN');
      delete process.env.DETRAN_LOCAL_DECISION_BODY;
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    });

    it('dado um pedido draft sem AIT no servidor (ait_id nulo, 202) então If-Match de decide usa ait_cancel_request.version, não ait_ait.version (§13 item 2)', async () => {
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
      const created = await request(app.getHttpServer())
        .post('/v1/inf/ait/cancel-requests')
        .set(headers())
        .send({
          entityType: 'ait-cancel-request',
          trafficAgencyId: tenantId,
          idempotencyKey: `e2e-draft-null-ait-${randomUUID()}`,
          targetLocalActId: `local-${randomUUID()}`,
          originStatus: 'RASCUNHO_OFFLINE',
          justification: 'desistência antes da sincronização',
          requestedBy: actorId,
        });
      expect(created.status, JSON.stringify(created.body)).toBe(202);
      expect(created.body.ait_id ?? null).toBeNull();

      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
      const decided = await request(app.getHttpServer())
        .post(`/v1/inf/ait/cancel-requests/${created.body.id}/decide`)
        .set({ ...headers(), 'if-match': '1' })
        .send({ decision: 'approve', decision_note: 'aprovado sem AIT' });
      expect(decided.status, JSON.stringify(decided.body)).toBe(200);
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    });
  });

  /**
   * CTG-0001 §13 item 2 (Adenda) — delivery-review ciclo 2, achado único:
   * com `ait_id` nulo, `review`/`decide` não podem pular `If-Match`/`ETag`
   * — devem exigi-los contra `ait_cancel_request.version` (não contra
   * `ait_ait.version`, que nem existe nesse caso). Hoje o controlador só
   * chama `assertIfMatch`/`res.setHeader('ETag', …)` quando `summary.aitId`
   * é truthy (`ait-cancel-requests.controller.ts` `review`≈linha 109,
   * `decide`≈linha 131) — com `ait_id` nulo nenhum dos dois roda, então
   * estes testes ficam vermelhos por comportamento ausente até o Engineer
   * remover essa condição.
   */
  describe('§13 item 2 — review/decide exigem If-Match/ETag mesmo com ait_id nulo (delivery-review ciclo 2)', () => {
    async function createDraftCancelRequestWithoutAit(): Promise<string> {
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
      const created = await request(app.getHttpServer())
        .post('/v1/inf/ait/cancel-requests')
        .set(headers())
        .send({
          entityType: 'ait-cancel-request',
          trafficAgencyId: tenantId,
          idempotencyKey: `e2e-null-ait-if-match-${randomUUID()}`,
          targetLocalActId: `local-${randomUUID()}`,
          originStatus: 'RASCUNHO_OFFLINE',
          justification: 'desistência antes da sincronização',
          requestedBy: actorId,
        });
      expect(created.status, JSON.stringify(created.body)).toBe(202);
      expect(created.body.ait_id ?? null).toBeNull();
      return created.body.id as string;
    }

    it('dado um pedido com ait_id nulo quando review sem If-Match então 428 TEAT.IF_MATCH_REQUIRED; If-Match divergente então 412 TEAT.VERSION_CONFLICT; If-Match="1" (correto) então 200 com ETag: "2" e status=under_review', async () => {
      const requestId = await createDraftCancelRequestWithoutAit();
      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
      const missing = await request(app.getHttpServer())
        .post(`/v1/inf/ait/cancel-requests/${requestId}/review`)
        .set(headers())
        .send({});
      expect(missing.status, JSON.stringify(missing.body)).toBe(428);
      expect(missing.body.code).toBe('TEAT.IF_MATCH_REQUIRED');

      const divergent = await request(app.getHttpServer())
        .post(`/v1/inf/ait/cancel-requests/${requestId}/review`)
        .set({ ...headers(), 'if-match': '99' })
        .send({});
      expect(divergent.status, JSON.stringify(divergent.body)).toBe(412);
      expect(divergent.body.code).toBe('TEAT.VERSION_CONFLICT');

      const ok = await request(app.getHttpServer())
        .post(`/v1/inf/ait/cancel-requests/${requestId}/review`)
        .set({ ...headers(), 'if-match': '1' })
        .send({});
      expect(ok.status, JSON.stringify(ok.body)).toBe(200);
      expect(ok.headers.etag).toBe('"2"');
      expect(ok.body.status).toBe('under_review');
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    });

    it('dado um pedido com ait_id nulo quando decide sem If-Match então 428 TEAT.IF_MATCH_REQUIRED; If-Match divergente então 412 TEAT.VERSION_CONFLICT; If-Match="1" (correto) então 200 com ETag da versão incrementada', async () => {
      const requestId = await createDraftCancelRequestWithoutAit();
      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority';
      const missing = await request(app.getHttpServer())
        .post(`/v1/inf/ait/cancel-requests/${requestId}/decide`)
        .set(headers())
        .send({ decision: 'approve', decision_note: 'aprovado sem AIT' });
      expect(missing.status, JSON.stringify(missing.body)).toBe(428);
      expect(missing.body.code).toBe('TEAT.IF_MATCH_REQUIRED');

      const divergent = await request(app.getHttpServer())
        .post(`/v1/inf/ait/cancel-requests/${requestId}/decide`)
        .set({ ...headers(), 'if-match': '99' })
        .send({ decision: 'approve', decision_note: 'aprovado sem AIT' });
      expect(divergent.status, JSON.stringify(divergent.body)).toBe(412);
      expect(divergent.body.code).toBe('TEAT.VERSION_CONFLICT');

      const ok = await request(app.getHttpServer())
        .post(`/v1/inf/ait/cancel-requests/${requestId}/decide`)
        .set({ ...headers(), 'if-match': '1' })
        .send({ decision: 'approve', decision_note: 'aprovado sem AIT' });
      expect(ok.status, JSON.stringify(ok.body)).toBe(200);
      expect(ok.headers.etag).toBe('"2"');
      expect(ok.body.status).toBe('approved');
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    });
  });

  describe('C-0001-42 — POST concurrency-review (novo, M4, §13 item 1)', () => {
    /**
     * `SyncConflictPort` (§13 item 1) exige um `ops.sync_conflict` aberto
     * (`conflict_type='concurrency'`) referenciando, via `ops.sync_queue_item
     * .server_entity_id`, o AIT em `SUSPEITO_CONCORRENCIA` — sem isso o
     * comando responde 409 `TEAT.AIT_STATE_INVALID`, não 200. Inserção por
     * SQL direto (`client`, papel `owner`), no mesmo molde do integration
     * `ait-commands.integration.spec.ts` (DDL 18: `ops.sync_queue_item`/
     * `ops.sync_conflict`) — não há fixture nem comando para isso ainda.
     */
    async function createOpenConcurrencyConflict(
      aitId: string,
    ): Promise<string> {
      await client.query(`select set_config('app.role', 'owner', false)`);
      const queueItem = await client.query<{ id: string }>(
        `insert into ops.sync_queue_item
           (tenant_id, traffic_agency_id, device_id, agent_id, entity_type,
            local_entity_id, server_entity_id, status, created_locally_at,
            idempotency_key, payload_hash, payload_json)
         values ($1, $1, $2, $3, 'ait', $4, $5, 'received', now(), $6, $7, '{}'::jsonb)
         returning id`,
        [
          tenantId,
          randomUUID(),
          randomUUID(),
          randomUUID(),
          aitId,
          `e2e-conflict-${aitId}`,
          'sha256:' + 'a'.repeat(64),
        ],
      );
      const conflict = await client.query<{ id: string }>(
        `insert into ops.sync_conflict
           (tenant_id, sync_queue_item_id, conflict_type, description, status)
         values ($1, $2, 'concurrency', 'mesmo agente em dispositivos distintos', 'open')
         returning id`,
        [tenantId, queueItem.rows[0]!.id],
      );
      return conflict.rows[0]!.id;
    }

    it('dado um sync_conflict aberto quando DETRAN_LOCAL_ROLES=traffic-authority,AUDITOR então POST .../concurrency-review responde 200, resolve o conflito real (resolution_action=accept_server) e devolve o conflict_id real; com field-agent então 403', async () => {
      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority,AUDITOR';
      const idForAllowed = await createDraft('SUSPEITO_CONCORRENCIA');
      const conflictId = await createOpenConcurrencyConflict(idForAllowed);
      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority,AUDITOR';
      const allowed = await request(app.getHttpServer())
        .post(`/v1/inf/ait/aits/${idForAllowed}/concurrency-review`)
        .set({ ...headers(), 'if-match': '1' })
        .send({ decision: 'release', reason: 'apuração concluída' });
      expect(allowed.status, JSON.stringify(allowed.body)).toBe(200);
      expect(allowed.body.conflict_id).toBe(conflictId);
      const conflictRow = await client.query<{
        status: string;
        resolution_action: string | null;
      }>(
        `select status, resolution_action from ops.sync_conflict where id = $1`,
        [conflictId],
      );
      expect(conflictRow.rows[0]?.status).toBe('resolved');
      expect(conflictRow.rows[0]?.resolution_action).toBe('accept_server');

      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
      const idForDenied = await createDraft('SUSPEITO_CONCORRENCIA');
      await createOpenConcurrencyConflict(idForDenied);
      const denied = await request(app.getHttpServer())
        .post(`/v1/inf/ait/aits/${idForDenied}/concurrency-review`)
        .set({ ...headers(), 'if-match': '1' })
        .send({ decision: 'release', reason: 'apuração concluída' });
      expect(denied.status).toBe(403);
    });

    it('dado o AIT em SUSPEITO_CONCORRENCIA sem nenhum sync_conflict aberto quando POST .../concurrency-review então 409 TEAT.AIT_STATE_INVALID com context.command="concurrency-review"', async () => {
      const idWithoutConflict = await createDraft('SUSPEITO_CONCORRENCIA');
      process.env.DETRAN_LOCAL_ROLES = 'traffic-authority,AUDITOR';
      const response = await request(app.getHttpServer())
        .post(`/v1/inf/ait/aits/${idWithoutConflict}/concurrency-review`)
        .set({ ...headers(), 'if-match': '1' })
        .send({ decision: 'release', reason: 'sem conflito registrado' });
      expect(response.status, JSON.stringify(response.body)).toBe(409);
      expect(response.body.code).toBe('TEAT.AIT_STATE_INVALID');
      expect(response.body.context?.command).toBe('concurrency-review');
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    });
  });

  describe('C-0001-43 — POST receive-protocol: papel mínimo integration-operator', () => {
    it('dado DETRAN_LOCAL_ROLES=integration-operator quando POST .../receive-protocol então 200; com field-agent então 403', async () => {
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
      const idForAllowed = await createDraft('ENFILEIRADO');
      process.env.DETRAN_LOCAL_ROLES = 'integration-operator';
      const allowed = await request(app.getHttpServer())
        .post(`/v1/inf/ait/aits/${idForAllowed}/receive-protocol`)
        .set({ ...headers(), 'if-match': '1' })
        .send({ receipt_protocol: `E2E-${idForAllowed.slice(0, 8)}` });
      expect(allowed.status, JSON.stringify(allowed.body)).toBe(200);

      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
      const idForDenied = await createDraft('ENFILEIRADO');
      const denied = await request(app.getHttpServer())
        .post(`/v1/inf/ait/aits/${idForDenied}/receive-protocol`)
        .set({ ...headers(), 'if-match': '1' })
        .send({ receipt_protocol: `E2E-${idForDenied.slice(0, 8)}` });
      expect(denied.status).toBe(403);
    });
  });

  describe('C-0001-44 — GET cancel-requests/outcomes/{targetLocalActId}', () => {
    it('dado um id local sem pedido então 404 TEAT.AIT_CANCEL_TARGET_NOT_FOUND', async () => {
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
      const response = await request(app.getHttpServer())
        .get(`/v1/inf/ait/cancel-requests/outcomes/local-${randomUUID()}`)
        .set(headers());
      expect(response.status).toBe(404);
      expect(response.body.code).toBe('TEAT.AIT_CANCEL_TARGET_NOT_FOUND');
    });

    it('dado um id local com pedido então 200 e a lista ordenada por requested_at desc', async () => {
      process.env.DETRAN_LOCAL_ROLES = 'field-agent';
      const aitId = await createDraft('RASCUNHO_OFFLINE');
      const localActId = `local-${aitId}`;
      await request(app.getHttpServer())
        .post('/v1/inf/ait/cancel-requests')
        .set(headers())
        .send({
          entityType: 'ait-cancel-request',
          trafficAgencyId: tenantId,
          idempotencyKey: `e2e-outcomes-${aitId}`,
          targetLocalActId: localActId,
          targetAitId: aitId,
          originStatus: 'RASCUNHO_OFFLINE',
          justification: 'desistência do agente',
          requestedBy: actorId,
        });
      const response = await request(app.getHttpServer())
        .get(`/v1/inf/ait/cancel-requests/outcomes/${localActId}`)
        .set(headers());
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      expect(response.body.requests).toHaveLength(1);
    });
  });
});

/**
 * CTG-0001 §13 item 6 (Adenda, R-0008, TASK-0002 iteração 3) —
 * `Idempotency-Key` em todo `@Post` de comando (`@Idempotent()` de
 * `@stynx-nyx/idempotency`, kernel já provado por
 * `backend/app/tests/e2e/pec-idempotency.e2e.spec.ts`, lido como padrão):
 * repetição idêntica (mesma chave, mesmo corpo) devolve a mesma resposta
 * gravada com header `idempotency-replayed: true`; mesma chave com corpo
 * divergente → 422 (não 409 — o catálogo diverge do kernel, OD-T45).
 * Diferente do restante do arquivo, estes testes mandam a MESMA
 * `idempotency-key` nas duas chamadas de cada caso (por design — é a chave
 * repetida que aciona o replay).
 */
describe('CTG-0001 §13 item 6 — Idempotency-Key: replay e corpo divergente (finalize, cancel-requests)', () => {
  async function createFinalizableDraft(): Promise<string> {
    const server = app.getHttpServer();
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    const created = await request(server)
      .post('/v1/inf/ait/aits')
      .set(headers())
      .send({
        traffic_agency_id: tenantId,
        ait_number: `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(
          -6,
        ),
        series: 'E',
        agent_id: randomUUID(),
        shift_id: randomUUID(),
        device_id: randomUUID(),
        framing_id: fixture.framingId,
        catalog_id: fixture.catalogId,
        infraction_at: '2026-09-13T10:00:00.000Z',
        issued_at: '2026-09-13T10:01:00.000Z',
        issuance_mode: 'online',
        constatation_type: 'approach',
        location_description: 'Av. Brasil',
        uf: 'AM',
        current_status: 'RASCUNHO_OFFLINE',
      });
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    const id = created.body.id as string;
    let version = '1';
    const vehicleResponse = await request(server)
      .post(`/v1/inf/ait/aits/${id}/vehicles`)
      .set({ ...headers(), 'if-match': version })
      .send({
        vehicle_snapshot_id: fixture.vehicleId,
        role: 'infractor',
        visually_confirmed_by_agent: true,
      });
    version = vehicleResponse.headers.etag.replaceAll('"', '');
    const personResponse = await request(server)
      .post(`/v1/inf/ait/aits/${id}/people`)
      .set({ ...headers(), 'if-match': version })
      .send({
        person_id: fixture.personId,
        role: 'driver',
        identified_by: 'document',
      });
    version = personResponse.headers.etag.replaceAll('"', '');
    const scienceResponse = await request(server)
      .post(`/v1/inf/ait/aits/${id}/science`)
      .set({ ...headers(), 'if-match': version })
      .send({ person_id: fixture.personId, signature_type: 'digital' });
    version = scienceResponse.headers.etag.replaceAll('"', '');
    return id;
  }

  it('dado finalize repetido com a mesma Idempotency-Key e o mesmo corpo então devolve a mesma resposta com header idempotency-replayed: true; com corpo divergente então 422', async () => {
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    const id = await createFinalizableDraft();
    const key = randomUUID();
    const sharedHeaders = {
      authorization: 'Bearer local',
      'x-tenant-id': tenantId,
      'idempotency-key': key,
      'if-match': '4',
    };
    const first = await request(app.getHttpServer())
      .post(`/v1/inf/ait/aits/${id}/finalize`)
      .set(sharedHeaders)
      .send({ reason: 'lavratura concluída' });
    expect(first.status, JSON.stringify(first.body)).toBe(200);

    const replay = await request(app.getHttpServer())
      .post(`/v1/inf/ait/aits/${id}/finalize`)
      .set(sharedHeaders)
      .send({ reason: 'lavratura concluída' });
    expect(replay.status, JSON.stringify(replay.body)).toBe(200);
    expect(replay.headers['idempotency-replayed']).toBe('true');
    expect(replay.body).toEqual(first.body);

    const mismatch = await request(app.getHttpServer())
      .post(`/v1/inf/ait/aits/${id}/finalize`)
      .set(sharedHeaders)
      .send({ reason: 'motivo diferente' });
    expect(mismatch.status, JSON.stringify(mismatch.body)).toBe(422);
  });

  it('dado POST cancel-requests repetido com a mesma Idempotency-Key e o mesmo corpo então devolve a mesma resposta com header idempotency-replayed: true; com corpo divergente então 422', async () => {
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    const aitId = await createDraft('RASCUNHO_OFFLINE');
    const key = randomUUID();
    const sharedHeaders = {
      authorization: 'Bearer local',
      'x-tenant-id': tenantId,
      'idempotency-key': key,
    };
    const body = {
      entityType: 'ait-cancel-request',
      trafficAgencyId: tenantId,
      idempotencyKey: `app-level-${aitId}`,
      targetLocalActId: `local-${aitId}`,
      targetAitId: aitId,
      originStatus: 'RASCUNHO_OFFLINE',
      justification: 'desistência do agente',
      requestedBy: actorId,
    };
    const first = await request(app.getHttpServer())
      .post('/v1/inf/ait/cancel-requests')
      .set(sharedHeaders)
      .send(body);
    expect(first.status, JSON.stringify(first.body)).toBe(201);

    const replay = await request(app.getHttpServer())
      .post('/v1/inf/ait/cancel-requests')
      .set(sharedHeaders)
      .send(body);
    expect(replay.status, JSON.stringify(replay.body)).toBe(201);
    expect(replay.headers['idempotency-replayed']).toBe('true');
    expect(replay.body).toEqual(first.body);

    const mismatch = await request(app.getHttpServer())
      .post('/v1/inf/ait/cancel-requests')
      .set(sharedHeaders)
      .send({ ...body, justification: 'motivo diferente' });
    expect(mismatch.status, JSON.stringify(mismatch.body)).toBe(422);
  });
});
