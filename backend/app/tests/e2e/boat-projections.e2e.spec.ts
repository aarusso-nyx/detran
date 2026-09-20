import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PortalProjectors } from '@detran/portal-projections';

import {
  CPF,
  TENANT_ID,
  asOwner,
  createPortalApp,
  headers,
  newClient,
  resetLocalPortalRows,
  seedLocalParameters,
  seedLocalTenant,
  setCitizen,
  subjectIdOf,
} from './portal-e2e.support.js';

/** C-2-13/C-2-14 — rota Portal consumidora; não valida emissão do produtor. */
const client = newClient();
const citizen = { cpf: CPF.prata, level: 'avancada' as const };
let app: INestApplication;

beforeAll(async () => {
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  await client.connect();
  await seedLocalTenant(client);
  await seedLocalParameters(client);
  await resetLocalPortalRows(client);
  app = await createPortalApp();
  await subjectIdOf(app, citizen);
}, 60_000);

afterAll(async () => {
  await app?.close();
  await resetLocalPortalRows(client);
  await client.end();
});

describe('C-2-13/C-2-14 — source_pending no Portal', () => {
  it('não cria linha cidadã publicável para fato canônico source_pending; a rota existente devolve coleção vazia', async () => {
    const eventId = randomUUID();
    const crashId = randomUUID();
    await asOwner(client);
    await client.query(
      `insert into integration.outbox
        (id, tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status, created_at, available_at)
       values ($1, $2, 'SINISTRO_FECHADO', 'crash-record', $3, $4::jsonb, $5, 'pending', now(), now())`,
      [
        eventId,
        TENANT_ID,
        crashId,
        JSON.stringify({
          id: eventId,
          type: 'crash.changed',
          domainEvent: 'SINISTRO_FECHADO',
          schemaVersion: 1,
          occurredAt: '2026-09-16T11:00:00.000Z',
          tenantId: TENANT_ID,
          aggregate: { kind: 'crash-record', id: crashId, version: 1 },
          data: { state: 'FECHADO', identityStatus: 'source_pending' },
        }),
        `boat-projection-e2e-${eventId}`,
      ],
    );
    await app.get(PortalProjectors).tick(TENANT_ID);
    setCitizen(citizen);
    const response = await request(app.getHttpServer())
      .get('/v1/portal/crashes')
      .set(headers());
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.items).toEqual([]);
    const ledger = await client.query<{ count: string }>(
      `select count(*)::text as count from portal.projection_applied_event
        where tenant_id = $1 and event_id = $2 and projection = 'crash_view'`,
      [TENANT_ID, eventId],
    );
    expect(ledger.rows[0]?.count).toBe('1');
  });
});
