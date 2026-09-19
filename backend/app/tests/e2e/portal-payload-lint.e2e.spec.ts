import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  AITS,
  CPF,
  EXTERNAL,
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
const forbidden = [
  'MANIFESTATION_TRANSITIONS',
  'REQUEST_TRANSITIONS',
  'infraction_state_ref',
  'CdtPort',
  'SnePort',
  'RenachPort',
  'Senatran',
  'RENAEST',
  'RENAINF',
  'pending_complement',
  'delegation_domain',
  'delegation_command',
  'subjectCpfHash',
  'tenantId',
  '@fixture.invalid',
  'payload_json',
  'integration.outbox',
] as const;
const routes = [
  '/v1/portal/identity/representations',
  '/v1/portal/services',
  `/v1/portal/aits/${AITS.f2}`,
  `/v1/portal/aits/${AITS.f2}/points`,
  '/v1/portal/points-summary',
  '/v1/portal/requests',
  `/v1/portal/requests/${JOURNEY_READ_REQUEST_ID}`,
  `/v1/portal/requests/${JOURNEY_READ_REQUEST_ID}/receipt`,
  `/v1/portal/requests/${JOURNEY_READ_REQUEST_ID}/decision`,
  '/v1/portal/inbox',
  '/v1/portal/sne/enrollment',
  '/v1/portal/documents/cnh',
  '/v1/portal/vehicles',
  `/v1/portal/vehicles/${EXTERNAL.vehicle}/clearance`,
  '/v1/portal/crashes',
  `/v1/portal/crashes/${EXTERNAL.crash}`,
  '/v1/portal/exams',
  `/v1/portal/exams/${EXTERNAL.exam}`,
  '/v1/portal/manifestations',
  '/v1/portal/service-charter/manifestar/deadline',
] as const;
async function get(path: string, citizen: CitizenEnv = prata) {
  setCitizen(citizen);
  return api().get(path).set(headers());
}
const requestBody = (serviceKey: string, targetId = AITS.f2) => ({
  serviceKey,
  targetKind: 'ait',
  targetId,
  channel: 'portal',
});
async function requestService(serviceKey: string, targetId = AITS.f2) {
  const body = requestBody(serviceKey, targetId);
  setCitizen(prata);
  return api()
    .post('/v1/portal/requests')
    .set(
      headers({
        'idempotency-key': idempotencyKey(serviceKey, targetId, body),
      }),
    )
    .send(body);
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

describe('CTG-0004 §6 — serialização cidadã, SSE e paradas (C-4-66…70)', () => {
  it.each(forbidden)(
    'C-4-68 — dado todas as rotas e personas quando serializadas então não expõem token proibido %s',
    async (token) => {
      for (const citizen of [prata, bronze, ouro])
        for (const path of routes) {
          const r = await get(path, citizen);
          expect(bodyText(r.body), `${path} (${citizen.cpf})`).not.toContain(
            token,
          );
        }
    },
  );
  it('C-4-68 — dado GET identity/me do Prata quando serializa então só cpf do titular aparece no campo cpf', async () => {
    const r = await get('/v1/portal/identity/me', prata);
    // CTG-0004.md: §6 e A15; portal-route-contract.md:50.
    expect(r.status, bodyText(r.body)).toBe(200);
    expect(asRecord(r.body).cpf).toBe(CPF.prata);
    expect(bodyText(r.body)).not.toContain(CPF.bronze);
    expect(bodyText(r.body)).not.toContain(CPF.ouro);
  });
  it('C-4-68 — dado respostas do Prata quando serializa então CPF de Ouro nunca aparece', async () => {
    for (const path of [...routes, '/v1/portal/identity/me']) {
      const r = await get(path, prata);
      expect(bodyText(r.body), path).not.toContain(CPF.ouro);
    }
  });
  it('C-4-69 — dado M15 defesa quando POST então nunca retorna sucesso simulado', async () => {
    const r = await requestService('defesa_previa');
    expect(r.status).toBe(422);
  });
  it('C-4-69 — dado M15 indicação quando POST então nunca retorna sucesso simulado', async () => {
    const r = await requestService('indicacao_condutor');
    expect(r.status).toBe(422);
  });
  it('C-4-69 — dado M15 CETRAN quando POST então nunca retorna sucesso simulado', async () => {
    const r = await requestService('recurso_cetran');
    expect(r.status).toBe(422);
  });
  it('C-4-69 — dado OD-P15 LGPD completa quando POST então nunca retorna sucesso simulado', async () => {
    const r = await requestService('lgpd_declaracao');
    // CTG-0004.md: C-4-69 (§6), OD-P17 fixa M15 de privacidade.
    expect(r.status, bodyText(r.body)).toBe(422);
    expect(asRecord(r.body).code).toBe('PORTAL.SERVICE_UNAVAILABLE');
    expect(asRecord(asRecord(r.body).context).unavailableReason).toBe(
      'privacy_endpoint_pendente',
    );
  });
  it('C-4-69 — dado OD-P17 LGPD correção quando POST então nunca retorna sucesso simulado', async () => {
    const r = await requestService('lgpd_declaracao');
    // CTG-0004.md: C-4-69 (§6), OD-P17 fixa M15 de privacidade.
    expect(r.status, bodyText(r.body)).toBe(422);
    expect(asRecord(r.body).code).toBe('PORTAL.SERVICE_UNAVAILABLE');
    expect(asRecord(asRecord(r.body).context).unavailableReason).toBe(
      'privacy_endpoint_pendente',
    );
  });
  it('C-4-69 — dado OD-P17 LGPD eliminação quando POST então nunca retorna sucesso simulado', async () => {
    const r = await requestService('lgpd_declaracao');
    // CTG-0004.md: C-4-69 (§6), OD-P17 fixa M15 de privacidade.
    expect(r.status, bodyText(r.body)).toBe(422);
    expect(asRecord(r.body).code).toBe('PORTAL.SERVICE_UNAVAILABLE');
    expect(asRecord(asRecord(r.body).context).unavailableReason).toBe(
      'privacy_endpoint_pendente',
    );
  });
  it('C-4-69 — dado OD-P17 preferência pendente quando PUT então nunca retorna sucesso simulado', async () => {
    setCitizen(prata);
    const r = await api()
      .put('/v1/portal/identity/preferences')
      .set(headers({ 'if-match': '"1"' }))
      .send({ channel: 'email' });
    expect(r.status).toBe(422);
  });
  it('C-4-69 — dado OD-P19 junta médica quando POST então nunca retorna sucesso simulado', async () => {
    const body = {
      serviceKey: 'junta_medica',
      targetKind: 'exam',
      targetId: EXTERNAL.exam,
      channel: 'portal',
    };
    setCitizen(ouro);
    const r = await api()
      .post('/v1/portal/requests')
      .set(
        headers({
          'idempotency-key': idempotencyKey(
            'junta_medica',
            EXTERNAL.exam,
            body,
          ),
        }),
      )
      .send(body);
    // CTG-0002.md: §2.3 passo 3, junta fora do catálogo é NOT_FOUND { kind: service }.
    expect(r.status, bodyText(r.body)).toBe(404);
    expect(asRecord(r.body).code).toBe('PORTAL.NOT_FOUND');
    expect(asRecord(asRecord(r.body).context)).toEqual({ kind: 'service' });
  });
});
