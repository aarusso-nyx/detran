import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  NormativeCatalogRepository,
  NormativeFramingRepository,
  NormativeLifecycleService,
  MobileNormativePackageRepository,
} from '@detran/inf-normative';

import { AitLifecycleService } from '../../src/ait-lifecycle.service.js';
import { AitCorrectionRepository } from '../../src/repositories/ait-correction.repository.js';
import { AitPersonRepository } from '../../src/repositories/ait-person.repository.js';
import { AitPrintEventRepository } from '../../src/repositories/ait-print-event.repository.js';
import { AitSignatureRepository } from '../../src/repositories/ait-signature.repository.js';
import { AitStatusHistoryRepository } from '../../src/repositories/ait-status-history.repository.js';
import { AitVehicleRepository } from '../../src/repositories/ait-vehicle.repository.js';
import { AitRepository } from '../../src/repositories/ait.repository.js';

const { Client } = pg;
const client = new Client({
  connectionString:
    process.env.DETRAN_TEST_DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/detran',
});
const tenantA = randomUUID();
const tenantB = randomUUID();
const actorA = randomUUID();
const actorB = randomUUID();

function context(tenantId: string, actorId: string) {
  return {
    hasActiveContext: () => true,
    snapshot: () => ({ tenantId, actorId }),
  };
}

function database(tenantId: string, actorId: string) {
  return {
    async tx<T>(work: (transaction: unknown) => Promise<T>) {
      await client.query('begin');
      try {
        await client.query('set local role role_app_backend');
        await client.query(`select set_config('app.tenant_id', $1, true)`, [
          tenantId,
        ]);
        await client.query(`select set_config('app.actor_id', $1, true)`, [
          actorId,
        ]);
        const result = await work({ query: client.query.bind(client) });
        await client.query('commit');
        return result;
      } catch (error) {
        await client.query('rollback');
        throw error;
      }
    },
  };
}

describe('AIT lifecycle', () => {
  beforeAll(async () => {
    await client.connect();
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(
      `insert into auth.tenants (id, slug, name) values ($1, $3, $5), ($2, $4, $6)`,
      [
        tenantA,
        tenantB,
        `ait-a-${tenantA.slice(0, 8)}`,
        `ait-b-${tenantB.slice(0, 8)}`,
        `Tenant A ${tenantA.slice(0, 8)}`,
        `Tenant B ${tenantB.slice(0, 8)}`,
      ],
    );
    await client.query(
      `insert into auth.users (id, tenant_id, email, display_name) values
       ($1, $3, $5, 'Actor A'), ($2, $4, $6, 'Actor B')`,
      [
        actorA,
        actorB,
        tenantA,
        tenantB,
        `${actorA}@test.invalid`,
        `${actorB}@test.invalid`,
      ],
    );
  });
  afterAll(() => client.end());

  it('creates a draft, satellites, immutable hash, and accepted status history', async () => {
    const dbA = database(tenantA, actorA);
    const ctxA = context(tenantA, actorA);
    const catalogs = new NormativeCatalogRepository(
      dbA as never,
      ctxA as never,
    );
    const framings = new NormativeFramingRepository(
      dbA as never,
      ctxA as never,
    );
    const packages = new MobileNormativePackageRepository(
      dbA as never,
      ctxA as never,
    );
    const normative = new NormativeLifecycleService(
      catalogs,
      framings,
      packages,
    );
    const catalog = await catalogs.create({
      traffic_agency_id: tenantA,
      name: 'CTB',
      catalog_type: 'traffic-code',
      version: '2026.1',
      valid_from: '2026-01-01',
      status: 'active',
    });
    const framing = await framings.create({
      catalog_id: catalog.id,
      framing_code: '74550',
      description: 'Infraction framing',
      status: 'active',
    });
    const fixture = await dbA.tx(async (tx: any) => {
      const vehicle = await tx.query(
        `insert into ops.snapshots_vehicle (plate, source) values ('BRA2E19', 'e2e') returning id`,
      );
      const person = await tx.query(
        `insert into ops.snapshots_person (person_type, name, source) values ('natural', 'Driver', 'e2e') returning id`,
      );
      return {
        vehicleId: vehicle.rows[0].id as string,
        personId: person.rows[0].id as string,
      };
    });
    const repositories = {
      ait: new AitRepository(dbA as never, ctxA as never),
      vehicles: new AitVehicleRepository(dbA as never, ctxA as never),
      people: new AitPersonRepository(dbA as never, ctxA as never),
      history: new AitStatusHistoryRepository(dbA as never, ctxA as never),
      corrections: new AitCorrectionRepository(dbA as never, ctxA as never),
      signatures: new AitSignatureRepository(dbA as never, ctxA as never),
      printEvents: new AitPrintEventRepository(dbA as never, ctxA as never),
    };
    const lifecycle = new AitLifecycleService(repositories, normative);
    const draftInput = {
      traffic_agency_id: tenantA,
      ait_number: '000001',
      series: 'A',
      agent_id: randomUUID(),
      shift_id: randomUUID(),
      device_id: randomUUID(),
      framing_id: framing.id,
      catalog_id: catalog.id,
      infraction_at: '2026-08-24T10:00:00.000Z',
      issued_at: '2026-08-24T10:01:00.000Z',
      issuance_mode: 'online',
      constatation_type: 'approach',
      location_description: 'Av. Brasil',
      uf: 'SP',
    };
    const draft = await lifecycle.createDraft(draftInput);
    await lifecycle.addVehicle(draft.id, {
      vehicle_snapshot_id: fixture.vehicleId,
      role: 'infractor',
      visually_confirmed_by_agent: true,
    });
    await lifecycle.addPerson(draft.id, {
      person_id: fixture.personId,
      role: 'driver',
      identified_by: 'document',
    });
    await lifecycle.recordScience(draft.id, {
      person_id: fixture.personId,
      signature_type: 'digital',
    });
    const issued = await lifecycle.finalize(draft.id, actorA);
    expect(issued.content_hash).toMatch(/^[a-f0-9]{64}$/u);
    await lifecycle.recordPrint(draft.id, { event_type: 'printed' });
    await lifecycle.queueTransmission(draft.id, actorA);
    await lifecycle.receiveProtocol(draft.id, 'RENAINF-001', actorA);
    const accepted = await lifecycle.accept(draft.id, actorA);
    expect(accepted.current_status).toBe('accepted');
    const history = await repositories.history.findAll();
    expect(
      history
        .filter((item) => item.ait_id === draft.id)
        .map((item) => item.status),
    ).toEqual(
      expect.arrayContaining([
        'draft',
        'issued',
        'pending_transmission',
        'received',
        'accepted',
      ]),
    );
    await expect(lifecycle.createDraft(draftInput)).rejects.toMatchObject({
      code: '23505',
    });

    const dbB = database(tenantB, actorB);
    const tenantBRows = await new AitRepository(
      dbB as never,
      context(tenantB, actorB) as never,
    ).findAll();
    expect(tenantBRows).toHaveLength(0);
  });
});
