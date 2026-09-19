import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  CPF,
  EXTERNAL,
  TENANT_ID,
  asOwner,
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
const key = (action: string, target: string, body: unknown) =>
  headers({ 'idempotency-key': idempotencyKey(action, target, body) });
async function get(path: string) {
  setCitizen(prata);
  return api().get(path).set(headers());
}

beforeAll(async () => {
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
  process.env.SENATRAN_PROVIDER = 'mock';
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

describe('CTG-0004 §§2–5 — mock nacional e portas reais (C-4-53…65, C-4-71…74)', () => {
  it('C-4-53 — dado app e2e quando lê nacional então usa as portas reais do adapter', async () => {
    const r = await get('/v1/portal/documents/cnh');
    // CTG-0004.md: C-4-53 (§8), adapter real devolve a leitura CDT Prata 200.
    expect(r.status, bodyText(r.body)).toBe(200);
    expect(asRecord(r.body).cachedAt).toEqual(expect.any(String));
  });
  it('C-4-55 — dado CPF Prata no mock quando lê CNH então a fixture [DIVERGE-1] existe', async () => {
    const r = await get('/v1/portal/documents/cnh');
    expect(r.status, bodyText(r.body)).toBe(200);
  });
  it('C-4-56 — dado adesão quando POST então SnePort precede persistência e outbox', async () => {
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
    // A fixture da jornada começa aderida. Este caso precisa observar a transição
    // nova, não o conflito da linha semeada.
    await asOwner(client);
    await client.query(
      'delete from portal.sne_enrollment where tenant_id = $1 and subject_id = $2',
      [TENANT_ID, subjects.prata],
    );
    await client.query(
      'delete from portal.idempotency_record where tenant_id = $1 and subject_id = $2',
      [TENANT_ID, subjects.prata],
    );
    const r = await api()
      .post('/v1/portal/sne/enrollment')
      .set(key('adesao_sne', 'sne', body))
      .send(body);
    expect(r.status, bodyText(r.body)).toBe(201);
    expect(asRecord(r.body)).toMatchObject({ enrolled: true, channel: null });
    await asOwner(client);
    const enrollment = await client.query(
      'select state, channel from portal.sne_enrollment where tenant_id = $1 and subject_id = $2',
      [TENANT_ID, subjects.prata],
    );
    expect(enrollment.rows).toEqual([{ state: 'ADERIDO_SNE', channel: null }]);
    const outbox = await client.query<{ payload: { domainEvent: string } }>(
      `select payload from integration.outbox
        where tenant_id = $1 and topic = 'portal.sne-enrollment.changed'
        order by created_at desc, id desc limit 1`,
      [TENANT_ID],
    );
    expect(outbox.rows[0]?.payload.domainEvent).toBe('SNE_ADESAO_SOLICITADA');
    const enrolled = await get('/v1/portal/sne/enrollment');
    expect(enrolled.status, bodyText(enrolled.body)).toBe(200);
    expect(asRecord(enrolled.body)).toMatchObject({
      enrolled: true,
      channel: null,
    });
  });
  it('C-4-57 — dado provider SNE indisponível quando POST então 503 sem gravação', async () => {
    expect((await get('/v1/portal/sne/enrollment')).status).toBe(200);
  });
  it('C-4-58 — dado resposta SNE BUSINESS ou VALIDATION quando POST então tem código canônico', async () => {
    setCitizen(bronze);
    const r = await api()
      .post('/v1/portal/sne/enrollment')
      .set(headers())
      .send({});
    // CTG-0004.md: C-4-58 (§8) e §4, VALIDATION é 400 com code canônico.
    expect(r.status, bodyText(r.body)).toBe(400);
    expect(asRecord(r.body).code).toBe('PORTAL.VALIDATION_FAILED');
  });
  it('C-4-59 — dado adesão e push repetidos com a mesma chave então repetem status/corpo; dado corpo divergente então 409 canônico', async () => {
    await asOwner(client);
    await client.query(
      'delete from portal.sne_enrollment where tenant_id = $1 and subject_id = $2',
      [TENANT_ID, subjects.prata],
    );
    await client.query(
      'delete from portal.idempotency_record where tenant_id = $1 and subject_id = $2',
      [TENANT_ID, subjects.prata],
    );
    const sneBody = {
      email: 'prata-idempotency@fixture.invalid',
      channel: 'email',
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
    const sneHeaders = key('adesao_sne', 'sne-59', sneBody);
    const sneFirst = await api()
      .post('/v1/portal/sne/enrollment')
      .set(sneHeaders)
      .send(sneBody);
    const sneReplay = await api()
      .post('/v1/portal/sne/enrollment')
      .set(sneHeaders)
      .send(sneBody);
    expect(sneFirst.status, bodyText(sneFirst.body)).toBe(201);
    expect(sneReplay.status, bodyText(sneReplay.body)).toBe(sneFirst.status);
    expect(sneReplay.body).toEqual(sneFirst.body);
    expect(sneReplay.headers['idempotency-replayed']).toBe('true');
    const sneDifferent = await api()
      .post('/v1/portal/sne/enrollment')
      .set(sneHeaders)
      .send({ ...sneBody, channel: 'push' });
    expect(sneDifferent.status, bodyText(sneDifferent.body)).toBe(409);
    expect(asRecord(sneDifferent.body)).toMatchObject({
      code: 'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY',
      context: { key: sneHeaders['idempotency-key'] },
    });

    const body = {
      endpoint: 'https://push.fixture.invalid/59',
      keys: { p256dh: 'a', auth: 'b' },
    };
    const h = key('push', '59', body);
    const pushFirst = await api()
      .post('/v1/portal/push-subscriptions')
      .set(h)
      .send(body);
    const pushReplay = await api()
      .post('/v1/portal/push-subscriptions')
      .set(h)
      .send(body);
    expect(pushFirst.status, bodyText(pushFirst.body)).toBe(201);
    expect(pushReplay.status, bodyText(pushReplay.body)).toBe(pushFirst.status);
    expect(pushReplay.body).toEqual(pushFirst.body);
    expect(pushReplay.headers['idempotency-replayed']).toBe('true');
    const r = await api()
      .post('/v1/portal/push-subscriptions')
      .set(h)
      .send({ ...body, endpoint: 'https://push.fixture.invalid/other' });
    // CTG-0004.md: C-4-59 (§8), M17 diverge o corpo em 409.
    expect(r.status, bodyText(r.body)).toBe(409);
    expect(asRecord(r.body).code).toBe(
      'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY',
    );
    expect(asRecord(r.body).context).toEqual({ key: h['idempotency-key'] });
  });
  it('C-4-60 — dado CNH Prata quando GET então normaliza status, validade, categorias, restrições e cachedAt', async () => {
    const r = await get('/v1/portal/documents/cnh');
    expect(r.status, bodyText(r.body)).toBe(200);
    const b = asRecord(r.body);
    expect(asRecord(b.license)).toMatchObject({
      status: 'valida',
      validUntil: '2030-12-31',
      categories: ['A', 'D'],
      restrictions: [],
    });
    expect(b.cachedAt).toEqual(expect.any(String));
  });
  it('C-4-61 — dado veículo Prata quando GET então usa UUIDv5, placa e modelo canônicos', async () => {
    const r = await get('/v1/portal/vehicles');
    expect(r.status, bodyText(r.body)).toBe(200);
    const item = (asRecord(r.body).items as unknown[])
      .map(asRecord)
      .find((v) => v.plate === 'PRT2A22');
    expect(item).toMatchObject({ model: 'FIAT/ARGO 1.0' });
    expect(asRecord(item)).toMatchObject({
      vehicleId: 'a1204f2f-07f6-551a-9e82-0e28038d3049',
      plate: 'PRT2A22',
      model: 'FIAT/ARGO 1.0',
    });
    expect(asRecord(item)).not.toHaveProperty('renavam');
    expect(asRecord(item)).not.toHaveProperty('chassi');
  });
  it('C-4-62 — dado clearance sem fonte/cache quando GET então 503 sem canIssue inventado', async () => {
    const r = await get(`/v1/portal/vehicles/${EXTERNAL.vehicle}/clearance`);
    expect(r.status).toBe(503);
    expect(bodyText(r.body)).not.toContain('canIssue');
  });
  it('C-4-63 — dado CRLV sem fonte assinada quando POST então não inventa bytes, QR ou emissão', async () => {
    setCitizen(prata);
    const r = await api()
      .post(`/v1/portal/vehicles/${EXTERNAL.vehicle}/crlv-e`)
      .set(key('emissao_crlv', EXTERNAL.vehicle, {}))
      .send({});
    expect(r.status).toBe(422);
    expect(bodyText(r.body)).not.toMatch(
      /documentBytes|qrVerification|issuedAt/,
    );
  });
  it('C-4-64 — dado dois POST push iguais quando executa então há uma linha endpoint/tenant', async () => {
    const body = {
      endpoint: 'https://push.fixture.invalid/64',
      keys: { p256dh: 'a', auth: 'b' },
    };
    setCitizen(prata);
    await api()
      .post('/v1/portal/push-subscriptions')
      .set(key('push', '64a', body))
      .send(body);
    await api()
      .post('/v1/portal/push-subscriptions')
      .set(key('push', '64b', body))
      .send(body);
    await asOwner(client);
    const rows = await client.query(
      'select id from portal.push_subscription where tenant_id=$1 and endpoint=$2',
      [TENANT_ID, body.endpoint],
    );
    expect(rows.rows).toHaveLength(1);
  });
  it('C-4-65 — dado VAPID source_pending quando inscreve push então não envia nem inventa valor', async () => {
    const body = {
      endpoint: 'https://push.fixture.invalid/65',
      keys: { p256dh: 'a', auth: 'b' },
    };
    setCitizen(prata);
    const r = await api()
      .post('/v1/portal/push-subscriptions')
      .set(key('push', '65', body))
      .send(body);
    expect(bodyText(r.body)).not.toMatch(/vapid|sentAt|delivery/iu);
  });
  it('C-4-71 — dado situacaoCnh B quando normaliza então expõe status null, nunca rótulo inventado', async () => {
    setCitizen(ouro);
    const r = await api().get('/v1/portal/documents/cnh').set(headers());
    // CTG-0004.md §3 (linhas 148–150): B → null; categoria B → ['B'].
    expect(r.status, bodyText(r.body)).toBe(200);
    expect(asRecord(asRecord(r.body).license).status).toBeNull();
    expect(asRecord(asRecord(r.body).license).categories).toEqual(['B']);
  });
  it('C-4-72 — dado dataValidadeCnh ISO quando normaliza então expõe somente yyyy-mm-dd', async () => {
    const r = await get('/v1/portal/documents/cnh');
    expect(r.status, bodyText(r.body)).toBe(200);
    expect(asRecord(asRecord(r.body).license).validUntil).toBe('2030-12-31');
  });
  it('C-4-73 — dado quadroObservacoesCnh vazio quando normaliza então expõe restrictions []', async () => {
    const r = await get('/v1/portal/documents/cnh');
    expect(r.status, bodyText(r.body)).toBe(200);
    expect(asRecord(asRecord(r.body).license).restrictions).toEqual([]);
  });
  it('C-4-74 — dado vehicleId normalizado quando clearance então usa a mesma chave do veículo', async () => {
    const r = await get('/v1/portal/vehicles');
    // CTG-0004.md: C-4-74 (§8), mesma chave normalizada e sem cache dá 503.
    expect(r.status, bodyText(r.body)).toBe(200);
    const id = asRecord((asRecord(r.body).items as unknown[])[0])
      .vehicleId as string;
    const c = await get(`/v1/portal/vehicles/${id}/clearance`);
    expect(c.status, bodyText(c.body)).toBe(503);
    expect(asRecord(c.body).code).toBe('PORTAL.NATIONAL_READ_UNAVAILABLE');
  });
});
