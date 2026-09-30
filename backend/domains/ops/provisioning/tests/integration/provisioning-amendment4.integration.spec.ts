import { randomUUID } from 'node:crypto';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { provisioningPorts } from '../../src/handwritten/provisioning.provider.js';
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
  type Operation,
} from './harness.js';

let h: ProofHarness;
let normId: string, catalogId: string, recipientB: string, adminSubject: string;
let extraRanges: string[], extraReservations: string[];
const validation = { code: 'TEAT.VALIDATION_FAILED', status: 422 };
beforeEach(async () => {
  h = await new ProofHarness().open();
  normId = randomUUID();
  catalogId = randomUUID();
  recipientB = randomUUID();
  adminSubject = randomUUID();
  extraRanges = [];
  extraReservations = [];
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
        id: normId,
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
    [normId, h.grantId],
  );
  await h.owner.query(
    'update ops.provisioning_package set normative_package_id=$1 where id=$2',
    [normId, h.packageId],
  );
  await h.owner.query(
    `insert into ops.ops_agent_profile select (jsonb_populate_record(null::ops.ops_agent_profile,to_jsonb(t)||$1::jsonb)).* from ops.ops_agent_profile t where id=$2`,
    [
      JSON.stringify({
        id: recipientB,
        user_ref: recipientB,
        registration_number: recipientB,
      }),
      AGENT_A,
    ],
  );
});
afterEach(async () => {
  await h.owner.query('delete from inf.normative_mobile_package where id=$1', [
    normId,
  ]);
  await h.owner.query('delete from inf.normative_catalog where id=$1', [
    catalogId,
  ]);
  await h.owner.query('delete from ops.ops_agent_profile where id=$1', [
    recipientB,
  ]);
  await h.owner.query(
    'delete from ops.numbering_consumption where reservation_id=any($1::uuid[])',
    [extraReservations],
  );
  await h.owner.query(
    'delete from ops.numbering_reservation where id=any($1::uuid[])',
    [extraReservations],
  );
  await h.owner.query(
    'delete from ops.ait_numbering_range where id=any($1::uuid[])',
    [extraRanges],
  );
  await h.close();
});
function realInput(
  op: Operation,
  admin = false,
  overrides: Partial<CommandInput> = {},
) {
  const input = h.input(op, overrides);
  if (admin) {
    input.context.principal.subject = adminSubject;
    input.context.principal.roles = ['agency-admin'];
    delete input.context.principal.claims.agent_id;
  }
  if (op === 'issue') input.body.normative_package_id = normId;
  input.ports = provisioningPorts(
    input.db,
    'test',
    input.clock.now,
    input.context,
  );
  return input;
}
async function issueInput(admin = false) {
  const input = realInput('issue', admin);
  input.ifMatch = (
    await invoke('readiness', realInput('readiness', admin))
  ).etag;
  return input;
}
async function assertBindings(
  grantId: string,
  expected: { reservation_id: string; authorized_agent_id: string }[],
) {
  const rows = await h.clients[0]!.query(
    'select tenant_id,grant_id,reservation_id,traffic_agency_id,device_id,authorized_agent_id from ops.provisioning_grant_reservation_binding where grant_id=$1 order by reservation_id',
    [grantId],
  );
  expect(rows.rows).toEqual(
    expected
      .map((binding) => ({
        tenant_id: TENANT_A,
        grant_id: grantId,
        traffic_agency_id: AGENCY_A,
        device_id: h.deviceId,
        ...binding,
      }))
      .sort((a, b) => a.reservation_id.localeCompare(b.reservation_id)),
  );
}
describe('Amendment 4 — responsável, destinatários e reserva persistida', () => {
  it.each(['readiness', 'receipt', 'reconcile'] as const)(
    'dado arrays históricos válidos mas binding ausente quando %s executa então não confia no array como autoridade',
    async (op) => {
      await h.owner.query(
        'delete from ops.provisioning_grant_reservation_binding where grant_id=$1',
        [h.grantId],
      );
      const input = realInput(op);
      if (op === 'reconcile') input.body.acts[0].normative_package_id = normId;
      const before = await h.snapshot();
      if (op === 'readiness') {
        const reply = await invoke(op, input);
        expect(reply.body).toMatchObject({
          ready: false,
          remaining_numbering_count: 0,
        });
        expect(reply.body.blockers.length).toBeGreaterThan(0);
      } else await expect(invoke(op, input)).rejects.toMatchObject(validation);
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it('dado issue concorrente em duas conexões quando o mesmo comando é reenviado então persiste um único binding e replay idêntico', async () => {
    const first = await issueInput();
    const second = realInput('issue', false, {
      db: await h.connect(),
      ifMatch: first.ifMatch,
    });
    expect(
      (await first.db.query('select pg_backend_pid() pid')).rows[0].pid,
    ).not.toBe(
      (await second.db.query('select pg_backend_pid() pid')).rows[0].pid,
    );
    const replies = await Promise.all([
      invoke('issue', first),
      invoke('issue', second),
    ]);
    expect(replies[0]).toEqual(replies[1]);
    await assertBindings(replies[0]!.body.grant_id, [
      { reservation_id: h.issuanceReservationId, authorized_agent_id: AGENT_A },
    ]);
    expect(
      (
        await h.owner.query(
          'select id from integration.outbox where idempotency_key=$1',
          [`issue:${first.idempotencyKey}`],
        )
      ).rows,
    ).toHaveLength(1);
  });
  it('dado agency-admin sem agent_id quando emite para outro destinatário então emissor não é recipient implícito', async () => {
    const input = await issueInput(true);
    expect(input.context.principal.claims).not.toHaveProperty('agent_id');
    expect(
      input.body.authorized_agents.map((a: { agent_id: string }) => a.agent_id),
    ).not.toContain(adminSubject);
    const reply = await invoke('issue', input);
    assertReply(reply);
    const grants = await h.owner.query(
      'select issued_by_subject,authorized_agents_json from ops.offline_authorization_grant where id=$1',
      [reply.body.grant_id],
    );
    expect(grants.rows).toEqual([
      {
        issued_by_subject: adminSubject,
        authorized_agents_json: input.body.authorized_agents,
      },
    ]);
    await assertBindings(reply.body.grant_id, [
      { reservation_id: h.issuanceReservationId, authorized_agent_id: AGENT_A },
    ]);
    expect(
      (
        await h.owner.query(
          'select payload from integration.outbox where idempotency_key=$1',
          [`issue:${input.idempotencyKey}`],
        )
      ).rows,
    ).toEqual([{ payload: reply.body }]);
  });
  it('dado responsável agency-admin sem agent_id e sem reservas quando challenge e register executam então persiste subject não vazio sem fabricar recipient', async () => {
    for (const table of [
      'provisioning_grant_reservation_binding',
      'provisioning_package',
      'offline_authorization_grant',
      'device_key',
      'numbering_reservation',
    ])
      await h.owner.query(`delete from ops.${table} where device_id=$1`, [
        h.deviceId,
      ]);
    const challengeInput = realInput('challenge', true);
    challengeInput.ifMatch = (
      await invoke('readiness', realInput('readiness', true))
    ).etag;
    const challenge = await invoke('challenge', challengeInput);
    expect(
      (
        await h.owner.query(
          'select attestation_evidence_json from ops.device_key where id=$1',
          [challenge.body.challenge_id],
        )
      ).rows[0].attestation_evidence_json.subject,
    ).toBe(adminSubject);
    const register = realInput('register', true, { ifMatch: challenge.etag });
    register.body.challenge_id = challenge.body.challenge_id;
    register.body.challenge_proof = `fixture-proof:${challenge.body.challenge}:${h.deviceId}:${register.body.public_key}`;
    expect((await invoke('register', register)).body).toEqual({
      device_key_id: challenge.body.challenge_id,
      device_id: h.deviceId,
      key_fingerprint: register.body.key_fingerprint,
      status: 'registered',
    });
    expect(
      (
        await h.owner.query(
          'select id from ops.numbering_reservation where device_id=$1',
          [h.deviceId],
        )
      ).rows,
    ).toEqual([]);
    expect(
      (
        await h.owner.query(
          'select id from ops.provisioning_grant_reservation_binding where device_id=$1',
          [h.deviceId],
        )
      ).rows,
    ).toEqual([]);
  });
  it('dado dois recipients distintos do responsável quando emite duas reservas então cada binding preserva seu recipient exato', async () => {
    const second = randomUUID();
    extraReservations.push(second);
    await h.owner.query(
      'update ops.numbering_reservation set end_number=start_number+4 where id=$1',
      [h.issuanceReservationId],
    );
    await h.owner.query(
      `insert into ops.numbering_reservation select (jsonb_populate_record(null::ops.numbering_reservation,to_jsonb(t)||$1::jsonb)).* from ops.numbering_reservation t where id=$2`,
      [
        JSON.stringify({
          id: second,
          agent_id: recipientB,
          // §5.10: uma reserva `reserved` por dispositivo e turno (turno próprio).
          shift_id: randomUUID(),
          start_number: 2026000007,
          end_number: 2026000011,
          idempotency_key: `${h.prefix}-second-recipient`,
        }),
        h.issuanceReservationId,
      ],
    );
    const input = await issueInput(true);
    input.body.authorized_agents.push({
      ...input.body.authorized_agents[0],
      agent_id: recipientB,
      registration_number: recipientB,
    });
    input.body.numbering_reservation_ids.push(second);
    const reply = await invoke('issue', input);
    await assertBindings(reply.body.grant_id, [
      { reservation_id: h.issuanceReservationId, authorized_agent_id: AGENT_A },
      { reservation_id: second, authorized_agent_id: recipientB },
    ]);
    expect(
      (
        await h.owner.query(
          'select issued_by_subject,authorized_agents_json from ops.offline_authorization_grant where id=$1',
          [reply.body.grant_id],
        )
      ).rows,
    ).toEqual([
      {
        issued_by_subject: adminSubject,
        authorized_agents_json: input.body.authorized_agents,
      },
    ]);
  });
  it.each(['tenant_id', 'traffic_agency_id', 'device_id', 'agent_id'])(
    'dado somente %s divergente na reserva quando emite então recusa 422 sem efeitos parciais',
    async (field) => {
      const value =
        field === 'tenant_id'
          ? TENANT_B
          : field === 'device_id'
            ? '00000000-0000-7000-8000-0000e4000002'
            : field === 'agent_id'
              ? recipientB
              : randomUUID();
      if (field === 'tenant_id')
        await h.owner.query("select set_config('app.tenant_id',$1,false)", [
          TENANT_B,
        ]);
      try {
        await h.owner.query(
          `update ops.numbering_reservation set ${field}=$2 where id=$1`,
          [h.issuanceReservationId, value],
        );
      } finally {
        await h.owner.query("select set_config('app.tenant_id',$1,false)", [
          TENANT_A,
        ]);
      }
      try {
        const input = await issueInput();
        expect(
          input.body.authorized_agents.map(
            (a: { agent_id: string }) => a.agent_id,
          ),
        ).toEqual([AGENT_A]);
        const before = await h.snapshot();
        await expect(invoke('issue', input)).rejects.toMatchObject(validation);
        expect(await h.snapshot()).toEqual(before);
      } finally {
        await h.owner.query(
          'update ops.numbering_reservation set tenant_id=$2,device_id=$3 where id=$1',
          [h.issuanceReservationId, TENANT_A, h.deviceId],
        );
      }
    },
  );
  it('dado recipient omitido da lista mas igual ao emissor quando emite então identidade do emissor não autoriza a reserva', async () => {
    const input = await issueInput();
    input.body.authorized_agents = [
      {
        ...input.body.authorized_agents[0],
        agent_id: recipientB,
        registration_number: recipientB,
      },
    ];
    const before = await h.snapshot();
    await expect(invoke('issue', input)).rejects.toMatchObject(validation);
    expect(await h.snapshot()).toEqual(before);
  });
  it('dado binding histórico persistido quando consulta privilégios e outro tenant então mantém RLS e SELECT/INSERT sem UPDATE/DELETE', async () => {
    const privileges = await h.owner.query(
      "select has_table_privilege('role_app_backend','ops.provisioning_grant_reservation_binding','SELECT') s,has_table_privilege('role_app_backend','ops.provisioning_grant_reservation_binding','INSERT') i,has_table_privilege('role_app_backend','ops.provisioning_grant_reservation_binding','UPDATE') u,has_table_privilege('role_app_backend','ops.provisioning_grant_reservation_binding','DELETE') d",
    );
    expect(privileges.rows).toEqual([{ s: true, i: true, u: false, d: false }]);
    expect(
      (
        await h.owner.query(
          "select relrowsecurity,relforcerowsecurity from pg_class where oid='ops.provisioning_grant_reservation_binding'::regclass",
        )
      ).rows,
    ).toEqual([{ relrowsecurity: true, relforcerowsecurity: true }]);
    await assertBindings(h.grantId, [
      { reservation_id: h.reservationId, authorized_agent_id: AGENT_A },
    ]);
    const other = await h.connect(TENANT_B);
    expect(
      (
        await other.query(
          'select * from ops.provisioning_grant_reservation_binding where grant_id=$1',
          [h.grantId],
        )
      ).rows,
    ).toEqual([]);
    for (const sql of [
      'update ops.provisioning_grant_reservation_binding set authorized_agent_id=$2 where grant_id=$1',
      'delete from ops.provisioning_grant_reservation_binding where grant_id=$1 and authorized_agent_id=$2',
    ])
      await expect(
        h.clients[0]!.query(sql, [h.grantId, AGENT_A]),
      ).rejects.toMatchObject({ code: '42501' });
    await assertBindings(h.grantId, [
      { reservation_id: h.reservationId, authorized_agent_id: AGENT_A },
    ]);
  });
  it.each(['after-domain', 'after-numbering', 'after-outbox', 'before-commit'])(
    'dado issue quando crash %s ocorre então rollback inclui bindings e retry gera apenas um vínculo',
    async (point) => {
      const input = await issueInput();
      input.ports = { ...input.ports, checkpoint: h.ports.checkpoint };
      h.crashAt = point;
      const before = await h.snapshot();
      await expect(invoke('issue', input)).rejects.toThrow(
        `fixture-crash:${point}`,
      );
      expect(await h.snapshot()).toEqual(before);
      h.crashAt = undefined;
      const reply = await invoke('issue', input);
      await assertBindings(reply.body.grant_id, [
        {
          reservation_id: h.issuanceReservationId,
          authorized_agent_id: AGENT_A,
        },
      ]);
      const persisted = await h.snapshot();
      expect(await invoke('issue', input)).toEqual(reply);
      expect(await h.snapshot()).toEqual(persisted);
    },
  );
});

describe('Amendment 4 — identidade exata do manifesto', () => {
  it.each([false, true])(
    'dado pacote internamente consistente com divergência=%s quando download ocorre então somente identidade exata é entregue',
    async (divergent) => {
      if (divergent)
        await h.owner.query(
          'update ops.offline_authorization_grant set manifest_digest=$2 where id=$1',
          [h.grantId, `${h.prefix}-different-grant`],
        );
      const rows = await h.owner.query(
        'select manifest_digest,artifact_digests_json from ops.provisioning_package where id=$1',
        [h.packageId],
      );
      expect(rows.rows[0].artifact_digests_json.manifest).toBe(
        rows.rows[0].manifest_digest,
      );
      const before = await h.snapshot();
      if (divergent)
        await expect(
          invoke('download', realInput('download')),
        ).rejects.toMatchObject({
          code: 'TEAT.VALIDATION_FAILED',
          status: 410,
        });
      else
        expect((await invoke('download', realInput('download'))).body).toEqual({
          package_id: h.packageId,
          grant_id: h.grantId,
          device_id: h.deviceId,
          manifest_digest: `${h.prefix}-package`,
          envelope_uri: `fixture://ops-provisioning/${h.deviceId}/${h.prefix}-package`,
          signature_key_id: 'fixture-kid-a',
          schema_version: '1.0',
        });
      expect(await h.snapshot()).toEqual(before);
    },
  );
});

async function terminal(grantId: string, kind: 'expired' | 'revoked') {
  await h.owner.query(
    "update ops.offline_authorization_grant set valid_until='2026-09-21T09:00:00Z',status=$2,revoked_at=$3,created_at='2026-09-21T01:00:00Z' where id=$1",
    [
      grantId,
      kind === 'revoked' ? 'revoked' : 'issued',
      kind === 'revoked' ? '2026-09-21T10:00:00Z' : null,
    ],
  );
}
async function extraGrant(active = true) {
  const grantId = randomUUID(),
    packageId = randomUUID(),
    reservationId = randomUUID(),
    rangeId = randomUUID();
  extraRanges.push(rangeId);
  extraReservations.push(reservationId);
  await h.owner.query(
    `insert into ops.ait_numbering_range select (jsonb_populate_record(null::ops.ait_numbering_range,to_jsonb(t)||$1::jsonb)).* from ops.ait_numbering_range t where id=$2`,
    [JSON.stringify({ id: rangeId, series: rangeId }), h.rangeId],
  );
  await h.owner.query(
    `insert into ops.numbering_reservation select (jsonb_populate_record(null::ops.numbering_reservation,to_jsonb(t)||$1::jsonb)).* from ops.numbering_reservation t where id=$2`,
    [
      JSON.stringify({
        id: reservationId,
        range_id: rangeId,
        // §5.10: uma reserva `reserved` por dispositivo e turno (turno próprio).
        shift_id: randomUUID(),
        idempotency_key: `${h.prefix}-${reservationId}`,
      }),
      h.reservationId,
    ],
  );
  await h.owner.query(
    `insert into ops.offline_authorization_grant select (jsonb_populate_record(null::ops.offline_authorization_grant,to_jsonb(t)||$1::jsonb)).* from ops.offline_authorization_grant t where id=$2`,
    [
      JSON.stringify({
        id: grantId,
        manifest_digest: `${h.prefix}-${grantId}`,
        numbering_reservation_ids_json: [reservationId],
        status: 'issued',
        revoked_at: null,
        valid_until: '2026-09-22T00:00:00Z',
        version: 1,
        created_at: active ? '2026-09-21T11:59:00Z' : '2026-09-21T02:00:00Z',
      }),
      h.grantId,
    ],
  );
  await h.owner.query(
    `insert into ops.provisioning_package select (jsonb_populate_record(null::ops.provisioning_package,to_jsonb(t)||$1::jsonb)).* from ops.provisioning_package t where id=$2`,
    [
      JSON.stringify({
        id: packageId,
        grant_id: grantId,
        manifest_digest: `${h.prefix}-${grantId}`,
        artifact_digests_json: { manifest: `${h.prefix}-${grantId}` },
        numbering_policy_json: { reservation_ids: [reservationId] },
        created_at: '2026-09-21T11:59:00Z',
      }),
      h.packageId,
    ],
  );
  await h.owner.query(
    'insert into ops.provisioning_grant_reservation_binding (tenant_id,grant_id,reservation_id,traffic_agency_id,device_id,authorized_agent_id) values ($1,$2,$3,$4,$5,$6)',
    [TENANT_A, grantId, reservationId, AGENCY_A, h.deviceId, AGENT_A],
  );
  return { grantId, reservationId };
}
async function reconcileZero(grantId: string, at = NOW) {
  const versions = await h.owner.query(
    'select version from ops.offline_authorization_grant where id=$1',
    [grantId],
  );
  const key = `${h.prefix}-reconcile-${grantId}-${at}`;
  const input = realInput('reconcile', false, {
    grantId,
    ifMatch: `"${versions.rows[0].version}"`,
    idempotencyKey: key,
    clock: { now: () => new Date(at) },
    body: { idempotency_key: key, acts: [] },
  });
  const reply = await invoke('reconcile', input);
  expect(reply.body).toMatchObject({
    grant_id: grantId,
    accepted_count: 0,
    rejected_count: 0,
    reconciliation_digest: expect.stringMatching(/^[a-f0-9]{64}$/u),
  });
  expect(
    (
      await h.owner.query(
        'select grant_id,reconciliation_digest,reconciled_at from ops.provisioning_reconciliation where grant_id=$1 order by reconciled_at desc limit 1',
        [grantId],
      )
    ).rows,
  ).toEqual([
    {
      grant_id: grantId,
      reconciliation_digest: reply.body.reconciliation_digest,
      reconciled_at: new Date(at),
    },
  ]);
  return reply;
}
async function pending(grantId: string, reservationId: string) {
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
          grant_id: grantId,
          reserved_numbering_context: {
            reservation_id: reservationId,
            number: h.number,
          },
        },
        received_at: null,
        server_entity_id: null,
      }),
    ],
  );
}
describe('Amendment 4 — todo histórico terminal participa da renovação', () => {
  it.each(['expired', 'revoked'] as const)(
    'dado grant antigo %s com reconciliação de pendência aberta quando existe novo grant ativo então exige unresolved zero do antigo',
    async (kind) => {
      await terminal(h.grantId, kind);
      await extraGrant();
      await pending(h.grantId, h.reservationId);
      const proof = await reconcileZero(h.grantId);
      expect(proof.body.unresolved_count).toBe(1);
      expect(
        (
          await h.owner.query(
            'select unresolved_act_count from ops.provisioning_reconciliation where grant_id=$1',
            [h.grantId],
          )
        ).rows,
      ).toEqual([{ unresolved_act_count: 1 }]);
      const input = await issueInput();
      const before = await h.snapshot();
      await expect(invoke('issue', input)).rejects.toMatchObject(validation);
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it.each(['expired', 'revoked'] as const)(
    'dado grant antigo %s sem prova e grant novo ativo quando emite então o novo não oculta obrigação antiga',
    async (kind) => {
      await terminal(h.grantId, kind);
      const active = await extraGrant();
      expect(
        (
          await h.owner.query(
            'select id from ops.offline_authorization_grant where device_id=$1 order by created_at desc,id',
            [h.deviceId],
          )
        ).rows[0].id,
      ).toBe(active.grantId);
      const input = await issueInput();
      const before = await h.snapshot();
      await expect(invoke('issue', input)).rejects.toMatchObject(validation);
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it.each(['expired', 'revoked'] as const)(
    'dado histórico %s com zero atos e grant ativo quando cada obrigação tem prova posterior então permite emissão',
    async (kind) => {
      await terminal(h.grantId, kind);
      await extraGrant();
      await reconcileZero(h.grantId);
      const reply = await invoke('issue', await issueInput());
      await assertBindings(reply.body.grant_id, [
        {
          reservation_id: h.issuanceReservationId,
          authorized_agent_id: AGENT_A,
        },
      ]);
      expect(
        (
          await h.owner.query(
            'select id from ops.numbering_consumption where reservation_id=$1',
            [h.reservationId],
          )
        ).rows,
      ).toEqual([]);
    },
  );
  it.each(['none', 'first-only', 'second-only', 'both'])(
    'dado dois grants terminais e um ativo com provas %s quando emite então exige prova de CADA grant',
    async (proofs) => {
      await terminal(h.grantId, 'expired');
      const second = await extraGrant(false);
      await terminal(second.grantId, 'revoked');
      await extraGrant();
      if (proofs === 'first-only' || proofs === 'both')
        await reconcileZero(h.grantId);
      if (proofs === 'second-only' || proofs === 'both')
        await reconcileZero(second.grantId);
      const input = await issueInput();
      const before = await h.snapshot();
      if (proofs === 'both') {
        const reply = await invoke('issue', input);
        await assertBindings(reply.body.grant_id, [
          {
            reservation_id: h.issuanceReservationId,
            authorized_agent_id: AGENT_A,
          },
        ]);
      } else {
        await expect(invoke('issue', input)).rejects.toMatchObject(validation);
        expect(await h.snapshot()).toEqual(before);
      }
    },
  );
  it.each(['expired', 'revoked'] as const)(
    'dado grant antigo %s com prova e pendência posterior quando novo grant está ativo então renovação permanece negada',
    async (kind) => {
      await terminal(h.grantId, kind);
      await extraGrant();
      await reconcileZero(h.grantId);
      await pending(h.grantId, h.reservationId);
      const input = await issueInput();
      const before = await h.snapshot();
      await expect(invoke('issue', input)).rejects.toMatchObject(validation);
      expect(await h.snapshot()).toEqual(before);
    },
  );
  it.each(['2026-09-21T08:59:59Z', '2026-09-21T09:00:00Z'])(
    'dado prova antiga em %s e grant novo ativo quando renova então exige prova estritamente posterior ao terminal próprio',
    async (at) => {
      await terminal(h.grantId, 'expired');
      await extraGrant();
      await reconcileZero(h.grantId, at);
      const input = await issueInput();
      const before = await h.snapshot();
      await expect(invoke('issue', input)).rejects.toMatchObject(validation);
      expect(await h.snapshot()).toEqual(before);
    },
  );
});
