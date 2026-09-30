// Prova de concorrência dos comandos de medida (hotfix B9, defeito 4): o
// estado da medida é lido e depois se grava o filho e/ou o novo estado. Sem
// bloqueio na leitura do pai, dois comandos concorrentes passam na mesma
// checagem de estado. T1 conclui e fica aberta; T2 começa; T1 commita; T2
// tem de ver o estado de T1 (409 `TEAT.MEASURE_STATE_INVALID`).
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  RecordRetentionCommand,
  ReleaseRetentionCommand,
  type MeasureDeps,
} from '../../src/handwritten/index.js';
import { FIXTURES, seedMeasureWithRetention } from './harness.js';
import {
  RaceSession,
  cloneDatabase,
  interleave,
  summarize,
  type RaceDatabase,
} from './race-harness.js';

let clone: RaceDatabase;
let owner: pg.Client;
let first: RaceSession;
let second: RaceSession;

function deps(session: RaceSession, hold?: () => Promise<void>): MeasureDeps {
  return {
    database: session.database(
      FIXTURES.tenantId,
      FIXTURES.actorId,
      hold,
    ) as never,
    requestContext: {
      hasActiveContext: () => true,
      snapshot: () =>
        ({ tenantId: FIXTURES.tenantId, actorId: FIXTURES.actorId }) as never,
    },
    repositories: {},
    deadlines: {
      computeMeasureDue: async (_code, startOn) => ({
        rawDueOn: startOn,
        dueOn: startOn,
      }),
    },
    featureFlags: { isEnabled: () => false },
    outbox: { append: async () => ({ id: randomUUID() }) } as never,
    clock: { now: () => new Date().toISOString() },
  };
}

async function seed() {
  return seedMeasureWithRetention(
    owner,
    FIXTURES.tenantId,
    FIXTURES.agencyId,
    FIXTURES.actorId,
    FIXTURES.shiftId,
    FIXTURES.deviceId,
    FIXTURES.vehicleSnapshotId,
    { currentStatus: 'RETIDO' },
  );
}

async function countOf(table: string, measureId: string, extra = '') {
  const result = await owner.query<{ count: number }>(
    `select count(*)::int as count from ${table}
      where measure_id = $1 ${extra}`,
    [measureId],
  );
  return result.rows[0]!.count;
}

beforeAll(async () => {
  clone = await cloneDatabase();
  owner = new pg.Client({ connectionString: clone.url });
  await owner.connect();
  first = await RaceSession.open(clone.url, 'race-measure-t1');
  second = await RaceSession.open(clone.url, 'race-measure-t2');
}, 60_000);

afterAll(async () => {
  await first?.end();
  await second?.end();
  await owner?.end();
  await clone?.drop();
}, 60_000);

describe('medida administrativa: checa estado e depois grava', () => {
  it('dado medida RETIDO quando release e register-retention concorrem então a retenção nova não é gravada sobre a medida já liberada', async () => {
    const { measureId, retentionId } = await seed();
    const outcome = await interleave({
      observer: owner,
      second,
      runFirst: (hold) =>
        new ReleaseRetentionCommand(deps(first, hold)).execute(retentionId),
      runSecond: () =>
        new RecordRetentionCommand(deps(second)).execute(measureId, {
          vehicle_snapshot_id: FIXTURES.vehicleSnapshotId,
          retention_reason: 'prova de concorrência',
        }),
    });
    expect(outcome.first.status).toBe('fulfilled');
    expect(await countOf('inf.measure_retention', measureId)).toBe(1);
    expect(summarize(outcome.second)).toMatchObject({
      status: 'rejected',
      code: 'TEAT.MEASURE_STATE_INVALID',
      httpStatus: 409,
    });
    expect(outcome.secondWhileFirstOpen).toBe('blocked');
  });

  it('dado medida RETIDO quando dois release concorrem então só uma transição LIBERADO_LOCAL é gravada', async () => {
    const { measureId, retentionId } = await seed();
    const outcome = await interleave({
      observer: owner,
      second,
      runFirst: (hold) =>
        new ReleaseRetentionCommand(deps(first, hold)).execute(retentionId),
      runSecond: () =>
        new ReleaseRetentionCommand(deps(second)).execute(retentionId),
    });
    expect(outcome.first.status).toBe('fulfilled');
    expect(
      await countOf(
        'inf.measure_status_history',
        measureId,
        `and status = 'LIBERADO_LOCAL'`,
      ),
    ).toBe(1);
    expect(summarize(outcome.second)).toMatchObject({
      status: 'rejected',
      code: 'TEAT.MEASURE_STATE_INVALID',
      httpStatus: 409,
    });
    expect(outcome.secondWhileFirstOpen).toBe('blocked');
  });
});
