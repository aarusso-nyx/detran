import type { INestApplication } from '@nestjs/common';
import { SenatranAdapterError } from '@detran/senatran-adapter';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  CPF,
  TENANT_ID,
  clearCitizenEnv,
  createPortalApp,
  headers,
  importModule,
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
  seedJourneyFixtures,
} from './portal-journeys.support.js';

const client = newClient();
let app: INestApplication;
const subjects = { bronze: '', prata: '', ouro: '' };
const prata = { cpf: CPF.prata, level: 'avancada' as const };
const bronze = { cpf: CPF.bronze, level: 'simples' as const };
const ouro = { cpf: CPF.ouro, level: 'avancada' as const };

// A19(c): única porta falsa admitida, só neste arquivo, para provar a reação
// do Portal à indisponibilidade do provedor na fronteira do adapter.
const unavailable = () =>
  Promise.reject(
    new SenatranAdapterError(
      'provider unavailable (C-4-54)',
      'PROVIDER',
      503,
      0,
    ),
  );
const unavailablePorts = {
  cdt: {
    getCitizenLicense: unavailable,
    listCitizenVehicles: unavailable,
    getPaymentQuote: unavailable,
  },
  renach: { findDriverByCpf: unavailable },
  wsdenatranRead: {
    findVehicleByPlate: unavailable,
    findVehicleByRenavam: unavailable,
  },
};

beforeAll(async () => {
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
  process.env.SENATRAN_PROVIDER = 'mock';
  await client.connect();
  await seedLocalTenant(client);
  await seedLocalParameters(client);
  await resetLocalPortalRows(client);
  const projections = (await importModule('@detran/portal-projections')) as {
    PORTAL_NATIONAL_READ_PORTS: symbol;
  };
  app = await createPortalApp([
    { token: projections.PORTAL_NATIONAL_READ_PORTS, value: unavailablePorts },
  ]);
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

describe('CTG-0004 §8 — mock nacional indisponível (C-4-54)', () => {
  it('C-4-54 — dado mock indisponível quando GET CNH então 503 NATIONAL_READ_UNAVAILABLE com cachedAt e retryAfter', async () => {
    setCitizen(prata);
    const r = await request(app.getHttpServer())
      .get('/v1/portal/documents/cnh')
      .set(headers());
    expect(r.status, bodyText(r.body)).toBe(503);
    expect(asRecord(r.body).code).toBe('PORTAL.NATIONAL_READ_UNAVAILABLE');
    const context = asRecord(asRecord(r.body).context);
    expect(context.cachedAt).toBeNull();
    expect(context).toHaveProperty('retryAfter');
  }, 60_000);

  it('C-4-57 — dado SnePort PROVIDER indisponível quando POST adesão então 503 SNE_UPSTREAM_UNAVAILABLE sem linha nem outbox', async () => {
    const inbox = (await importModule('@detran/portal-inbox')) as {
      PORTAL_SNE_PORT: symbol;
    };
    const sneUnavailableApp = await createPortalApp([
      {
        token: inbox.PORTAL_SNE_PORT,
        value: { enrollCitizen: unavailable },
      },
    ]);
    try {
      const subjectId = await subjectIdOf(sneUnavailableApp, prata);
      await client.query(
        'delete from portal.sne_enrollment where tenant_id = $1 and subject_id = $2',
        [TENANT_ID, subjectId],
      );
      setCitizen(prata);
      const body = {
        email: 'prata-provider@fixture.invalid',
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
      const r = await request(sneUnavailableApp.getHttpServer())
        .post('/v1/portal/sne/enrollment')
        .set(headers({ 'idempotency-key': 'c4-57-sne-provider' }))
        .send(body);
      expect(r.status, bodyText(r.body)).toBe(503);
      expect(asRecord(r.body)).toMatchObject({
        code: 'PORTAL.SNE_UPSTREAM_UNAVAILABLE',
        context: { retryAfter: null },
      });
      const enrollment = await client.query(
        'select id from portal.sne_enrollment where tenant_id = $1 and subject_id = $2',
        [TENANT_ID, subjectId],
      );
      expect(enrollment.rows).toHaveLength(0);
      const outbox = await client.query(
        `select id from integration.outbox
          where tenant_id = $1 and topic = 'portal.sne-enrollment.changed'
            and payload #>> '{data,subjectId}' = $2`,
        [TENANT_ID, subjectId],
      );
      expect(outbox.rows).toHaveLength(0);
    } finally {
      await sneUnavailableApp.close();
    }
  }, 60_000);
});
