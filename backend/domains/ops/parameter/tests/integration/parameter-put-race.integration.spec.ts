// Prova de concorrência de `OpsParameterService.put` (hotfix B9, defeito 1):
// dois `PUT` com o mesmo `If-Match` sobre a mesma chave/superfície/escopo/
// órgão nunca podem gravar a mesma versão duas vezes. T1 conclui e fica
// aberta; T2 começa; T1 commita; T2 tem de terminar em 412
// `RAIT.VERSION_CONFLICT` (serialização equivalente), nunca em sucesso.
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  NullParameterCache,
  OpsParameterService,
  SqlParameterOutbox,
  type ParameterClock,
} from '../../src/handwritten/parameter.service.js';
import {
  RaceSession,
  cloneDatabase,
  interleave,
  summarize,
  type RaceDatabase,
} from './race-harness.js';

const TODAY = '2026-09-29';
const clock: ParameterClock = {
  today: () => TODAY,
  now: () => `${TODAY}T12:00:00.000Z`,
};

let clone: RaceDatabase;
let owner: pg.Client;
let first: RaceSession;
let second: RaceSession;
let tenantId: string;
const actorId = '00000000-0000-4000-8000-0000b0000016';

function service(session: RaceSession, hold?: () => Promise<void>) {
  return new OpsParameterService(
    session.database(tenantId, actorId, hold) as never,
    {
      hasActiveContext: () => true,
      snapshot: () => ({ tenantId, actorId }),
    } as never,
    clock,
    new NullParameterCache(),
    new SqlParameterOutbox(),
  );
}

function put(
  session: RaceSession,
  key: string,
  ifMatch: string,
  effectiveFrom: string,
  hold?: () => Promise<void>,
) {
  return service(session, hold).put(
    key,
    {
      value: { value: effectiveFrom },
      valueType: 'string',
      reason: 'prova de concorrência',
      decisionRef: 'OD-001',
      effectiveFrom,
    },
    { ifMatch, idempotencyKey: randomUUID() },
  );
}

async function versionsOf(key: string) {
  const rows = await owner.query<{ version: number; effective_from: string }>(
    `select version, to_char(effective_from, 'YYYY-MM-DD') as effective_from
       from ops.parameter where tenant_id = $1 and key = $2
      order by version, effective_from`,
    [tenantId, key],
  );
  return rows.rows;
}

beforeAll(async () => {
  clone = await cloneDatabase();
  owner = new pg.Client({ connectionString: clone.url });
  await owner.connect();
  const tenant = await owner.query<{ id: string }>(
    'select id from auth.tenants order by id limit 1',
  );
  tenantId = tenant.rows[0]!.id;
  first = await RaceSession.open(clone.url, 'race-parameter-t1');
  second = await RaceSession.open(clone.url, 'race-parameter-t2');
}, 60_000);

afterAll(async () => {
  await first?.end();
  await second?.end();
  await owner?.end();
  await clone?.drop();
}, 60_000);

describe('ops.parameter PUT concorrente (checa e depois grava)', () => {
  it('dado chave sem versão quando dois PUT If-Match 0 concorrem então só uma versão 1 é gravada e o outro recebe 412', async () => {
    const key = `rait.race_${randomUUID().slice(0, 8)}`;
    const outcome = await interleave({
      observer: owner,
      second,
      runFirst: (hold) => put(first, key, '0', '2026-10-01', hold),
      runSecond: () => put(second, key, '0', '2026-11-01'),
    });
    expect(outcome.first.status).toBe('fulfilled');
    expect(await versionsOf(key)).toHaveLength(1);
    expect(summarize(outcome.second)).toMatchObject({
      status: 'rejected',
      code: 'RAIT.VERSION_CONFLICT',
      httpStatus: 412,
    });
    expect(outcome.secondWhileFirstOpen).toBe('blocked');
  });

  it('dado chave na versão 1 quando dois PUT If-Match 1 concorrem então só uma versão 2 é gravada e o outro recebe 412', async () => {
    const key = `rait.race_${randomUUID().slice(0, 8)}`;
    await put(first, key, '0', '2026-10-01');
    const outcome = await interleave({
      observer: owner,
      second,
      runFirst: (hold) => put(first, key, '1', '2026-11-01', hold),
      runSecond: () => put(second, key, '1', '2026-12-01'),
    });
    expect(outcome.first.status).toBe('fulfilled');
    expect((await versionsOf(key)).map((row) => row.version)).toEqual([1, 2]);
    expect(summarize(outcome.second)).toMatchObject({
      status: 'rejected',
      code: 'RAIT.VERSION_CONFLICT',
      httpStatus: 412,
    });
    expect(outcome.secondWhileFirstOpen).toBe('blocked');
  });
});
