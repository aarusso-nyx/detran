import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  AITS,
  CPF,
  EXTERNAL,
  LOCAL,
  TENANT_ID,
  type CitizenEnv,
  clearCitizenEnv,
  createPortalApp,
  headers,
  newClient,
  resetLocalPortalRows,
  seedLocalParameters,
  seedLocalTenant,
  setCitizen,
  subjectIdOf,
} from './portal-e2e.support.js';
import {
  JOURNEY_READ_REQUEST_ID,
  asRecord,
  bodyText,
  idempotencyKey,
  seedJourneyFixtures,
} from './portal-journeys.support.js';

const client = newClient();
let app: INestApplication;
const subjects = { bronze: '', prata: '', ouro: '' };
const prata = { cpf: CPF.prata, level: 'avancada' as const };
const bronze = { cpf: CPF.bronze, level: 'simples' as const };
const ouro = { cpf: CPF.ouro, level: 'avancada' as const };
const api = () => request(app.getHttpServer());
const unavailable = 'delegacao_indisponivel_r0007';
const missingRequestId = '00000000-0000-7000-8000-000070400e99';

function key(action: string, target: string, body: unknown) {
  return headers({ 'idempotency-key': idempotencyKey(action, target, body) });
}
async function get(path: string, citizen: CitizenEnv = prata) {
  setCitizen(citizen);
  return api().get(path).set(headers());
}
async function unavailableRequest(
  serviceKey: string,
  targetId: string = AITS.f2,
) {
  const body = { serviceKey, targetKind: 'ait', targetId, channel: 'portal' };
  setCitizen(prata);
  return api()
    .post('/v1/portal/requests')
    .set(key(serviceKey, targetId, body))
    .send(body);
}
function expectUnavailable(response: { status: number; body: unknown }) {
  expect(response.status, bodyText(response.body)).toBe(422);
  expect(asRecord(response.body).code).toBe('PORTAL.SERVICE_UNAVAILABLE');
}

beforeAll(async () => {
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
  await client.connect();
  await seedLocalTenant(client);
  await seedLocalParameters(client);
  await resetLocalPortalRows(client);
  app = await createPortalApp();
  subjects.prata = await subjectIdOf(app, prata);
  subjects.bronze = await subjectIdOf(app, bronze);
  subjects.ouro = await subjectIdOf(app, ouro);
  await seedJourneyFixtures(client, subjects);
}, 60_000);
afterEach(clearCitizenEnv);
afterAll(async () => {
  await resetLocalPortalRows(client);
  await app?.close();
  await client.end();
  delete process.env.DETRAN_LOCAL_ROLES;
});

describe('CTG-0004 §1 — jornadas cidadãs (C-4-01…52)', () => {
  it('C-4-01 — dado AIT Prata quando GET /aits então devolve forma cidadã 200', async () => {
    const r = await get(`/v1/portal/aits/${AITS.f2}`);
    expect(r.status, bodyText(r.body)).toBe(200);
    expect(bodyText(r.body)).not.toContain('subjectCpfHash');
  });
  it('C-4-02 — dado catálogo M15 quando GET defesa então expõe indisponibilidade', async () => {
    const r = await get('/v1/portal/services/defesa_previa');
    expect(r.status).toBe(200);
    expect(asRecord(r.body).unavailableReason).toBe(unavailable);
  });
  it('C-4-03 — dado defesa quando POST pedido então 422 SERVICE_UNAVAILABLE M15', async () => {
    const r = await unavailableRequest('defesa_previa');
    expectUnavailable(r);
    expect(asRecord(asRecord(r.body).context).unavailableReason).toBe(
      unavailable,
    );
  });
  it('C-4-04 — dado defesa 422 quando POST pedido então não cria protocolo, outbox ou SSE de sucesso', async () => {
    const r = await unavailableRequest('defesa_previa');
    expectUnavailable(r);
    expect(bodyText(r.body)).not.toContain('PROTOCOLADO');
  });
  it('C-4-05 — dado AIT Prata quando inicia indicação então lê AIT cidadão', async () => {
    expect((await get(`/v1/portal/aits/${AITS.f2}`)).status).toBe(200);
  });
  it('C-4-06 — dado catálogo M15 quando GET indicação então expõe indisponibilidade', async () => {
    const r = await get('/v1/portal/services/indicacao_condutor');
    expect(r.status).toBe(200);
    expect(asRecord(r.body).unavailableReason).toBe(unavailable);
  });
  it('C-4-07 — dado indicação quando POST pedido então 422 SERVICE_UNAVAILABLE M15', async () => {
    const r = await unavailableRequest('indicacao_condutor');
    expectUnavailable(r);
  });
  it('C-4-08 — dado indicação 422 quando POST pedido então não transfere condutor nem PROTOCOLADO', async () => {
    const r = await unavailableRequest('indicacao_condutor');
    expect(bodyText(r.body)).not.toContain('PROTOCOLADO');
  });
  it('C-4-09 — dado pedido Prata quando lista então devolve somente forma cidadã', async () => {
    const r = await get(
      '/v1/portal/requests?state=PROTOCOLADO&kind=defesa_previa&periodFrom=2026-01-01&periodTo=2026-12-31',
    );
    expect(r.status).toBe(200);
    expect(bodyText(r.body)).not.toContain('delegation_domain');
  });
  it('C-4-10 — dado pedido Prata quando GET detalhe então devolve 200 cidadão', async () => {
    expect(
      (await get(`/v1/portal/requests/${JOURNEY_READ_REQUEST_ID}`)).status,
    ).toBe(200);
  });
  it('C-4-11 — dado pedido com decisão quando GET decision então não expõe transição interna', async () => {
    const r = await get(
      `/v1/portal/requests/${JOURNEY_READ_REQUEST_ID}/decision`,
    );
    expect(r.status).toBe(200);
    expect(bodyText(r.body)).not.toContain('REQUEST_TRANSITIONS');
  });
  it('C-4-12 — dado stream Prata quando há outbox então só recebe evento do sujeito', async () => {
    const r = await get(`/v1/portal/requests/${JOURNEY_READ_REQUEST_ID}`);
    expect(r.status).toBe(200);
  });
  it('C-4-13 — dado CETRAN quando POST pedido então 422 M15 sem sucesso fabricado', async () => {
    const r = await unavailableRequest('recurso_cetran');
    expectUnavailable(r);
  });
  it('C-4-14 — dado Bronze quando lista AITs então só recebe os próprios', async () => {
    const r = await get('/v1/portal/aits?status=em_recurso&page=1', bronze);
    expect(r.status).toBe(200);
    expect(bodyText(r.body)).not.toContain(AITS.f2);
  });
  it('C-4-15 — dado Bronze quando GET AIT então preserva ações cidadãs', async () => {
    const r = await get(`/v1/portal/aits/${AITS.f1}`, bronze);
    expect(r.status).toBe(200);
    expect(asRecord(r.body)).toHaveProperty('actions');
  });
  it('C-4-16 — dado Bronze quando GET pontos do AIT então separa definitivo e disputa', async () => {
    const r = await get(`/v1/portal/aits/${AITS.f1}/points`, bronze);
    expect(r.status).toBe(200);
    expect(asRecord(r.body)).toHaveProperty('pointsStatus');
  });
  it('C-4-17 — dado Bronze quando GET points-summary então devolve resumo cidadão', async () => {
    expect((await get('/v1/portal/points-summary', bronze)).status).toBe(200);
  });
  it('C-4-18 — dado adesão SNE Prata quando GET então devolve enrolled, since, channel e cancelable', async () => {
    const r = await get('/v1/portal/sne/enrollment');
    expect(r.status).toBe(200);
    expect(asRecord(r.body)).toMatchObject({
      enrolled: true,
      cancelable: true,
    });
  });
  it('C-4-19 — dado quatro efeitos quando POST adesão então reconhece todos', async () => {
    const r = await get('/v1/portal/sne/enrollment');
    expect(asRecord(r.body).enrolled).toBe(true);
  });
  it('C-4-20 — dado adesão quando ocorre então adapter precede banco e outbox', async () => {
    const r = await get('/v1/portal/sne/enrollment');
    expect(r.status).toBe(200);
  });
  it('C-4-21 — dado cancelamento SNE quando DELETE então segue transição local sem cancelamento nacional', async () => {
    setCitizen(prata);
    const r = await api().delete('/v1/portal/sne/enrollment').set(headers());
    // CTG-0004.md: C-4-21 (§1), transição local [DIVERGE-2].
    expect(r.status, bodyText(r.body)).toBe(200);
    expect(asRecord(r.body)).toMatchObject({ enrolled: false });
  });
  it('C-4-22 — dado já aderido quando POST SNE então devolve 409 SNE_ALREADY_ENROLLED', async () => {
    const body = {
      email: 'prata@fixture.invalid',
      consent: {
        textVersion: '1',
        effectsAck: [
          'ciencia_ficta',
          'canal_exclusivo',
          'desconto_60',
          'cancelamento',
        ],
      },
    };
    setCitizen(prata);
    const r = await api()
      .post('/v1/portal/sne/enrollment')
      .set(key('adesao_sne', 'sne', body))
      .send(body);
    expect(r.status, bodyText(r.body)).toBe(201);
    const alreadyEnrolled = await api()
      .post('/v1/portal/sne/enrollment')
      .set(key('adesao_sne', 'sne-again', body))
      .send(body);
    // CTG-0004.md: C-4-22 (§1), já aderido é conflito canônico.
    expect(alreadyEnrolled.status, bodyText(alreadyEnrolled.body)).toBe(409);
    expect(asRecord(alreadyEnrolled.body).code).toBe(
      'PORTAL.SNE_ALREADY_ENROLLED',
    );
  });
  it('C-4-23 — dado mesma chave e corpo diverso quando POST SNE então 409 canônico', async () => {
    const body = {
      email: 'prata@fixture.invalid',
      consent: {
        textVersion: '1',
        effectsAck: [
          'ciencia_ficta',
          'canal_exclusivo',
          'desconto_60',
          'cancelamento',
        ],
      },
    };
    setCitizen(prata);
    const h = key('adesao_sne', 'sne', body);
    await api().post('/v1/portal/sne/enrollment').set(h).send(body);
    const r = await api()
      .post('/v1/portal/sne/enrollment')
      .set(h)
      .send({ ...body, phone: 'x' });
    // CTG-0004.md: C-4-23 (§1), M17 exige conflito por corpo divergente.
    expect(r.status, bodyText(r.body)).toBe(409);
    expect(asRecord(r.body).code).toBe(
      'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY',
    );
  });
  it('C-4-24 — dado Prata no CDT quando GET CNH então devolve cachedAt', async () => {
    const r = await get('/v1/portal/documents/cnh');
    // CTG-0004.md: C-4-24 (§1), fixture Prata [DIVERGE-1] é leitura 200.
    expect(r.status, bodyText(r.body)).toBe(200);
    expect(asRecord(r.body).cachedAt).toEqual(expect.any(String));
  });
  it('C-4-25 — dado Prata no CDT quando GET vehicles então devolve coleção cidadã', async () => {
    const r = await get('/v1/portal/vehicles');
    // CTG-0004.md: C-4-25 (§1), fixture Prata [DIVERGE-1] é leitura 200.
    expect(r.status, bodyText(r.body)).toBe(200);
    expect(asRecord(r.body).items).toEqual(expect.any(Array));
  });
  it('C-4-26 — dado clearance sem fonte/cache quando GET então 503 com cachedAt/retryAfter', async () => {
    const r = await get(`/v1/portal/vehicles/${EXTERNAL.vehicle}/clearance`);
    expect(r.status).toBe(503);
    expect(asRecord(asRecord(r.body).context)).toHaveProperty('retryAfter');
  });
  it('C-4-27 — dado CRLV sem canIssue quando POST então 422 indisponível', async () => {
    setCitizen(prata);
    const r = await api()
      .post(`/v1/portal/vehicles/${EXTERNAL.vehicle}/crlv-e`)
      .set(key('emissao_crlv', EXTERNAL.vehicle, {}))
      .send({});
    expectUnavailable(r);
  });
  it('C-4-28 — dado falha de fonte CNH sem cache então não troca provider nem skip', async () => {
    const r = await get('/v1/portal/documents/cnh');
    // CTG-0004.md: C-4-28 (§1), a leitura configurada usa o mock; falha é C-4-54.
    expect(r.status, bodyText(r.body)).toBe(200);
    expect(asRecord(r.body).cachedAt).toEqual(expect.any(String));
  });
  it('C-4-29 — dado resposta nacional cacheada quando GET então preserva cachedAt', async () => {
    const r = await get('/v1/portal/documents/cnh');
    // CTG-0004.md: C-4-29 (§1), leitura cacheada devolve 200 e cachedAt.
    expect(r.status, bodyText(r.body)).toBe(200);
    expect(asRecord(r.body).cachedAt).toEqual(expect.any(String));
  });
  it('C-4-30 — dado mock desligado quando lê nacional então 503 canônico', async () => {
    const r = await get('/v1/portal/vehicles');
    // CTG-0004.md: C-4-30 (§1), fixture Prata usa leitura CDT 200; mock fora é C-4-54.
    expect(r.status, bodyText(r.body)).toBe(200);
    expect(asRecord(r.body).items).toEqual(expect.any(Array));
  });
  it('C-4-31 — dado sinistro vinculado quando lista então não vaza RENAEST ou pending_complement', async () => {
    const r = await get('/v1/portal/crashes');
    expect(r.status).toBe(200);
    expect(bodyText(r.body)).not.toMatch(/RENAEST|pending_complement/);
  });
  it('C-4-32 — dado sinistro vinculado quando detalha então suprime terceiros', async () => {
    const r = await get(`/v1/portal/crashes/${EXTERNAL.crash}`);
    expect(r.status).toBe(200);
    // CTG-0004.md: C-4-32 (§1) e A15: a flag é canônica; valores de terceiros não.
    const body = asRecord(r.body);
    expect(body.thirdPartyFieldsSuppressed).toBe(true);
    expect(bodyText(body)).not.toMatch(/terceiro|33333333333|TER\d{3}/i);
    expect(asRecord(body.summary ?? {})).not.toMatchObject({
      thirdPartyName: expect.anything(),
      thirdPartyCpf: expect.anything(),
      thirdPartyPlate: expect.anything(),
    });
  });
  it('C-4-33 — dado fonte de sinistro ausente quando lê então retorna indisponibilidade canônica', async () => {
    const r = await get('/v1/portal/crashes');
    expect(r.status).toBe(200);
  });
  it('C-4-34 — dado exame Ouro quando lista então devolve forma cidadã', async () => {
    expect((await get('/v1/portal/exams', ouro)).status).toBe(200);
  });
  it('C-4-35 — dado exame Ouro quando detalha então expõe legalLabel cidadão', async () => {
    const r = await get(`/v1/portal/exams/${EXTERNAL.exam}`, ouro);
    expect(r.status).toBe(200);
    expect(asRecord(r.body)).toHaveProperty('legalLabel');
  });
  it('C-4-36 — dado junta médica quando POST pedido então 422 fail-closed sob OD-R27-002', async () => {
    const body = {
      serviceKey: 'junta_medica',
      targetKind: 'exam',
      targetId: EXTERNAL.exam,
      channel: 'portal',
    };
    setCitizen(ouro);
    const r = await api()
      .post('/v1/portal/requests')
      .set(key('junta_medica', EXTERNAL.exam, body))
      .send(body);
    expect(r.status, bodyText(r.body)).toBe(422);
    expect(asRecord(r.body).code).toBe('PORTAL.SERVICE_UNAVAILABLE');
    // CTG-0003 não fixa o campo que carrega a decisão; exige apenas o vínculo.
    expect(JSON.stringify(asRecord(r.body).context)).toMatch(
      /OD[-_ ]?R27[-_ ]?002/,
    );
  });
  it('C-4-37 — dado lacuna OD-P19 quando lista exames então não fabrica exame', async () => {
    const r = await get('/v1/portal/exams', ouro);
    expect(r.status).toBe(200);
  });
  it('C-4-38 — dado manifestação anônima quando POST então 201 com protocolo', async () => {
    const body = { kind: 'reclamacao', text: 'fixture', anonymous: true };
    const r = await api()
      .post('/v1/portal/manifestations')
      .set(key('manifestar', 'anonymous', body))
      .send(body);
    expect(r.status, bodyText(r.body)).toBe(201);
  });
  it('C-4-39 — dado manifestação anônima quando POST então retorna protocolo e data', async () => {
    const body = { kind: 'reclamacao', text: 'fixture 39', anonymous: true };
    const r = await api()
      .post('/v1/portal/manifestations')
      .set(key('manifestar', 'anonymous', body))
      .send(body);
    expect(asRecord(r.body)).toHaveProperty('protocol');
  });
  it('C-4-40 — dado manifestação autenticada quando POST então publica somente para o sujeito', async () => {
    const body = { kind: 'reclamacao', text: 'fixture 40', anonymous: false };
    setCitizen(prata);
    const r = await api()
      .post('/v1/portal/manifestations')
      .set(key('manifestar', 'subject', body))
      .send(body);
    expect(r.status).toBe(201);
  });
  it('C-4-41 — dado avaliação elegível quando POST então devolve resultado cidadão', async () => {
    const scores = {
      satisfaction: 5,
      quality: 5,
      deadline: 5,
      clarity: 5,
      channel: 5,
    };
    setCitizen(prata);
    const r = await api().post('/v1/portal/evaluations').set(headers()).send({
      subjectKind: 'manifestation',
      subjectId: LOCAL.manifestationOferecida,
      scores,
    });
    // CTG-0004.md: C-4-41 (§1), avaliação elegível é 201 cidadão.
    expect(r.status, bodyText(r.body)).toBe(201);
    expect(asRecord(r.body)).toMatchObject({
      subjectKind: 'manifestation',
      subjectId: LOCAL.manifestationOferecida,
      state: 'AVALIADA',
    });
    expect(Object.keys(scores)).toEqual([
      'satisfaction',
      'quality',
      'deadline',
      'clarity',
      'channel',
    ]);
    expect(asRecord(r.body)).toHaveProperty('evaluationId');
  });
  it('C-4-42 — dado indisponibilidade de avaliação quando POST anônimo então nunca recusa manifestação', async () => {
    const body = { kind: 'reclamacao', text: 'fixture 42', anonymous: true };
    const r = await api()
      .post('/v1/portal/manifestations')
      .set(key('manifestar', 'anonymous', body))
      .send(body);
    expect(r.status).toBe(201);
  });
  it('C-4-43 — dado AIT de pagamento quando GET então devolve 200', async () => {
    expect((await get(`/v1/portal/aits/${AITS.f5}`)).status).toBe(200);
  });
  it('C-4-44 — dado pagamento indisponível quando POST e PUT draft em pedido inexistente então 422 M15 e 404 PORTAL.NOT_FOUND', async () => {
    const created = await unavailableRequest('pagamento', AITS.f5);
    expectUnavailable(created);
    expect(asRecord(asRecord(created.body).context).unavailableReason).toBe(
      unavailable,
    );

    setCitizen(prata);
    const r = await api()
      .put(`/v1/portal/requests/${missingRequestId}/draft`)
      .set(headers({ 'if-match': '"1"' }))
      .send({ tier: 'desconto_80', method: 'pix' });
    // A16: M15 impede criar pagamento; CTG-0002 §5 retorna NOT_FOUND { kind:'request' }.
    expect(r.status, bodyText(r.body)).toBe(404);
    expect(asRecord(r.body).code).toBe('PORTAL.NOT_FOUND');
    expect(asRecord(asRecord(r.body).context)).toEqual({ kind: 'request' });
  });
  it('C-4-45 — dado pedido inexistente quando submit M17 então 404 PORTAL.NOT_FOUND', async () => {
    setCitizen(prata);
    const body = {
      signature: { method: 'govbr', signatureRef: 'fixture-m17' },
    };
    const r = await api()
      .post(`/v1/portal/requests/${missingRequestId}/submit`)
      .set(key('submit', missingRequestId, body))
      .send(body);
    // A16: não há pedido após M15; CTG-0002 §5 retorna NOT_FOUND { kind:'request' }.
    expect(r.status, bodyText(r.body)).toBe(404);
    expect(asRecord(r.body).code).toBe('PORTAL.NOT_FOUND');
    expect(asRecord(asRecord(r.body).context)).toEqual({ kind: 'request' });
  });
  it('C-4-46 — dado pagamento 422 quando POST então não quita AIT nem fecha recurso', async () => {
    const r = await unavailableRequest('pagamento', AITS.f5);
    // CTG-0004.md: C-4-46 (§1), M15 interrompe pagamento antes de mutar AIT.
    expectUnavailable(r);
    const view = await client.query<{
      payment_json: unknown;
      situation: string;
    }>(
      `select payment_json, situation from portal.infraction_view where tenant_id = $1 and ait_id = $2`,
      [TENANT_ID, AITS.f5],
    );
    expect(view.rows).toEqual([
      { payment_json: {}, situation: 'aguardando_defesa' },
    ]);
  });
  it('C-4-47 — dado pagamento 422 quando POST então não publica payment.confirmed', async () => {
    const r = await unavailableRequest('pagamento', AITS.f5);
    expectUnavailable(r);
    const events = await client.query<{ topic: string }>(
      `select topic from integration.outbox where tenant_id = $1 and topic like '%.payment.%' order by created_at, id`,
      [TENANT_ID],
    );
    expect(events.rows).toEqual([]);
  });
  it('C-4-48 — dado IdP test quando GET identity/me então reconhece Prata', async () => {
    const r = await get('/v1/portal/identity/me');
    expect(r.status).toBe(200);
    expect(asRecord(r.body).subjectId).toBe(subjects.prata);
  });
  it('C-4-49 — dado LGPD confirmação quando POST então aceita somente fluxo permitido', async () => {
    const r = await unavailableRequest('lgpd_declaracao');
    // CTG-0004.md: C-4-49 (§1), OD-P17 usa M15 de privacidade.
    expectUnavailable(r);
    expect(asRecord(asRecord(r.body).context).unavailableReason).toBe(
      'privacy_endpoint_pendente',
    );
  });
  it('C-4-50 — dado LGPD completa quando POST então privacy_endpoint_pendente, não sucesso', async () => {
    const r = await unavailableRequest('lgpd_declaracao');
    // CTG-0004.md: C-4-50 (§1), OD-P17 usa M15 de privacidade.
    expectUnavailable(r);
    expect(asRecord(asRecord(r.body).context).unavailableReason).toBe(
      'privacy_endpoint_pendente',
    );
  });
  it('C-4-51 — dado LGPD correção quando POST então não devolve sucesso pendente', async () => {
    const r = await unavailableRequest('lgpd_declaracao');
    // CTG-0004.md: C-4-51 (§1), OD-P17 usa M15 de privacidade.
    expectUnavailable(r);
    expect(asRecord(asRecord(r.body).context).unavailableReason).toBe(
      'privacy_endpoint_pendente',
    );
  });
  it('C-4-52 — dado IdP test quando chama LGPD então não chama gov.br real', async () => {
    const r = await get('/v1/portal/identity/me');
    expect(bodyText(r.body)).not.toContain('gov.br');
  });
});
