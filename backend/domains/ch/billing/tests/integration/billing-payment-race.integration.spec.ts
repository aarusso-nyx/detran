// Prova de concorrência de `validatePayment` (hotfix B9, defeito 5): o
// bloqueio FINANCIAL do atendimento só sai quando nenhum outro item está
// pendente, mas cada transação checa os outros itens no próprio snapshot.
// Dois itens pagos ao mesmo tempo: T1 paga e fica aberta; T2 paga; T1
// commita. Com os dois itens pagos, o bloqueio FINANCIAL não pode ficar ativo.
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { BillingLifecycleService } from '../../src/billing-lifecycle.service.js';
import { BillingItemRepository } from '../../src/repositories/billing-item.repository.js';
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
const tenantId = randomUUID();
const actorId = randomUUID();
const clinicId = randomUUID();
const patientId = randomUUID();

function billing(session: RaceSession, hold?: () => Promise<void>) {
  const requestContext = {
    hasActiveContext: () => true,
    snapshot: () => ({ tenantId, actorId }),
  };
  return new BillingLifecycleService(
    new BillingItemRepository(
      session.database(tenantId, actorId, hold) as never,
      requestContext as never,
    ),
    requestContext as never,
  );
}

/** Atendimento com `items` itens ISSUED e o bloqueio FINANCIAL ativo. */
async function seedEncounter(items: number) {
  const encounterId = randomUUID();
  await owner.query(
    `insert into ch.encounter (id, tenant_id, clinic_id, patient_id, status)
     values ($1, $2, $3, $4, 'IN_PROGRESS')`,
    [encounterId, tenantId, clinicId, patientId],
  );
  const itemIds: string[] = [];
  for (let index = 0; index < items; index += 1) {
    const itemId = randomUUID();
    itemIds.push(itemId);
    await owner.query(
      `insert into ch.billing_item
         (id, tenant_id, encounter_id, item_kind, amount_cents, created_by)
       values ($1, $2, $3, 'PROTOCOL', 100, $4)`,
      [itemId, tenantId, encounterId, actorId],
    );
  }
  await owner.query(
    `insert into ch.process_block
       (tenant_id, encounter_id, block_kind, source_system, message, active,
        created_by)
     values ($1, $2, 'FINANCIAL', 'BILLING', 'Financial validation pending',
             true, $3)`,
    [tenantId, encounterId, actorId],
  );
  return { encounterId, itemIds };
}

async function activeFinancialBlocks(encounterId: string): Promise<number> {
  const active = await owner.query<{ count: number }>(
    `select count(*)::int as count from ch.process_block
      where encounter_id = $1 and block_kind = 'FINANCIAL' and active`,
    [encounterId],
  );
  return active.rows[0]!.count;
}

beforeAll(async () => {
  clone = await cloneDatabase();
  owner = new pg.Client({ connectionString: clone.url });
  await owner.connect();
  // Fixtures (owner, só no clone).
  await owner.query(`select set_config('app.role', 'owner', false)`);
  await owner.query(
    'insert into auth.tenants (id, slug, name) values ($1, $2, $3)',
    [tenantId, `billing-race-${tenantId.slice(0, 8)}`, 'Billing race'],
  );
  await owner.query(
    `insert into auth.users (id, tenant_id, email, display_name)
     values ($1, $2, $3, 'Billing race')`,
    [actorId, tenantId, `${actorId}@detran.invalid`],
  );
  await owner.query(
    `insert into ch.clinic (id, tenant_id, code, cnpj, name, region_code)
     values ($1, $2, 'BILL-RACE', '00000000000191', 'Clínica prova', 'R1')`,
    [clinicId, tenantId],
  );
  await owner.query(
    `insert into ch.patient (id, tenant_id, clinic_id, national_id, name)
     values ($1, $2, $3, '00000000191', 'Paciente prova')`,
    [patientId, tenantId, clinicId],
  );
  first = await RaceSession.open(clone.url, 'race-billing-t1');
  second = await RaceSession.open(clone.url, 'race-billing-t2');
}, 60_000);

afterAll(async () => {
  await first?.end();
  await second?.end();
  await owner?.end();
  await clone?.drop();
}, 60_000);

describe('faturamento: pagamento concorrente dos itens do atendimento', () => {
  it('dado dois itens ISSUED com bloqueio FINANCIAL quando os dois são pagos em paralelo então o bloqueio FINANCIAL é resolvido', async () => {
    const { encounterId, itemIds } = await seedEncounter(2);
    const outcome = await interleave({
      observer: owner,
      second,
      runFirst: (hold) =>
        billing(first, hold).validatePayment(itemIds[0]!, 'PAY-A', 100),
      runSecond: () =>
        billing(second).validatePayment(itemIds[1]!, 'PAY-B', 100),
    });
    expect(outcome.first.status).toBe('fulfilled');
    expect(
      outcome.second.status,
      JSON.stringify(summarize(outcome.second)),
    ).toBe('fulfilled');
    expect(await activeFinancialBlocks(encounterId)).toBe(0);
    expect(outcome.secondWhileFirstOpen).toBe('blocked');
  });

  it('dado um item ISSUED com bloqueio FINANCIAL quando um item novo é criado enquanto o último é pago então o bloqueio FINANCIAL continua ativo', async () => {
    const { encounterId, itemIds } = await seedEncounter(1);
    const outcome = await interleave({
      observer: owner,
      second,
      runFirst: (hold) =>
        billing(first, hold).createItem({
          encounterId,
          itemKind: 'PROTOCOL',
          amountCents: 100,
        }),
      runSecond: () =>
        billing(second).validatePayment(itemIds[0]!, 'PAY-LAST', 100),
    });
    expect(outcome.first.status).toBe('fulfilled');
    expect(
      outcome.second.status,
      JSON.stringify(summarize(outcome.second)),
    ).toBe('fulfilled');
    expect(await activeFinancialBlocks(encounterId)).toBe(1);
    expect(outcome.secondWhileFirstOpen).toBe('blocked');
  });
});
