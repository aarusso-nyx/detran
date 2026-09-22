import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { provisioningPorts } from '../../src/handwritten/provisioning.provider.js';
import type {
  ProvisioningPorts,
  ProvisioningSql,
} from '../../src/handwritten/provisioning.contract.js';
import {
  AGENT_A,
  AGENCY_A,
  TENANT_A,
  TENANT_B,
  NOW,
  ProofHarness,
  invoke,
  assertReply,
  type CommandInput,
} from './harness.js';

let h: ProofHarness;
let normativeId: string;
let catalogId: string;
beforeEach(async () => {
  h = await new ProofHarness().open();
  normativeId = randomUUID();
  catalogId = randomUUID();
});
afterEach(async () => {
  // Setup uses the target tenant context as required by the database guard;
  // restore owned rows before teardown, without disabling RLS or triggers.
  await h.owner.query(
    'update inf.normative_mobile_package set tenant_id=$2 where id=$1',
    [normativeId, TENANT_A],
  );
  await h.owner.query(
    'update inf.normative_catalog set tenant_id=$2 where id=$1',
    [catalogId, TENANT_A],
  );
  await h.owner.query('delete from inf.normative_mobile_package where id=$1', [
    normativeId,
  ]);
  await h.owner.query('delete from inf.normative_catalog where id=$1', [
    catalogId,
  ]);
  await h.close();
});
const validation = { code: 'TEAT.VALIDATION_FAILED', status: 422 };
async function moveTenant(
  table:
    | 'inf.normative_mobile_package'
    | 'inf.normative_catalog'
    | 'ops.numbering_reservation',
  id: string,
  tenant: string,
) {
  await h.owner.query("select set_config('app.tenant_id',$1,false)", [tenant]);
  try {
    await h.owner.query(`update ${table} set tenant_id=$2 where id=$1`, [
      id,
      tenant,
    ]);
  } finally {
    await h.owner.query("select set_config('app.tenant_id',$1,false)", [
      TENANT_A,
    ]);
  }
}
async function read() {
  return invoke('readiness', h.input('readiness'));
}
async function consume(number = h.number, status = 'applied') {
  await h.owner.query(
    `insert into ops.numbering_consumption (tenant_id,reservation_id,range_id,number,idempotency_key,status,details_json) values ($1,$2,$3,$4,$5,$6,'{}')`,
    [
      TENANT_A,
      h.reservationId,
      h.rangeId,
      number,
      `${h.prefix}-consumed-${number}`,
      status,
    ],
  );
}
// Explicit authenticated-context seam; this remains the real production provider,
// never a substitute resolver or a fixture normativeUsable implementation.
function realPorts(input: CommandInput): ProvisioningPorts {
  return (
    provisioningPorts as unknown as (
      db: ProvisioningSql,
      profile: string,
      now: () => Date,
      context: CommandInput['context'],
    ) => ProvisioningPorts
  )(input.db, 'test', input.clock.now, input.context);
}
async function normativeFixture() {
  await h.owner.query(
    `insert into inf.normative_catalog select (jsonb_populate_record(null::inf.normative_catalog,to_jsonb(t)||$1::jsonb)).* from inf.normative_catalog t where id='00000000-0000-7000-8000-0000e0000001'`,
    [
      JSON.stringify({
        id: catalogId,
        tenant_id: TENANT_A,
        traffic_agency_id: AGENCY_A,
        version: h.prefix,
        status: 'active',
        valid_from: '2026-01-01',
        valid_to: '2026-12-31',
      }),
    ],
  );
  await h.owner.query(
    `insert into inf.normative_mobile_package select (jsonb_populate_record(null::inf.normative_mobile_package,to_jsonb(t)||$1::jsonb)).* from inf.normative_mobile_package t where id='00000000-0000-7000-8000-0000e7000001'`,
    [
      JSON.stringify({
        id: normativeId,
        tenant_id: TENANT_A,
        traffic_agency_id: AGENCY_A,
        catalog_id: catalogId,
        package_version: h.prefix,
        status: 'published',
      }),
    ],
  );
  await h.owner.query(
    'update ops.offline_authorization_grant set normative_package_id=$1 where id=$2',
    [normativeId, h.grantId],
  );
  await h.owner.query(
    'update ops.provisioning_package set normative_package_id=$1 where id=$2',
    [normativeId, h.packageId],
  );
}

describe('Amendment 3 F-012 — download é decisão de usabilidade', () => {
  it('200 lógico válido entrega exatamente o envelope persistido sem efeitos', async () => {
    const before = await h.snapshot();
    const reply = await invoke('download', h.input('download'));
    assertReply(reply);
    expect(reply.body).toMatchObject({
      package_id: h.packageId,
      grant_id: h.grantId,
      device_id: h.deviceId,
      envelope_uri: `fixture://ops-provisioning/${h.deviceId}/${h.prefix}-package`,
      schema_version: '1.0',
    });
    expect(await h.snapshot()).toEqual(before);
  });
  it.each([
    'package-expired',
    'package-revoked',
    'grant-expired',
    'grant-revoked',
    'device-revoked',
    'schema-incompatible',
  ])(
    '%s retorna 410 contratado sem envelope nem efeitos',
    async (condition) => {
      if (condition === 'package-expired')
        await h.owner.query(
          'update ops.provisioning_package set expires_at=$2 where id=$1',
          [h.packageId, NOW],
        );
      if (condition === 'package-revoked')
        await h.owner.query(
          "update ops.provisioning_package set status='revoked' where id=$1",
          [h.packageId],
        );
      if (condition === 'grant-expired')
        await h.owner.query(
          'update ops.offline_authorization_grant set valid_until=$2 where id=$1',
          [h.grantId, NOW],
        );
      if (condition === 'grant-revoked')
        await h.owner.query(
          "update ops.offline_authorization_grant set status='revoked',revoked_at=$2 where id=$1",
          [h.grantId, NOW],
        );
      if (condition === 'device-revoked')
        await h.owner.query(
          `insert into ops.device_revocation (tenant_id,device_id,grant_id,reason_code,revocation_epoch,decision_by_subject,decided_at) values ($1,$2,$3,'fixture-loss',1,$4,$5)`,
          [TENANT_A, h.deviceId, h.grantId, AGENT_A, NOW],
        );
      if (condition === 'schema-incompatible')
        await h.owner.query(
          "update ops.provisioning_package set schema_version='999.0' where id=$1",
          [h.packageId],
        );
      const before = await h.snapshot();
      await expect(
        invoke('download', h.input('download')),
      ).rejects.toMatchObject({ code: 'TEAT.VALIDATION_FAILED', status: 410 });
      expect(await h.snapshot()).toEqual(before);
    },
  );
});

describe('Amendment 3 F-013 — budgets persistidos e ETag', () => {
  it('consumo parcial diminui ambos os saldos e invalida emissão com ETag anterior', async () => {
    await h.owner.query(
      'update ops.numbering_reservation set end_number=start_number+2 where id=$1',
      [h.reservationId],
    );
    const initial = await read();
    expect(initial.body).toMatchObject({
      ready: true,
      remaining_acts: 10,
      remaining_numbering_count: 3,
    });
    await consume();
    const partial = await read();
    expect(partial.body).toMatchObject({
      ready: true,
      remaining_acts: 9,
      remaining_numbering_count: 2,
    });
    expect(partial.etag).not.toBe(initial.etag);
    const before = await h.snapshot();
    await expect(
      invoke('issue', h.input('issue', { ifMatch: initial.etag })),
    ).rejects.toMatchObject({ code: 'TEAT.VERSION_CONFLICT', status: 412 });
    expect(await h.snapshot()).toEqual(before);
  });
  it.each(['maximum-acts', 'interval'])(
    '%s esgotado bloqueia sem saldo negativo',
    async (budget) => {
      if (budget === 'maximum-acts') {
        await h.owner.query(
          'update ops.offline_authorization_grant set maximum_acts=1 where id=$1',
          [h.grantId],
        );
        await h.owner.query(
          'update ops.numbering_reservation set end_number=start_number+2 where id=$1',
          [h.reservationId],
        );
      }
      const before = await read();
      await consume();
      const after = await read();
      expect(after.body).toMatchObject({
        ready: false,
        remaining_acts: budget === 'maximum-acts' ? 0 : 9,
        remaining_numbering_count: budget === 'interval' ? 0 : 2,
      });
      expect(after.body.blockers.length).toBeGreaterThan(0);
      expect(after.etag).not.toBe(before.etag);
    },
  );
  it('todas as linhas consumidas contam, mesmo pendentes de aplicação', async () => {
    await consume(h.number, 'pending');
    expect((await read()).body).toMatchObject({
      ready: false,
      remaining_acts: 9,
      remaining_numbering_count: 0,
    });
  });
  it('consumo superior ao orçamento nunca produz saldo negativo', async () => {
    await h.owner.query(
      'update ops.offline_authorization_grant set maximum_acts=1 where id=$1',
      [h.grantId],
    );
    await h.owner.query(
      'update ops.numbering_reservation set end_number=start_number+2 where id=$1',
      [h.reservationId],
    );
    await consume();
    await consume(h.number + 1);
    expect((await read()).body).toMatchObject({
      ready: false,
      remaining_acts: 0,
      remaining_numbering_count: 1,
    });
  });
  it.each(['tenant', 'agency', 'device', 'expired', 'revoked'])(
    'reserva %s divergente ou inutilizável não contribui capacidade',
    async (condition) => {
      if (condition === 'tenant')
        await moveTenant(
          'ops.numbering_reservation',
          h.reservationId,
          TENANT_B,
        );
      if (condition === 'agency')
        await h.owner.query(
          'update ops.numbering_reservation set traffic_agency_id=$2 where id=$1',
          [h.reservationId, randomUUID()],
        );
      if (condition === 'device')
        await h.owner.query(
          'update ops.numbering_reservation set device_id=$2 where id=$1',
          [h.reservationId, '00000000-0000-7000-8000-0000e4000002'],
        );
      if (condition === 'expired')
        await h.owner.query(
          'update ops.numbering_reservation set valid_until=$2 where id=$1',
          [h.reservationId, NOW],
        );
      if (condition === 'revoked')
        await h.owner.query(
          "update ops.numbering_reservation set status='revoked' where id=$1",
          [h.reservationId],
        );
      try {
        expect((await read()).body).toMatchObject({
          ready: false,
          remaining_acts: 10,
          remaining_numbering_count: 0,
        });
      } finally {
        await h.owner.query(
          'update ops.numbering_reservation set tenant_id=$2,device_id=$3 where id=$1',
          [h.reservationId, TENANT_A, h.deviceId],
        );
      }
    },
  );
});

describe('Amendment 3 F-014 — provider normativo real', () => {
  it('pacote e catálogo utilizáveis no mesmo tenant e órgão permitem readiness e issue', async () => {
    await normativeFixture();
    const input = h.input('readiness');
    input.ports = realPorts(input);
    expect(await input.ports.normativeUsable(normativeId)).toBe(true);
    const ready = await invoke('readiness', input);
    expect(ready.body.ready).toBe(true);
    const issue = h.input('issue', { ifMatch: ready.etag });
    issue.ports = realPorts(issue);
    issue.body.normative_package_id = normativeId;
    expect((await invoke('issue', issue)).body.device_id).toBe(h.deviceId);
  });
  it.each([
    'package-tenant',
    'package-agency',
    'catalog-tenant',
    'catalog-agency',
    'catalog-unpublished',
    'catalog-expired',
    'catalog-future',
    'catalog-absent',
  ])(
    '%s é recusado pelo provider real, readiness e emissão',
    async (condition) => {
      await normativeFixture();
      if (condition === 'package-tenant')
        await moveTenant('inf.normative_mobile_package', normativeId, TENANT_B);
      if (condition === 'package-agency')
        await h.owner.query(
          'update inf.normative_mobile_package set traffic_agency_id=$2 where id=$1',
          [normativeId, randomUUID()],
        );
      if (condition === 'catalog-tenant' || condition === 'catalog-absent')
        await moveTenant('inf.normative_catalog', catalogId, TENANT_B); // absent from authenticated RLS projection, without breaking FK
      if (condition === 'catalog-agency')
        await h.owner.query(
          'update inf.normative_catalog set traffic_agency_id=$2 where id=$1',
          [catalogId, randomUUID()],
        );
      if (condition === 'catalog-unpublished')
        await h.owner.query(
          "update inf.normative_catalog set status='draft' where id=$1",
          [catalogId],
        );
      if (condition === 'catalog-expired')
        await h.owner.query(
          "update inf.normative_catalog set valid_to='2026-09-20' where id=$1",
          [catalogId],
        );
      if (condition === 'catalog-future')
        await h.owner.query(
          "update inf.normative_catalog set valid_from='2026-10-01' where id=$1",
          [catalogId],
        );
      const input = h.input('readiness');
      input.ports = realPorts(input);
      expect(await input.ports.normativeUsable(normativeId)).toBe(false);
      const ready = await invoke('readiness', input);
      expect(ready.body).toMatchObject({
        ready: false,
        blockers: expect.arrayContaining([
          { code: 'TEAT.VALIDATION_FAILED', resource: 'normative_package' },
        ]),
      });
      const issue = h.input('issue', { ifMatch: ready.etag });
      issue.ports = realPorts(issue);
      issue.body.normative_package_id = normativeId;
      const before = await h.snapshot();
      await expect(invoke('issue', issue)).rejects.toMatchObject(validation);
      expect(await h.snapshot()).toEqual(before);
    },
  );
});

async function coldChallenge() {
  for (const table of [
    'provisioning_package',
    'offline_authorization_grant',
    'device_key',
    'numbering_reservation',
  ])
    await h.owner.query(`delete from ops.${table} where device_id=$1`, [
      h.deviceId,
    ]);
  const input = h.input('challenge');
  input.ports = realPorts(input);
  const ready = h.input('readiness');
  ready.ports = realPorts(ready);
  input.ifMatch = (await invoke('readiness', ready)).etag;
  const reply = await invoke('challenge', input);
  const stored = await h.owner.query(
    'select attestation_evidence_json from ops.device_key where id=$1',
    [reply.body.challenge_id],
  );
  expect(stored.rows[0].attestation_evidence_json.subject).toBe(
    input.context.principal.subject,
  );
  expect(stored.rows[0].attestation_evidence_json.subject).toMatch(/\S/u);
  return reply;
}
describe('Amendment 3 F-015 — enrollment real anterior à reserva', () => {
  it.each([
    'valid',
    'subject',
    'device',
    'device-claim',
    'agency',
    'tenant',
    'empty-subject',
  ])('challenge→register %s sem nenhuma reserva prévia', async (variant) => {
    const challenge = await coldChallenge();
    const input = h.input('register', { ifMatch: challenge.etag });
    input.body.challenge_id = challenge.body.challenge_id;
    input.body.challenge_proof = `fixture-proof:${challenge.body.challenge}:${h.deviceId}:${input.body.public_key}`;
    if (variant === 'subject') input.context.principal.subject = randomUUID();
    if (variant === 'device') input.deviceId = randomUUID();
    if (variant === 'device-claim')
      input.context.principal.claims.device_id = randomUUID();
    if (variant === 'agency')
      input.context.principal.claims.traffic_agency_id = randomUUID();
    if (variant === 'tenant') input.context.tenantId = TENANT_B;
    if (variant === 'empty-subject') input.context.principal.subject = '';
    input.ports = realPorts(input);
    const before = await h.snapshot();
    if (variant === 'valid') {
      const registered = await invoke('register', input);
      expect(registered.body).toMatchObject({
        device_id: h.deviceId,
        status: 'registered',
      });
      expect(
        (
          await h.owner.query(
            'select public_key,status from ops.device_key where id=$1',
            [challenge.body.challenge_id],
          )
        ).rows,
      ).toEqual([{ public_key: input.body.public_key, status: 'registered' }]);
      expect(
        (
          await h.owner.query(
            'select count(*)::int n from ops.numbering_reservation where device_id=$1',
            [h.deviceId],
          )
        ).rows,
      ).toEqual([{ n: 0 }]);
    } else {
      await expect(invoke('register', input)).rejects.toMatchObject({
        status:
          variant === 'empty-subject' ? 401 : variant === 'subject' ? 422 : 403,
      });
      expect(await h.snapshot()).toEqual(before);
    }
  });
});

async function terminate(kind: 'expired' | 'revoked') {
  await h.owner.query(
    "update ops.offline_authorization_grant set valid_until='2026-09-21T10:00:00Z',status=$2,revoked_at=$3 where id=$1",
    [
      h.grantId,
      kind === 'revoked' ? 'revoked' : 'issued',
      kind === 'revoked' ? '2026-09-21T10:00:00Z' : null,
    ],
  );
}
async function insertAppendOnlyFixture(at: string) {
  await h.owner.query(
    `insert into ops.provisioning_reconciliation (tenant_id,grant_id,device_id,reconciliation_digest,accepted_act_count,rejected_act_count,unresolved_act_count,reconciled_by_subject,reconciled_at) values ($1,$2,$3,$4,$5,0,$6,$7,$8)`,
    [TENANT_A, h.grantId, h.deviceId, `${h.prefix}-proof`, 0, 0, AGENT_A, at],
  );
}
async function recordProof(at: string, unresolved = 0) {
  // Renewal negatives start from a real, canonical persisted proof rather than
  // an arbitrary digest which could be rejected before the condition under test.
  const input = h.input('reconcile', { clock: { now: () => new Date(at) } });
  input.body.acts = [];
  const reply = await invoke('reconcile', input);
  const records = await h.owner.query(
    'select reconciliation_digest from ops.provisioning_reconciliation where grant_id=$1',
    [h.grantId],
  );
  expect(records.rows).toEqual([
    { reconciliation_digest: reply.body.reconciliation_digest },
  ]);
  if (unresolved)
    await h.owner.query(
      'update ops.provisioning_reconciliation set unresolved_act_count=$2 where grant_id=$1',
      [h.grantId, unresolved],
    );
}
describe('Amendment 3 F-016 — renovação exige reconciliação terminal persistida', () => {
  it.each(['expired', 'revoked'] as const)(
    '%s sem reconciliação não renova nem grava efeitos',
    async (kind) => {
      await terminate(kind);
      const input = await h.prepare('issue');
      const before = await h.snapshot();
      await expect(invoke('issue', input)).rejects.toMatchObject(validation);
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it.each([
    'before-terminal',
    'at-terminal',
    'unresolved',
    'uncovered-consumption',
    'pending-queue',
  ])('%s não é prova suficiente para renovar', async (condition) => {
    await terminate('expired');
    await recordProof(
      condition === 'before-terminal'
        ? '2026-09-21T09:59:59Z'
        : condition === 'at-terminal'
          ? '2026-09-21T10:00:00Z'
          : NOW,
      condition === 'unresolved' ? 1 : 0,
    );
    if (condition === 'uncovered-consumption') await consume();
    if (condition === 'pending-queue')
      await h.owner.query(
        `insert into ops.sync_queue_item select (jsonb_populate_record(null::ops.sync_queue_item,to_jsonb(t)||$1::jsonb)).* from ops.sync_queue_item t where id='00000000-0000-7000-8000-0000e9000001'`,
        [
          JSON.stringify({
            id: randomUUID(),
            device_id: h.deviceId,
            traffic_agency_id: AGENCY_A,
            agent_id: AGENT_A,
            idempotency_key: `${h.prefix}-pending`,
            status: 'pending',
            payload_json: {
              grant_id: h.grantId,
              reserved_numbering_context: {
                reservation_id: h.reservationId,
                number: h.number,
              },
            },
            received_at: null,
            server_entity_id: null,
          }),
        ],
      );
    const input = await h.prepare('issue');
    const before = await h.snapshot();
    await expect(invoke('issue', input)).rejects.toMatchObject(validation);
    expect(await h.snapshot()).toEqual(before);
  });
  it.each([
    ['expired', 0],
    ['expired', 1],
    ['revoked', 0],
    ['revoked', 1],
  ] as const)(
    'grant %s: reconciliação posterior com %i atos persiste prova e outbox e só então permite renovar',
    async (kind, count) => {
      await terminate(kind);
      const input = h.input('reconcile');
      if (count === 0) input.body.acts = [];
      const reply = await invoke('reconcile', input);
      expect(reply.body).toMatchObject({
        grant_id: h.grantId,
        accepted_count: count,
        rejected_count: 0,
        unresolved_count: 0,
      });
      const records = await h.owner.query(
        'select * from ops.provisioning_reconciliation where grant_id=$1',
        [h.grantId],
      );
      expect(records.rows).toHaveLength(1);
      expect(records.rows[0]).toMatchObject({
        tenant_id: TENANT_A,
        device_id: h.deviceId,
        accepted_act_count: count,
        rejected_act_count: 0,
        unresolved_act_count: 0,
        reconciled_by_subject: AGENT_A,
        reconciliation_digest: expect.stringMatching(/^[a-f0-9]{64}$/u),
      });
      expect(new Date(records.rows[0].reconciled_at).toISOString()).toBe(NOW);
      expect(records.rows[0].reconciliation_digest).toBe(
        reply.body.reconciliation_digest,
      );
      expect(
        (
          await h.owner.query(
            'select id from integration.outbox where idempotency_key=$1',
            [`reconcile:${input.idempotencyKey}`],
          )
        ).rows,
      ).toHaveLength(1);
      const before = await h.snapshot();
      expect(await invoke('reconcile', input)).toEqual(reply);
      expect(await h.snapshot()).toEqual(before);
      const issue = await invoke('issue', await h.prepare('issue'));
      expect(issue.body.grant_id).not.toBe(h.grantId);
      expect(
        (
          await h.owner.query(
            'select id from ops.numbering_consumption where reservation_id=$1',
            [h.reservationId],
          )
        ).rows,
      ).toHaveLength(count);
    },
  );
  it('reconciliação é append-only e invisível a outro tenant', async () => {
    await insertAppendOnlyFixture(NOW);
    const client = h.clients[0]!;
    const other = await h.connect(TENANT_B);
    expect(
      (
        await other.query(
          'select id from ops.provisioning_reconciliation where grant_id=$1',
          [h.grantId],
        )
      ).rows,
    ).toEqual([]);
    expect(
      (
        await client.query(
          'select id from ops.provisioning_reconciliation where grant_id=$1',
          [h.grantId],
        )
      ).rows,
    ).toHaveLength(1);
    for (const sql of [
      'update ops.provisioning_reconciliation set unresolved_act_count=1 where grant_id=$1',
      'delete from ops.provisioning_reconciliation where grant_id=$1',
    ]) {
      await expect(client.query(sql, [h.grantId])).rejects.toMatchObject({
        code: '42501',
      });
    }
    expect(
      (
        await h.owner.query(
          'select unresolved_act_count from ops.provisioning_reconciliation where grant_id=$1',
          [h.grantId],
        )
      ).rows,
    ).toEqual([{ unresolved_act_count: 0 }]);
  });
  it('prova posterior à expiração mas anterior à revogação não autoriza renovação', async () => {
    await terminate('revoked');
    await h.owner.query(
      "update ops.offline_authorization_grant set revoked_at='2026-09-21T11:30:00Z' where id=$1",
      [h.grantId],
    );
    await recordProof('2026-09-21T11:00:00Z');
    const input = await h.prepare('issue');
    const before = await h.snapshot();
    await expect(invoke('issue', input)).rejects.toMatchObject(validation);
    expect(await h.snapshot()).toEqual(before);
  });
  it.each(['after-domain', 'after-numbering', 'after-outbox', 'before-commit'])(
    'crash %s não deixa prova que autorize renovação',
    async (checkpoint) => {
      await terminate('expired');
      h.crashAt = checkpoint;
      const before = await h.snapshot();
      await expect(invoke('reconcile', h.input('reconcile'))).rejects.toThrow(
        `fixture-crash:${checkpoint}`,
      );
      expect(await h.snapshot()).toEqual(before);
      h.crashAt = undefined;
      await expect(
        invoke('issue', await h.prepare('issue')),
      ).rejects.toMatchObject(validation);
    },
  );
});
