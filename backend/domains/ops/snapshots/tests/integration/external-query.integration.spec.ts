import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  commandDeps,
  dropTenant,
  FIXTURES,
  importModule,
  isolatedTenant,
  newClient,
  runCommand,
  seedVehicle,
} from './harness.js';

/**
 * CTG-0003 §5.1 e §10 (R-0008, TASK-0006) — C-0003-34: `external-queries`
 * bem-sucedido grava, na mesma transação, o upsert do snapshot, a linha de
 * `snapshots_vehicle_snapshot` e a de `snapshots_external_query` com
 * `parameters_hash` determinístico.
 */

const COMMAND_EXPORTS = ['ExternalQueryCommand'];
const COMMAND_METHODS = ['execute', 'create', 'handle'];

const client: pg.Client = newClient();
let tenantId: string;
let actorId: string;

beforeAll(async () => {
  await client.connect();
  const isolated = await isolatedTenant(client, 'ops-snapshots-external-query');
  tenantId = isolated.tenantId;
  actorId = isolated.actorId;
});

afterAll(async () => {
  await dropTenant(client, tenantId);
  await client.end();
});

describe('CTG-0003 §5.1 — external-queries: transação e parameters_hash determinístico (C-0003-34)', () => {
  it('C-0003-34 — dado external-queries bem-sucedido então, na mesma transação, existem o upsert do snapshot, snapshots_vehicle_snapshot e snapshots_external_query com parameters_hash determinístico', async () => {
    const vehicleId = await seedVehicle(
      client,
      tenantId,
      'BRA2E19',
      'Fixture Sedan 1.6',
    );
    const dependencies = commandDeps(client, tenantId, actorId, {
      ports: {
        wsdenatranRead: {
          findVehicleByPlate: vi.fn(async () => ({
            plate: 'BRA2E19',
            makeModelDescription: 'Fixture Sedan 1.6',
          })),
        },
        renach: {
          findDriverByCpf: vi.fn(async () => undefined),
          findDriverByLicense: vi.fn(async () => undefined),
        },
      },
    });

    const first = await runCommand(
      () => importModule('../../src/handwritten/external-query.command.js'),
      'ops/snapshots/src/handwritten/external-query.command.ts',
      COMMAND_EXPORTS,
      COMMAND_METHODS,
      dependencies,
      {
        query_type: 'vehicle_by_plate',
        parameters: { plate: 'BRA2E19' },
        purpose: 'fiscalizacao-de-transito',
        agent_id: actorId,
        traffic_agency_id: FIXTURES.agencyId,
      },
    );

    const queries = await dependencies.repositories.externalQueries.list();
    expect(queries).toHaveLength(1);
    expect(queries[0]?.parameters_hash).toEqual(
      expect.stringMatching(/^sha256:/),
    );
    // §14.3: o órgão gravado é o declarado no corpo, nunca o tenant isolado.
    expect(queries[0]?.traffic_agency_id).toBe(FIXTURES.agencyId);
    expect(queries[0]?.traffic_agency_id).not.toBe(tenantId);

    const snapshots = await dependencies.repositories.vehicleSnapshots.list();
    expect(
      snapshots.some((snapshot) => snapshot.vehicle_id === vehicleId),
    ).toBe(true);

    const second = await runCommand(
      () => importModule('../../src/handwritten/external-query.command.js'),
      'ops/snapshots/src/handwritten/external-query.command.ts',
      COMMAND_EXPORTS,
      COMMAND_METHODS,
      dependencies,
      {
        query_type: 'vehicle_by_plate',
        parameters: { plate: 'BRA2E19' },
        purpose: 'fiscalizacao-de-transito',
        agent_id: actorId,
        traffic_agency_id: FIXTURES.agencyId,
      },
    );
    const queriesAfterSecond =
      await dependencies.repositories.externalQueries.list();
    const hashes = queriesAfterSecond.map((query) => query.parameters_hash);
    expect(new Set(hashes).size).toBe(1);
    expect(first.divergence_recorded).toBe(false);
    expect(second.divergence_recorded).toBe(false);
  });
});
