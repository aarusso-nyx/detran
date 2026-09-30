// Prova de concorrência dos comandos de alcoolemia (hotfix B9, defeito 4):
// o estado do procedimento é lido com select simples e depois se grava o
// filho e o novo estado. T1 conclui e fica aberta; T2 começa; T1 commita;
// T2 tem de ver o estado de T1 (409 `TEAT.ALCOHOL_STATE_INVALID`).
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  RecordRefusalCommand,
  type AlcoholDeps,
} from '../../src/handwritten/index.js';
import { FIXTURES, seedTriagemProcedure } from './harness.js';
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

function deps(session: RaceSession, hold?: () => Promise<void>): AlcoholDeps {
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
    outbox: { append: async () => ({ id: 'ignored' }) } as never,
    clock: { now: () => new Date().toISOString() },
  };
}

function refuse(
  session: RaceSession,
  procedureId: string,
  hold?: () => Promise<void>,
) {
  return new RecordRefusalCommand(deps(session, hold)).execute(procedureId, {
    kind: 'refusal',
    refusal_description: 'prova de concorrência',
  });
}

beforeAll(async () => {
  clone = await cloneDatabase();
  owner = new pg.Client({ connectionString: clone.url });
  await owner.connect();
  first = await RaceSession.open(clone.url, 'race-alcohol-t1');
  second = await RaceSession.open(clone.url, 'race-alcohol-t2');
}, 60_000);

afterAll(async () => {
  await first?.end();
  await second?.end();
  await owner?.end();
  await clone?.drop();
}, 60_000);

describe('procedimento de alcoolemia: checa estado e depois grava', () => {
  it('dado procedimento TRIAGEM quando duas recusas concorrem então só uma recusa é gravada', async () => {
    const { procedureId } = await seedTriagemProcedure(
      owner,
      FIXTURES.tenantId,
      FIXTURES.agencyId,
      FIXTURES.actorId,
      FIXTURES.shiftId,
    );
    const outcome = await interleave({
      observer: owner,
      second,
      runFirst: (hold) => refuse(first, procedureId, hold),
      runSecond: () => refuse(second, procedureId),
    });
    expect(outcome.first.status).toBe('fulfilled');
    const refusals = await owner.query<{ count: number }>(
      `select count(*)::int as count from inf.alcohol_refusal
        where procedure_id = $1`,
      [procedureId],
    );
    expect(refusals.rows[0]!.count).toBe(1);
    expect(summarize(outcome.second)).toMatchObject({
      status: 'rejected',
      code: 'TEAT.ALCOHOL_STATE_INVALID',
      httpStatus: 409,
    });
    expect(outcome.secondWhileFirstOpen).toBe('blocked');
  });
});
