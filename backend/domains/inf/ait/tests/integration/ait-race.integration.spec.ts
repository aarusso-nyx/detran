// Prova de concorrência do ciclo de vida do AIT (hotfix B9, defeito 4):
// `requestCancel` (`createCancelRequest`), as transições por `requireStatus`
// e a decisão de cancelamento leem o estado com select simples e depois
// gravam filho + novo estado. T1 conclui e fica aberta; T2 começa; T1
// commita; T2 tem de ver o estado de T1 (409), nunca repetir a transição.
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  MobileNormativePackageRepository,
  NormativeCatalogRepository,
  NormativeFramingRepository,
  NormativeLifecycleService,
} from '@detran/inf-normative';

import { AitLifecycleService } from '../../src/ait-lifecycle.service.js';
import { AitCorrectionRepository } from '../../src/repositories/ait-correction.repository.js';
import { AitPersonRepository } from '../../src/repositories/ait-person.repository.js';
import { AitPrintEventRepository } from '../../src/repositories/ait-print-event.repository.js';
import { AitSignatureRepository } from '../../src/repositories/ait-signature.repository.js';
import { AitStatusHistoryRepository } from '../../src/repositories/ait-status-history.repository.js';
import { AitVehicleRepository } from '../../src/repositories/ait-vehicle.repository.js';
import { AitRepository } from '../../src/repositories/ait.repository.js';
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
let tenantId: string;
let actorId: string;
let normative: NormativeLifecycleService;
let catalogId: string;
let framingId: string;

function context() {
  return {
    hasActiveContext: () => true,
    snapshot: () => ({ tenantId, actorId }),
  };
}

function lifecycle(session: RaceSession, hold?: () => Promise<void>) {
  const db = session.database(tenantId, actorId, hold);
  const ctx = context();
  return new AitLifecycleService(
    {
      ait: new AitRepository(db as never, ctx as never),
      vehicles: new AitVehicleRepository(db as never, ctx as never),
      people: new AitPersonRepository(db as never, ctx as never),
      history: new AitStatusHistoryRepository(db as never, ctx as never),
      corrections: new AitCorrectionRepository(db as never, ctx as never),
      signatures: new AitSignatureRepository(db as never, ctx as never),
      printEvents: new AitPrintEventRepository(db as never, ctx as never),
    },
    normative,
  );
}

async function finalizedAit(): Promise<string> {
  const service = lifecycle(first);
  const draft = await service.createDraft({
    traffic_agency_id: tenantId,
    ait_number: randomUUID().replace(/\D/g, '').slice(0, 6).padEnd(6, '0'),
    series: randomUUID().slice(0, 4),
    agent_id: randomUUID(),
    shift_id: randomUUID(),
    device_id: randomUUID(),
    framing_id: framingId,
    catalog_id: catalogId,
    infraction_at: '2026-09-10T10:00:00.000Z',
    issued_at: '2026-09-10T10:01:00.000Z',
    issuance_mode: 'online',
    constatation_type: 'approach',
    location_description: 'Av. Brasil',
    uf: 'AM',
  } as never);
  await service.finalize(draft.id, actorId);
  return draft.id;
}

function requestPostFinalCancel(
  session: RaceSession,
  aitId: string,
  hold?: () => Promise<void>,
) {
  return lifecycle(session, hold).createCancelRequest({
    entityType: 'ait-cancel-posfinal-request',
    trafficAgencyId: tenantId,
    idempotencyKey: randomUUID(),
    targetLocalActId: `local-${aitId}`,
    targetAitId: aitId,
    originStatus: 'FINALIZADO_LOCAL',
    justification: 'prova de concorrência',
    requestedBy: actorId,
  });
}

async function countOf(sql: string, value: string): Promise<number> {
  const result = await owner.query<{ count: number }>(sql, [value]);
  return result.rows[0]!.count;
}

beforeAll(async () => {
  clone = await cloneDatabase();
  owner = new pg.Client({ connectionString: clone.url });
  await owner.connect();
  tenantId = randomUUID();
  actorId = randomUUID();
  // Fixture (owner, só no clone): tenant e ator isolados.
  await owner.query(`select set_config('app.role', 'owner', false)`);
  await owner.query(
    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
    [tenantId, `ait-race-${tenantId.slice(0, 8)}`, 'AIT race'],
  );
  await owner.query(
    `insert into auth.users (id, tenant_id, email, display_name)
     values ($1, $2, $3, 'Actor')`,
    [actorId, tenantId, `${actorId}@test.invalid`],
  );
  first = await RaceSession.open(clone.url, 'race-ait-t1');
  second = await RaceSession.open(clone.url, 'race-ait-t2');
  const db = first.database(tenantId, actorId);
  const ctx = context();
  const catalogs = new NormativeCatalogRepository(db as never, ctx as never);
  const framings = new NormativeFramingRepository(db as never, ctx as never);
  const packages = new MobileNormativePackageRepository(
    db as never,
    ctx as never,
  );
  normative = new NormativeLifecycleService(catalogs, framings, packages);
  const catalog = await catalogs.create({
    traffic_agency_id: tenantId,
    name: 'CTB',
    catalog_type: 'traffic-code',
    version: '2026.race',
    valid_from: '2026-01-01',
    status: 'active',
  } as never);
  const framing = await framings.create({
    catalog_id: catalog.id,
    framing_code: '74550',
    approach_class: 'caso_2',
    description: 'Infraction framing',
    status: 'active',
  } as never);
  catalogId = catalog.id;
  framingId = framing.id;
}, 60_000);

afterAll(async () => {
  await first?.end();
  await second?.end();
  await owner?.end();
  await clone?.drop();
}, 60_000);

describe('AIT: checa estado e depois grava', () => {
  it('dado AIT FINALIZADO_LOCAL quando dois pedidos de cancelamento pós-final concorrem então só um pedido é gravado e o outro recebe 409', async () => {
    const aitId = await finalizedAit();
    const outcome = await interleave({
      observer: owner,
      second,
      runFirst: (hold) => requestPostFinalCancel(first, aitId, hold),
      runSecond: () => requestPostFinalCancel(second, aitId),
    });
    expect(outcome.first.status).toBe('fulfilled');
    expect(
      await countOf(
        `select count(*)::int as count from inf.ait_cancel_request
          where ait_id = $1`,
        aitId,
      ),
    ).toBe(1);
    expect(summarize(outcome.second)).toMatchObject({
      status: 'rejected',
      code: 'TEAT.AIT_STATE_INVALID',
      httpStatus: 409,
    });
    expect(outcome.secondWhileFirstOpen).toBe('blocked');
  });

  it('dado AIT FINALIZADO_LOCAL quando duas transições queue-transmission concorrem então só uma transição é gravada e o outro recebe 409', async () => {
    const aitId = await finalizedAit();
    const outcome = await interleave({
      observer: owner,
      second,
      runFirst: (hold) =>
        lifecycle(first, hold).queueTransmission(aitId, actorId),
      runSecond: () => lifecycle(second).queueTransmission(aitId, actorId),
    });
    expect(outcome.first.status).toBe('fulfilled');
    expect(
      await countOf(
        `select count(*)::int as count from inf.ait_status_history
          where ait_id = $1 and status = 'ENFILEIRADO'`,
        aitId,
      ),
    ).toBe(1);
    expect(summarize(outcome.second)).toMatchObject({
      status: 'rejected',
      code: 'TEAT.AIT_STATE_INVALID',
      httpStatus: 409,
    });
    expect(outcome.secondWhileFirstOpen).toBe('blocked');
  });

  it('dado pedido de cancelamento requested quando duas decisões concorrem então só uma decisão é gravada e a outra recebe 409', async () => {
    const request = await lifecycle(first).createCancelRequest({
      entityType: 'ait-cancel-request',
      trafficAgencyId: tenantId,
      idempotencyKey: randomUUID(),
      targetLocalActId: `local-${randomUUID()}`,
      originStatus: 'RASCUNHO_OFFLINE',
      justification: 'prova de concorrência',
      requestedBy: actorId,
    });
    const decide = (session: RaceSession, hold?: () => Promise<void>) =>
      lifecycle(session, hold).decideCancelRequest(
        request.id,
        'approve',
        'deferido',
        actorId,
      );
    const outcome = await interleave({
      observer: owner,
      second,
      runFirst: (hold) => decide(first, hold),
      runSecond: () => decide(second),
    });
    expect(outcome.first.status).toBe('fulfilled');
    expect(
      await countOf(
        `select count(*)::int as count from inf.ait_cancel_request_event
          where cancel_request_id = $1 and event_type = 'approved'`,
        request.id,
      ),
    ).toBe(1);
    expect(summarize(outcome.second)).toMatchObject({
      status: 'rejected',
      code: 'TEAT.AIT_CANCEL_ALREADY_DECIDED',
      httpStatus: 409,
    });
    expect(outcome.secondWhileFirstOpen).toBe('blocked');
  });
});
