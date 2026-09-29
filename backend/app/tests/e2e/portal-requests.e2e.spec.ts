import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  AITS,
  CPF,
  EXTERNAL,
  FIXED_TODAY,
  LOCAL,
  PRESENTIAL_NOTE,
  SNE_EFFECTS,
  TENANT_ID,
  asOwner,
  auditRows,
  clearCitizenEnv,
  cpfHash,
  createPortalApp,
  headers,
  importModule,
  newClient,
  resetGoldenSubjectRows,
  resetLocalPortalRows,
  seedLocalTenant,
  setCitizen,
  subjectIdOf,
} from './portal-e2e.support.js';

/**
 * R-0009 CTG-0002 §2.1, §2.3, §3, §4, §5 e §13 (TASK-0006) — C-0002-61…71:
 * fronteira de TASK-0007 (identidade §3 + pedidos §5) pelo `AppModule` real
 * (perfil `test`, `CIDADAO` + claims por env, tenant local, `PortalClock`
 * fixo em 2026-09-14). Fica vermelho até TASK-0007 montar
 * `PortalRequestsController`, as três rotas de identidade §2.1, o mapa
 * `PORTAL_DELEGATION_TARGETS` do app e `PORTAL_RULES` (§10).
 *
 * Setup no molde de portal-identity.e2e.spec.ts (verde, intocado): tenant
 * local, `act_level_policy` 21, `service_catalog` 15, sujeitos criados via
 * `GET me` (M22), vínculos/projeção do tenant local inseridos no `beforeAll`
 * (§12). Env `DETRAN_LOCAL_*` limpo no `afterEach`/`afterAll`
 * (`fileParallelism: false`).
 */
const client = newClient();
let app: INestApplication;
let failingApp: INestApplication | undefined;
const subjects: Record<'bronze' | 'prata' | 'ouro', string> = {
  bronze: '',
  prata: '',
  ouro: '',
};
const prata = { cpf: CPF.prata, level: 'avancada' as const };
const ouro = { cpf: CPF.ouro, level: 'avancada' as const };
const bronze = { cpf: CPF.bronze, level: 'simples' as const };

const SIGNATURE = { signature: { method: 'govbr', signatureRef: 'ref' } };
const CONSEQUENCE_ACK = {
  consequenceAck: { textVersion: '1', acceptedAt: '2026-09-14T15:00:00.000Z' },
};
const SCORES = {
  satisfaction: 5,
  quality: 4,
  deadline: 5,
  clarity: 4,
  channel: 5,
};
const REASON_R0007 = 'delegacao_indisponivel_r0007';

/** Estado compartilhado entre os `it` (ordem do arquivo). */
const created: { concluded?: string; bronzeInProgress?: string } = {};

function api() {
  return request(app.getHttpServer());
}

async function createRequest(
  citizen: { cpf: string; level: 'simples' | 'avancada' },
  body: Record<string, unknown>,
) {
  setCitizen(citizen);
  const response = await api()
    .post('/v1/portal/requests')
    .set(headers())
    .send(body);
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return response.body as { requestId: string; version: number; state: string };
}

beforeAll(async () => {
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
  await client.connect();
  await seedLocalTenant(client);
  await resetLocalPortalRows(client);
  app = await createPortalApp();

  subjects.prata = await subjectIdOf(app, prata);
  subjects.ouro = await subjectIdOf(app, ouro);
  subjects.bronze = await subjectIdOf(app, bronze);

  await asOwner(client);
  // vínculo da prata sobre …f0000002 (CTG-0001 §10.3 …70200002, copiado para o tenant local)
  await client.query(
    `insert into portal.entitlement (id, tenant_id, subject_id, target_kind, target_id, relation, origin, valid_from, valid_until)
     values ($1, $2, $3, 'ait', $4, 'owner', 'infraction', '2026-01-01', null)
     on conflict (id) do update set subject_id = excluded.subject_id`,
    [LOCAL.entitlement(1), TENANT_ID, subjects.prata, AITS.f2],
  );
  // vínculo da prata sobre os alvos crash/exam (§3.2 consulta_bat/consulta_exame,
  // mesma forma de …7020000b/…7020000c do seed 70 — TASK-0006 iteração 2)
  await client.query(
    `insert into portal.entitlement (id, tenant_id, subject_id, target_kind, target_id, relation, origin, valid_from, valid_until)
     values ($1, $2, $3, 'crash', $4, 'interested_party', 'manual', '2026-01-01', null)
     on conflict (id) do update set subject_id = excluded.subject_id`,
    [LOCAL.entitlement(2), TENANT_ID, subjects.prata, EXTERNAL.crash],
  );
  await client.query(
    `insert into portal.entitlement (id, tenant_id, subject_id, target_kind, target_id, relation, origin, valid_from, valid_until)
     values ($1, $2, $3, 'exam', $4, 'interested_party', 'manual', '2026-01-01', null)
     on conflict (id) do update set subject_id = excluded.subject_id`,
    [LOCAL.entitlement(3), TENANT_ID, subjects.prata, EXTERNAL.exam],
  );
  // …70f00001 copiada para o tenant local com o cpf_hash da prata (§12)
  await client.query(
    `insert into portal.infraction_view (id, tenant_id, ait_id, subject_cpf_hash, ait_number, plate, occurred_at, framing_label, amount, situation, deadlines_json, points_status, actions_json, notices_json, payment_json, last_event_id, last_event_version)
     values ($1, $2, $3, $4, 'FIX-00000e1', 'FIX2EE1', '2026-05-01T12:00:00-04:00', 'fixture', 195.23, 'aguardando_defesa', '[]'::jsonb, 'none', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0)
     on conflict (id) do update set subject_cpf_hash = excluded.subject_cpf_hash`,
    [LOCAL.infractionView(1), TENANT_ID, AITS.f2, cpfHash(CPF.prata)],
  );
}, 60_000);

afterEach(() => {
  clearCitizenEnv();
});

afterAll(async () => {
  await app?.close();
  await failingApp?.close();
  if (subjects.ouro) {
    await resetGoldenSubjectRows(client, subjects.ouro);
  }
  await client.end();
  delete process.env.DETRAN_LOCAL_ROLES;
  delete process.env.DETRAN_LOCAL_ASSURANCE_LEVEL;
  delete process.env.DETRAN_LOCAL_CPF;
  delete process.env.DETRAN_LOCAL_GOVBR_LEVEL;
  delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
});

describe('CTG-0002 §2.1 — identidade: elevação, representações, preferências (C-0002-61…63)', () => {
  it("C-0002-61 — dado CIDADAO avancada quando POST identity/assurance/elevations então 422 SERVICE_UNAVAILABLE 'elevacao_govbr_pendente_r0014'; POST …/{uuid}/complete idem; corpo inválido então 400", async () => {
    setCitizen(prata);
    const elevation = await api()
      .post('/v1/portal/identity/assurance/elevations')
      .set(headers())
      .send({
        targetLevel: 'avancada',
        method: 'biographic',
        resumeRoute: '/x',
      });
    expect(elevation.status, JSON.stringify(elevation.body)).toBe(422);
    expect(elevation.body.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
    expect(elevation.body.context).toEqual({
      unavailableReason: 'elevacao_govbr_pendente_r0014',
      alternativeChannelNote: null,
    });

    const complete = await api()
      .post(`/v1/portal/identity/assurance/elevations/${randomUUID()}/complete`)
      .set(headers())
      .send({ resumeToken: 't' });
    expect(complete.status, JSON.stringify(complete.body)).toBe(422);
    expect(complete.body.context).toMatchObject({
      unavailableReason: 'elevacao_govbr_pendente_r0014',
    });

    const invalid = await api()
      .post('/v1/portal/identity/assurance/elevations')
      .set(headers())
      .send({ targetLevel: 'qualificada', method: 'magic', resumeRoute: 'x' });
    expect(invalid.status, JSON.stringify(invalid.body)).toBe(400);
    expect(invalid.body.code).toBe('PORTAL.VALIDATION_FAILED');
    expect(Array.isArray(invalid.body.context?.fields)).toBe(true);

    const badId = await api()
      .post('/v1/portal/identity/assurance/elevations/nao-uuid/complete')
      .set(headers())
      .send({ resumeToken: 't' });
    expect(badId.status, JSON.stringify(badId.body)).toBe(400);
    expect(badId.body.context).toEqual({ fields: ['id'] });
  });

  it("C-0002-62 — dado avancada quando POST identity/representations então 201 'PROCURACAO_APRESENTADA'; simples então 403 { actKey: 'procuracao' }; GET lista a linha; DELETE então validUntil = 2026-09-13 e GET me não a lista", async () => {
    setCitizen(ouro);
    const body = {
      representedCpf: CPF.prata,
      representedName: 'Cidadã Prata (fixture)',
      instrumentDocumentId: EXTERNAL.instrument,
      scope: 'ait',
    };
    const createdRepresentation = await api()
      .post('/v1/portal/identity/representations')
      .set(headers())
      .send(body);
    expect(
      createdRepresentation.status,
      JSON.stringify(createdRepresentation.body),
    ).toBe(201);
    expect(createdRepresentation.body).toMatchObject({
      representedName: 'Cidadã Prata (fixture)',
      scope: 'ait',
      validUntil: null,
      state: 'PROCURACAO_APRESENTADA',
    });
    const representationId = createdRepresentation.body.id as string;
    expect(typeof representationId).toBe('string');

    const own = await api()
      .post('/v1/portal/identity/representations')
      .set(headers())
      .send({ ...body, representedCpf: CPF.ouro });
    expect(own.status, JSON.stringify(own.body)).toBe(400);
    expect(own.body.context).toEqual({ fields: ['representedCpf'] });

    setCitizen(bronze);
    const insufficient = await api()
      .post('/v1/portal/identity/representations')
      .set(headers())
      .send(body);
    expect(insufficient.status, JSON.stringify(insufficient.body)).toBe(403);
    expect(insufficient.body.code).toBe('PORTAL.ASSURANCE_INSUFFICIENT');
    expect(insufficient.body.context).toMatchObject({
      actKey: 'procuracao',
      required: 'avancada',
      current: 'simples',
    });

    setCitizen(ouro);
    const list = await api()
      .get('/v1/portal/identity/representations')
      .set(headers());
    expect(list.status, JSON.stringify(list.body)).toBe(200);
    expect(
      list.body.find((row: { id: string }) => row.id === representationId),
    ).toMatchObject({
      representedName: 'Cidadã Prata (fixture)',
      scope: 'ait',
      state: 'PROCURACAO_APRESENTADA',
      refusalReason: null,
    });

    const deleted = await api()
      .delete(`/v1/portal/identity/representations/${representationId}`)
      .set(headers());
    expect(deleted.status, JSON.stringify(deleted.body)).toBe(200);
    expect(deleted.body).toMatchObject({
      id: representationId,
      validUntil: '2026-09-13',
    });

    const me = await api().get('/v1/portal/identity/me').set(headers());
    expect(me.status).toBe(200);
    expect(
      me.body.representations.some(
        (row: { id: string }) => row.id === representationId,
      ),
    ).toBe(false);

    const missing = await api()
      .delete(`/v1/portal/identity/representations/${randomUUID()}`)
      .set(headers());
    expect(missing.status, JSON.stringify(missing.body)).toBe(404);
    expect(missing.body.context).toEqual({ kind: 'representation' });
  });

  it('C-0002-63 — dado PUT identity/preferences sem If-Match então 428 PORTAL.IF_MATCH_REQUIRED; com If-Match "1" então 422 SERVICE_UNAVAILABLE \'preferences_substrato_pendente\'', async () => {
    setCitizen(prata);
    const withoutIfMatch = await api()
      .put('/v1/portal/identity/preferences')
      .set(headers())
      .send({ channel: 'email' });
    expect(withoutIfMatch.status, JSON.stringify(withoutIfMatch.body)).toBe(
      428,
    );
    expect(withoutIfMatch.body.code).toBe('PORTAL.IF_MATCH_REQUIRED');

    const unavailable = await api()
      .put('/v1/portal/identity/preferences')
      .set(headers({ 'if-match': '"1"' }))
      .send({ channel: 'email' });
    expect(unavailable.status, JSON.stringify(unavailable.body)).toBe(422);
    expect(unavailable.body.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
    expect(unavailable.body.context).toEqual({
      unavailableReason: 'preferences_substrato_pendente',
      alternativeChannelNote: null,
    });
  });
});

describe('CTG-0002 §2.3/§4 — POST requests: idempotência M9 e elegibilidade (C-0002-64, C-0002-65)', () => {
  it('C-0002-64 — dado POST requests sem Idempotency-Key então 400 { fields: [\'Idempotency-Key\'] }; com chave então 201 + ETag "1"; repetido igual então 201 igual + Idempotency-Replayed; mesma chave com corpo diferente então 409 { key }', async () => {
    setCitizen(prata);
    const body = {
      serviceKey: 'consulta_multas',
      targetKind: 'none',
      channel: 'portal',
    };
    const withoutKey = await api()
      .post('/v1/portal/requests')
      .set({ authorization: 'Bearer local', 'x-tenant-id': TENANT_ID })
      .send(body);
    expect(withoutKey.status, JSON.stringify(withoutKey.body)).toBe(400);
    expect(withoutKey.body.code).toBe('PORTAL.VALIDATION_FAILED');
    expect(withoutKey.body.context).toEqual({ fields: ['Idempotency-Key'] });

    const key = `e2e-${randomUUID()}`;
    const first = await api()
      .post('/v1/portal/requests')
      .set(headers({ 'idempotency-key': key }))
      .send(body);
    expect(first.status, JSON.stringify(first.body)).toBe(201);
    expect(first.body).toMatchObject({
      state: 'PEDIDO_EM_COMPOSICAO',
      minimumAssurance: 'simples',
      version: 1,
      prefilled: {},
    });
    expect(first.body.requirements).toEqual(['Conta gov.br']);
    expect(typeof first.body.requestId).toBe('string');
    expect(first.headers.etag).toBe('"1"');

    const replay = await api()
      .post('/v1/portal/requests')
      .set(headers({ 'idempotency-key': key }))
      .send(body);
    expect(replay.status, JSON.stringify(replay.body)).toBe(201);
    expect(replay.body).toEqual(first.body);
    expect(String(replay.headers['idempotency-replayed'])).toBe('true');

    const divergent = await api()
      .post('/v1/portal/requests')
      .set(headers({ 'idempotency-key': key }))
      .send({ ...body, targetKind: 'ait', targetId: AITS.f2 });
    expect(divergent.status, JSON.stringify(divergent.body)).toBe(409);
    expect(divergent.body.code).toBe(
      'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY',
    );
    expect(divergent.body.context).toEqual({ key });

    // o rascunho em aberto criado aqui é desistido para não bloquear os ciclos seguintes (REQUEST_DRAFT_EXISTS)
    const withdrawn = await api()
      .post(`/v1/portal/requests/${first.body.requestId}/withdraw`)
      .set(headers({ 'if-match': '"1"' }))
      .send({ confirm: true });
    expect(withdrawn.status, JSON.stringify(withdrawn.body)).toBe(200);
  });

  it("C-0002-65 — dado defesa_previa sobre ait com vínculo então 422 SERVICE_UNAVAILABLE { unavailableReason, alternativeChannelNote presencial }; manifestar então 422 INELIGIBLE; consulta_multas sobre ait sem vínculo então 404 { kind: 'ait' }", async () => {
    setCitizen(prata);
    const unavailable = await api()
      .post('/v1/portal/requests')
      .set(headers())
      .send({
        serviceKey: 'defesa_previa',
        targetKind: 'ait',
        targetId: AITS.f2,
        channel: 'portal',
      });
    expect(unavailable.status, JSON.stringify(unavailable.body)).toBe(422);
    expect(unavailable.body.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
    expect(unavailable.body.context).toEqual({
      unavailableReason: REASON_R0007,
      alternativeChannelNote: PRESENTIAL_NOTE,
    });

    const ineligible = await api()
      .post('/v1/portal/requests')
      .set(headers())
      .send({
        serviceKey: 'manifestar',
        targetKind: 'none',
        channel: 'portal',
      });
    expect(ineligible.status, JSON.stringify(ineligible.body)).toBe(422);
    expect(ineligible.body.code).toBe('PORTAL.INELIGIBLE');
    expect(ineligible.body.context).toEqual({
      reason: 'servico_com_rota_propria',
      alternative: '/v1/portal/manifestations',
      serviceKey: 'manifestar',
    });

    const notEntitled = await api()
      .post('/v1/portal/requests')
      .set(headers())
      .send({
        serviceKey: 'consulta_multas',
        targetKind: 'ait',
        targetId: AITS.f1,
        channel: 'portal',
      });
    expect(notEntitled.status, JSON.stringify(notEntitled.body)).toBe(404);
    expect(notEntitled.body.code).toBe('PORTAL.NOT_FOUND');
    expect(notEntitled.body.context).toEqual({ kind: 'ait' });

    const unknownService = await api()
      .post('/v1/portal/requests')
      .set(headers())
      .send({
        serviceKey: 'nao_existe',
        targetKind: 'none',
        channel: 'portal',
      });
    expect(unknownService.status, JSON.stringify(unknownService.body)).toBe(
      404,
    );
    expect(unknownService.body.context).toEqual({ kind: 'service' });
  });
});

describe('CTG-0002 §3 — ciclo consulta_multas e adesão SNE (C-0002-66, C-0002-67)', () => {
  it("C-0002-66 — dado ciclo consulta_multas: create → draft (If-Match) → submit então 'AVALIACAO_OFERECIDA' com protocolo LOCAL-E2E-2026-<7 dígitos>; GET requests lista com nextAction; GET requests/{id} ETag = version e timeline []; evaluation então 'CONCLUIDO'; de novo então 409", async () => {
    const createdRequest = await createRequest(prata, {
      serviceKey: 'consulta_multas',
      targetKind: 'none',
      channel: 'portal',
    });
    const id = createdRequest.requestId;

    const draftWithoutIfMatch = await api()
      .put(`/v1/portal/requests/${id}/draft`)
      .set(headers())
      .send({});
    expect(
      draftWithoutIfMatch.status,
      JSON.stringify(draftWithoutIfMatch.body),
    ).toBe(428);
    expect(draftWithoutIfMatch.body.code).toBe('PORTAL.IF_MATCH_REQUIRED');

    const draft = await api()
      .put(`/v1/portal/requests/${id}/draft`)
      .set(headers({ 'if-match': '"1"' }))
      .send({});
    expect(draft.status, JSON.stringify(draft.body)).toBe(200);
    expect(draft.body).toMatchObject({ requestId: id, version: 2 });
    expect(draft.headers.etag).toBe('"2"');

    const submitted = await api()
      .post(`/v1/portal/requests/${id}/submit`)
      .set(headers())
      .send(SIGNATURE);
    expect(submitted.status, JSON.stringify(submitted.body)).toBe(200);
    expect(submitted.body).toMatchObject({
      requestId: id,
      state: 'AVALIACAO_OFERECIDA',
      delegation: { status: 'not_applicable' },
    });
    expect(submitted.body.protocol.number).toMatch(/^LOCAL-E2E-2026-\d{7}$/);
    expect(submitted.body.protocol).toMatchObject({ channel: 'portal' });
    expect(String(submitted.body.protocol.receiptHash)).toMatch(
      /^[0-9a-f]{64}$/,
    );
    expect(submitted.headers.etag).toBe(`"${submitted.body.version}"`);

    const list = await api().get('/v1/portal/requests').set(headers());
    expect(list.status, JSON.stringify(list.body)).toBe(200);
    const item = list.body.items.find(
      (row: { requestId: string }) => row.requestId === id,
    );
    expect(item).toMatchObject({
      protocol: submitted.body.protocol.number,
      serviceKey: 'consulta_multas',
      situation: 'AVALIACAO_OFERECIDA',
      nextAction: {
        by: 'citizen',
        label: 'portal.requests.nextAction.AVALIACAO_OFERECIDA',
        dueOn: null,
      },
      targetLabel: null,
    });
    expect(list.body).toMatchObject({ page: 1, pageSize: 20 });
    expect(list.body.total).toBeGreaterThanOrEqual(1);

    const badState = await api()
      .get('/v1/portal/requests?state=INVENTADO')
      .set(headers());
    expect(badState.status).toBe(400);
    expect(badState.body.code).toBe('PORTAL.ENUM_INVALID');
    expect(badState.body.context.field).toBe('state');

    const detail = await api().get(`/v1/portal/requests/${id}`).set(headers());
    expect(detail.status, JSON.stringify(detail.body)).toBe(200);
    expect(detail.headers.etag).toBe(`"${detail.body.request.version}"`);
    expect(detail.body.request).toMatchObject({
      requestId: id,
      state: 'AVALIACAO_OFERECIDA',
      serviceKey: 'consulta_multas',
      channel: 'portal',
    });
    expect(detail.body.request.protocol).toMatchObject({
      number: submitted.body.protocol.number,
    });
    expect(detail.body.request.draft).toMatchObject({
      version: 2,
      payload: {},
    });
    expect(detail.body.timeline).toEqual([]);
    expect(detail.body.deadlines).toEqual([]);
    expect(detail.body.documents).toEqual([]);
    expect(detail.body.decision).toBeNull();
    expect(detail.body.actions).toMatchObject({
      canRespondDiligence: false,
      canWithdraw: false,
      withdrawalBlockedReason: 'estado_nao_admite',
      canAppeal: false,
      nextInstanceServiceKey: null,
    });

    const evaluated = await api()
      .post(`/v1/portal/requests/${id}/evaluation`)
      .set(headers())
      .send({ scores: SCORES });
    expect(evaluated.status, JSON.stringify(evaluated.body)).toBe(201);
    expect(evaluated.body).toMatchObject({ requestId: id, state: 'CONCLUIDO' });
    expect(typeof evaluated.body.evaluationId).toBe('string');

    // Depois de CONCLUIDO a máquina (§2.3 passo 4, REQUEST_STATE_INVALID) e o unique da avaliação
    // (passo 5, EVALUATION_ALREADY_SUBMITTED — texto de C-0002-66) respondem 409; a divergência
    // interna do contrato está no relatório — aqui só o 409 e um dos dois códigos.
    const again = await api()
      .post(`/v1/portal/requests/${id}/evaluation`)
      .set(headers())
      .send({ scores: SCORES });
    expect(again.status, JSON.stringify(again.body)).toBe(409);
    expect([
      'PORTAL.EVALUATION_ALREADY_SUBMITTED',
      'PORTAL.REQUEST_STATE_INVALID',
    ]).toContain(again.body.code);
    created.concluded = id;
  });

  it("C-0002-67 — dado CPF 11111111111 simples quando adesao_sne (create + draft + submit) então 403 { actKey: 'adesao_sne' } e 'AGUARDANDO_NIVEL_ASSINATURA' persistido; o MESMO CPF avancada quando submit de novo então 200 'EM_ANDAMENTO_NO_ORGAO' delegated e GET sne/enrollment enrolled; outro CPF então 404", async () => {
    const createdRequest = await createRequest(bronze, {
      serviceKey: 'adesao_sne',
      targetKind: 'none',
      channel: 'portal',
    });
    const id = createdRequest.requestId;
    const draft = await api()
      .put(`/v1/portal/requests/${id}/draft`)
      .set(headers({ 'if-match': '"1"' }))
      .send({
        email: 'bronze@local-e2e.invalid',
        consent: { textVersion: '1', effectsAck: [...SNE_EFFECTS] },
      });
    expect(draft.status, JSON.stringify(draft.body)).toBe(200);

    const insufficient = await api()
      .post(`/v1/portal/requests/${id}/submit`)
      .set(headers())
      .send({ ...SIGNATURE, ...CONSEQUENCE_ACK });
    expect(insufficient.status, JSON.stringify(insufficient.body)).toBe(403);
    expect(insufficient.body.code).toBe('PORTAL.ASSURANCE_INSUFFICIENT');
    expect(insufficient.body.context).toMatchObject({
      actKey: 'adesao_sne',
      required: 'avancada',
      current: 'simples',
      resumeRoute: `/v1/portal/requests/${id}`,
    });

    const pending = await api().get(`/v1/portal/requests/${id}`).set(headers());
    expect(pending.status).toBe(200);
    expect(pending.body.request).toMatchObject({
      state: 'AGUARDANDO_NIVEL_ASSINATURA',
      minimumAssurance: 'avancada',
    });

    // elevação simulada: mesmo CPF (mesmo sujeito) com claim avancada
    setCitizen({ cpf: CPF.bronze, level: 'avancada' });
    const submitted = await api()
      .post(`/v1/portal/requests/${id}/submit`)
      .set(headers())
      .send({ ...SIGNATURE, ...CONSEQUENCE_ACK });
    expect(submitted.status, JSON.stringify(submitted.body)).toBe(200);
    expect(submitted.body).toMatchObject({
      state: 'EM_ANDAMENTO_NO_ORGAO',
      delegation: { status: 'delegated' },
    });
    expect(typeof submitted.body.delegation.externalId).toBe('string');
    expect(submitted.body.protocol.number).toMatch(/^LOCAL-E2E-2026-\d{7}$/);

    const enrollment = await api()
      .get('/v1/portal/sne/enrollment')
      .set(headers());
    expect(enrollment.status, JSON.stringify(enrollment.body)).toBe(200);
    expect(enrollment.body).toMatchObject({ enrolled: true, cancelable: true });

    setCitizen(ouro);
    const other = await api().get(`/v1/portal/requests/${id}`).set(headers());
    expect(other.status, JSON.stringify(other.body)).toBe(404);
    expect(other.body.code).toBe('PORTAL.NOT_FOUND');
    expect(other.body.context).toEqual({ kind: 'request' });
    created.bronzeInProgress = id;
  });
});

describe('CTG-0002 §3.1 — 502 DELEGATION_FAILED com alvo falso (C-0002-68)', () => {
  it("C-0002-68 — dado app com PORTAL_DELEGATION_TARGETS sobrescrito (alvo falso que lança em consulta_multas) quando submit então 502 { protocol, retryPolicy }; GET então 'PROTOCOLADO' failed; submit repetido (mesma chave) então 502 replay; nova chave então 409 REQUEST_STATE_INVALID", async () => {
    const requests = (await importModule('@detran/portal-requests')) as {
      PORTAL_DELEGATION_TARGETS: symbol;
      UnavailableDelegationTarget: new (
        serviceKey: string,
        reason: string,
        kinds: string[],
      ) => unknown;
    };
    const failingTarget = {
      serviceKey: 'consulta_multas',
      targetKinds: ['none', 'ait'],
      availability: () => null,
      delegate: async () => {
        const error = new Error('alvo falso: falha simulada (C-0002-68)');
        error.name = 'FakeFailingDelegationTarget';
        throw error;
      },
    };
    const targets = new Map<string, unknown>([
      ['consulta_multas', failingTarget],
      [
        'defesa_previa',
        new requests.UnavailableDelegationTarget(
          'defesa_previa',
          REASON_R0007,
          ['ait'],
        ),
      ],
    ]);
    failingApp = await createPortalApp([
      { token: requests.PORTAL_DELEGATION_TARGETS, value: targets },
    ]);
    const failing = request(failingApp.getHttpServer());

    setCitizen(ouro);
    const createdRequest = await failing
      .post('/v1/portal/requests')
      .set(headers())
      .send({
        serviceKey: 'consulta_multas',
        targetKind: 'none',
        channel: 'portal',
      });
    expect(createdRequest.status, JSON.stringify(createdRequest.body)).toBe(
      201,
    );
    const id = createdRequest.body.requestId as string;

    const key = `e2e-${randomUUID()}`;
    const failed = await failing
      .post(`/v1/portal/requests/${id}/submit`)
      .set(headers({ 'idempotency-key': key }))
      .send(SIGNATURE);
    expect(failed.status, JSON.stringify(failed.body)).toBe(502);
    expect(failed.body.code).toBe('PORTAL.DELEGATION_FAILED');
    expect(failed.body.context).toMatchObject({
      retryPolicy: 'pendencia_interna',
    });
    expect(String(failed.body.context.protocol)).toMatch(
      /^LOCAL-E2E-2026-\d{7}$/,
    );

    const detail = await failing
      .get(`/v1/portal/requests/${id}`)
      .set(headers());
    expect(detail.status, JSON.stringify(detail.body)).toBe(200);
    expect(detail.body.request).toMatchObject({
      state: 'PROTOCOLADO',
      delegation: { status: 'failed', error: 'FakeFailingDelegationTarget' },
    });
    expect(detail.body.request.protocol).toMatchObject({
      number: failed.body.context.protocol,
    });

    const replay = await failing
      .post(`/v1/portal/requests/${id}/submit`)
      .set(headers({ 'idempotency-key': key }))
      .send(SIGNATURE);
    expect(replay.status, JSON.stringify(replay.body)).toBe(502);
    expect(replay.body).toEqual(failed.body);
    expect(String(replay.headers['idempotency-replayed'])).toBe('true');

    const retry = await failing
      .post(`/v1/portal/requests/${id}/submit`)
      .set(headers())
      .send(SIGNATURE);
    expect(retry.status, JSON.stringify(retry.body)).toBe(409);
    expect(retry.body.code).toBe('PORTAL.REQUEST_STATE_INVALID');
    expect(retry.body.context).toEqual({
      state: 'PROTOCOLADO',
      allowed: ['PEDIDO_EM_COMPOSICAO', 'AGUARDANDO_NIVEL_ASSINATURA'],
    });

    await asOwner(client);
    const outbox = await client.query<{ payload: { domainEvent: string } }>(
      `select payload from integration.outbox where tenant_id = $1 and aggregate_id = $2 order by created_at, id`,
      [TENANT_ID, id],
    );
    expect(outbox.rows.map((row) => row.payload.domainEvent)).toEqual([
      'SOLICITACAO_CRIADA',
      'SOLICITACAO_PROTOCOLADA',
    ]);
  }, 60_000);
});

describe('CTG-0002 §2.3 — withdraw, ownership, recibo, decisão, diligência (C-0002-69, C-0002-70)', () => {
  it("C-0002-69 — dado request PEDIDO_EM_COMPOSICAO quando POST withdraw { confirm:true } com If-Match então 200 'DESISTIDO'; dado EM_ANDAMENTO_NO_ORGAO então 409 { state, allowed:[3] }; { confirm:false } então 400", async () => {
    const draftRequest = await createRequest(prata, {
      serviceKey: 'consulta_cnh',
      targetKind: 'none',
      channel: 'portal',
    });
    const withdrawn = await api()
      .post(`/v1/portal/requests/${draftRequest.requestId}/withdraw`)
      .set(headers({ 'if-match': '"1"' }))
      .send({ confirm: true, reason: 'desisti' });
    expect(withdrawn.status, JSON.stringify(withdrawn.body)).toBe(200);
    expect(withdrawn.body).toMatchObject({
      requestId: draftRequest.requestId,
      state: 'DESISTIDO',
      version: 2,
    });
    expect(String(withdrawn.body.withdrawnAt).slice(0, 10)).toBe(FIXED_TODAY);
    expect(withdrawn.headers.etag).toBe('"2"');

    expect(
      created.bronzeInProgress,
      'C-0002-67 precisa ter deixado um pedido EM_ANDAMENTO_NO_ORGAO',
    ).toBeTruthy();
    setCitizen({ cpf: CPF.bronze, level: 'avancada' });
    const inProgress = await api()
      .get(`/v1/portal/requests/${created.bronzeInProgress}`)
      .set(headers());
    expect(inProgress.status).toBe(200);
    const blocked = await api()
      .post(`/v1/portal/requests/${created.bronzeInProgress}/withdraw`)
      .set(headers({ 'if-match': `"${inProgress.body.request.version}"` }))
      .send({ confirm: true });
    expect(blocked.status, JSON.stringify(blocked.body)).toBe(409);
    expect(blocked.body.code).toBe('PORTAL.REQUEST_STATE_INVALID');
    expect(blocked.body.context).toEqual({
      state: 'EM_ANDAMENTO_NO_ORGAO',
      allowed: [
        'PEDIDO_EM_COMPOSICAO',
        'AGUARDANDO_NIVEL_ASSINATURA',
        'AGUARDANDO_PAGAMENTO',
      ],
    });

    const another = await createRequest(prata, {
      serviceKey: 'consulta_bat',
      targetKind: 'crash',
      targetId: EXTERNAL.crash,
      channel: 'portal',
    });
    const notConfirmed = await api()
      .post(`/v1/portal/requests/${another.requestId}/withdraw`)
      .set(headers({ 'if-match': '"1"' }))
      .send({ confirm: false });
    expect(notConfirmed.status, JSON.stringify(notConfirmed.body)).toBe(400);
    expect(notConfirmed.body.code).toBe('PORTAL.VALIDATION_FAILED');
    const cleanup = await api()
      .post(`/v1/portal/requests/${another.requestId}/withdraw`)
      .set(headers({ 'if-match': '"1"' }))
      .send({ confirm: true });
    expect(cleanup.status).toBe(200);
  });

  it('dado pedido com delegação em curso quando withdraw então o Portal só retorna DESISTIDO após raitCaseWithdraw', async () => {
    expect(
      created.bronzeInProgress,
      'C-0002-67 precisa ter deixado um pedido EM_ANDAMENTO_NO_ORGAO',
    ).toBeTruthy();
    setCitizen({ cpf: CPF.bronze, level: 'avancada' });
    const current = await api()
      .get(`/v1/portal/requests/${created.bronzeInProgress}`)
      .set(headers());
    expect(current.status, JSON.stringify(current.body)).toBe(200);

    const withdrawn = await api()
      .post(`/v1/portal/requests/${created.bronzeInProgress}/withdraw`)
      .set(headers({ 'if-match': `"${current.body.request.version}"` }))
      .send({ confirm: true, reason: 'desisti' });
    expect(withdrawn.status, JSON.stringify(withdrawn.body)).toBe(200);
    expect(withdrawn.body).toMatchObject({
      requestId: created.bronzeInProgress,
      state: 'DESISTIDO',
    });

    const detail = await api()
      .get(`/v1/portal/requests/${created.bronzeInProgress}`)
      .set(headers());
    expect(detail.status, JSON.stringify(detail.body)).toBe(200);
    expect(detail.body.request.delegation).toMatchObject({
      command: 'inf:rait-case:withdraw',
      externalId: expect.any(String),
    });
  });

  it("C-0002-70 — dado request de outro CPF então GET 404 { kind:'request' }; GET receipt com protocolo então 422 'documento_assinado_pendente_r0014'; sem protocolo então 404 { kind:'protocol' }; GET decision então 404 { kind:'decision' }; POST diligences em EM_ANDAMENTO_NO_ORGAO então 422 fail-closed OD-R27-004", async () => {
    expect(
      created.concluded,
      'C-0002-66 precisa ter concluído um pedido',
    ).toBeTruthy();
    setCitizen(ouro);
    const foreign = await api()
      .get(`/v1/portal/requests/${created.concluded}`)
      .set(headers());
    expect(foreign.status, JSON.stringify(foreign.body)).toBe(404);
    expect(foreign.body.context).toEqual({ kind: 'request' });

    setCitizen(prata);
    const receipt = await api()
      .get(`/v1/portal/requests/${created.concluded}/receipt`)
      .set(headers());
    expect(receipt.status, JSON.stringify(receipt.body)).toBe(422);
    expect(receipt.body.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
    expect(receipt.body.context).toEqual({
      unavailableReason: 'documento_assinado_pendente_r0014',
      alternativeChannelNote: null,
    });

    const draftRequest = await createRequest(prata, {
      serviceKey: 'consulta_exame',
      targetKind: 'exam',
      targetId: EXTERNAL.exam,
      channel: 'portal',
    });
    const noProtocol = await api()
      .get(`/v1/portal/requests/${draftRequest.requestId}/receipt`)
      .set(headers());
    expect(noProtocol.status, JSON.stringify(noProtocol.body)).toBe(404);
    expect(noProtocol.body.context).toEqual({ kind: 'protocol' });

    const decision = await api()
      .get(`/v1/portal/requests/${created.concluded}/decision`)
      .set(headers());
    expect(decision.status, JSON.stringify(decision.body)).toBe(404);
    expect(decision.body.context).toEqual({ kind: 'decision' });

    const attachment = await api()
      .post(`/v1/portal/requests/${draftRequest.requestId}/attachments`)
      .set(headers())
      .send({
        filename: 'a.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 10,
        sha256: 'a'.repeat(64),
      });
    expect(attachment.status, JSON.stringify(attachment.body)).toBe(422);
    expect(attachment.body.context).toMatchObject({
      unavailableReason: 'documento_assinado_pendente_r0014',
    });
    const cleanup = await api()
      .post(`/v1/portal/requests/${draftRequest.requestId}/withdraw`)
      .set(headers({ 'if-match': '"1"' }))
      .send({ confirm: true });
    expect(cleanup.status).toBe(200);

    setCitizen({ cpf: CPF.bronze, level: 'avancada' });
    const diligence = await api()
      .post(
        `/v1/portal/requests/${created.bronzeInProgress}/diligences/${randomUUID()}/responses`,
      )
      .set(headers())
      .send({ text: 'resposta', attachmentIds: [] });
    expect(diligence.status, JSON.stringify(diligence.body)).toBe(422);
    expect(diligence.body.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
    // CTG-0003 não fixa o campo que carrega a decisão; exige apenas o vínculo.
    expect(JSON.stringify(diligence.body.context)).toMatch(
      /OD[-_ ]?R27[-_ ]?004/,
    );

    const diligenceWithoutKey = await api()
      .post(
        `/v1/portal/requests/${created.bronzeInProgress}/diligences/${randomUUID()}/responses`,
      )
      .set({ authorization: 'Bearer local', 'x-tenant-id': TENANT_ID })
      .send({ text: 'resposta', attachmentIds: [] });
    expect(
      diligenceWithoutKey.status,
      JSON.stringify(diligenceWithoutKey.body),
    ).toBe(400);
    expect(diligenceWithoutKey.body.context).toEqual({
      fields: ['Idempotency-Key'],
    });
  });

  it('dado diligência aberta quando POST responses então mantém 422 fail-closed sob OD-R27-004', async () => {
    expect(
      created.bronzeInProgress,
      'C-0002-67 precisa ter deixado um pedido EM_ANDAMENTO_NO_ORGAO',
    ).toBeTruthy();
    setCitizen({ cpf: CPF.bronze, level: 'avancada' });
    const response = await api()
      .post(
        `/v1/portal/requests/${created.bronzeInProgress}/diligences/${randomUUID()}/responses`,
      )
      .set(headers())
      .send({ text: 'resposta', attachmentIds: [] });
    expect(response.status, JSON.stringify(response.body)).toBe(422);
    expect(response.body.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
    expect(JSON.stringify(response.body.context)).toMatch(
      /OD[-_ ]?R27[-_ ]?004/,
    );
  });
});

describe('CTG-0002 §2.3 — política: papel fora da matriz (A3(a))', () => {
  it('dado DETRAN_LOCAL_ROLES=field-agent com claims válidas quando POST requests então 403 da política (sem code do Portal); technical-admin sem claims então 403 PORTAL.ASSURANCE_NOT_VERIFIED', async () => {
    setCitizen({ cpf: CPF.prata, level: 'avancada', roles: 'field-agent' });
    const denied = await api().post('/v1/portal/requests').set(headers()).send({
      serviceKey: 'consulta_multas',
      targetKind: 'none',
      channel: 'portal',
    });
    expect(denied.status, JSON.stringify(denied.body)).toBe(403);
    expect(denied.body.code).not.toBe('PORTAL.IDENTITY_NOT_CITIZEN');

    process.env.DETRAN_LOCAL_ROLES = 'technical-admin';
    delete process.env.DETRAN_LOCAL_ASSURANCE_LEVEL;
    delete process.env.DETRAN_LOCAL_CPF;
    const admin = await api().get('/v1/portal/requests').set(headers());
    expect(admin.status, JSON.stringify(admin.body)).toBe(403);
    expect(admin.body.code).toBe('PORTAL.ASSURANCE_NOT_VERIFIED');
  });
});

describe('CTG-0002 — auditoria das mutações (C-0002-71)', () => {
  it('C-0002-71 — dado os comandos acima então linhas de auditoria PORTAL_REQUEST_CREATE (portal.request), PORTAL_REQUEST_SUBMIT (portal.protocol), PORTAL_REQUEST_WITHDRAW, PORTAL_REPRESENTATION_CREATE (M20)', async () => {
    for (const [action, entity] of [
      ['PORTAL_REQUEST_CREATE', 'portal.request'],
      ['PORTAL_REQUEST_SUBMIT', 'portal.protocol'],
      ['PORTAL_REQUEST_WITHDRAW', 'portal.request'],
      ['PORTAL_REQUEST_EVALUATE', 'portal.evaluation'],
      ['PORTAL_REQUEST_COMPOSE', 'portal.request_draft'],
      ['PORTAL_REPRESENTATION_CREATE', 'portal.representation'],
      ['PORTAL_REPRESENTATION_DELETE', 'portal.representation'],
    ] as const) {
      const rows = await auditRows(client, action);
      expect(rows.length, action).toBeGreaterThan(0);
      expect(rows[0]!.entity, action).toBe(entity);
    }
  });
});
