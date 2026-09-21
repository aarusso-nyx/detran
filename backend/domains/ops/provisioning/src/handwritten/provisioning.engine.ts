import { randomUUID } from 'node:crypto';
import {
  digest,
  etag,
  fail,
  safeMaterial,
  schemas,
  type DeviceBinding,
  type Operation,
  type ProvisioningInput,
  type ProvisioningResult,
  type Row,
} from './provisioning.contract.js';

/** Parameterized repository scoped by RLS and by the explicit authenticated tenant. */
class ProvisioningRepository {
  constructor(readonly input: ProvisioningInput) {}
  async rows(sql: string, values: unknown[] = []): Promise<Row[]> {
    return (await this.input.db.query(sql, values)).rows;
  }
  async one(sql: string, values: unknown[] = []): Promise<Row | undefined> {
    return (await this.rows(sql, values))[0];
  }
  async insert(table: string, value: Row): Promise<Row> {
    const fields = Object.keys(value);
    const rows = await this.rows(
      `insert into ${table} (${fields.join(',')}) values (${fields.map((_, i) => '$' + (i + 1)).join(',')}) returning *`,
      Object.values(value).map((v) =>
        v !== null && typeof v === 'object' && !(v instanceof Date)
          ? JSON.stringify(v)
          : v,
      ),
    );
    return rows[0]!;
  }
  async deviceRows(table: string, device: string): Promise<Row[]> {
    return this.rows(
      `select * from ops.${table} where tenant_id=$1 and device_id=$2 order by created_at desc,id${table === 'device_revocation' ? '' : ' for update'}`,
      [this.input.context.tenantId, device],
    );
  }
}
type State = {
  device: DeviceBinding;
  deviceRecord: Row;
  key?: Row;
  grant?: Row;
  pkg?: Row;
  reservations: Row[];
  revocations: Row[];
  keys: Row[];
  grants: Row[];
  packages: Row[];
  consumptions: Row[];
  queue: Row[];
  conflicts: Row[];
  reconciliations: Row[];
  bindings: Row[];
};
function time(value: unknown): number {
  return new Date(String(value)).getTime();
}
function ids(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((x): x is string => typeof x === 'string')
    : [];
}
function json(value: unknown): Row {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Row)
    : {};
}
async function state(
  repo: ProvisioningRepository,
  device: DeviceBinding,
  deviceRecord: Row,
): Promise<State> {
  const keys = await repo.deviceRows('device_key', device.deviceId);
  const grants = await repo.deviceRows(
    'offline_authorization_grant',
    device.deviceId,
  );
  const packages = await repo.deviceRows(
    'provisioning_package',
    device.deviceId,
  );
  const reservations = await repo.deviceRows(
    'numbering_reservation',
    device.deviceId,
  );
  const revocations = await repo.deviceRows(
    'device_revocation',
    device.deviceId,
  );
  const bindings = await repo.rows(
    'select * from ops.provisioning_grant_reservation_binding where tenant_id=$1 and (device_id=$2 or grant_id=any($3::uuid[])) order by grant_id,reservation_id',
    [repo.input.context.tenantId, device.deviceId, grants.map((g) => g.id)],
  );
  const reservationIds = [
    ...new Set(bindings.map((b) => String(b.reservation_id))),
  ];
  const consumptions = await repo.rows(
    'select * from ops.numbering_consumption where tenant_id=$1 and reservation_id=any($2::uuid[]) order by id for update',
    [repo.input.context.tenantId, reservationIds],
  );
  const queue = await repo.rows(
    "select * from ops.sync_queue_item where tenant_id=$1 and (device_id=$2 or payload_json->>'grant_id'=any($3::text[])) order by id for update",
    [
      repo.input.context.tenantId,
      device.deviceId,
      grants.map((g) => String(g.id)),
    ],
  );
  const reconciliations = await repo.rows(
    'select * from ops.provisioning_reconciliation where tenant_id=$1 and device_id=$2 order by reconciled_at desc,id',
    [repo.input.context.tenantId, device.deviceId],
  );
  const conflicts = await repo.rows(
    'select * from ops.sync_conflict where tenant_id=$1 and sync_queue_item_id=any($2::uuid[]) order by id for update',
    [repo.input.context.tenantId, queue.map((q) => String(q.id))],
  );
  return {
    device,
    deviceRecord,
    keys,
    grants,
    packages,
    reservations,
    revocations,
    consumptions,
    queue,
    conflicts,
    reconciliations,
    bindings,
    key: keys.find((k) => k.status === 'registered'),
    grant: grants[0],
    pkg: grants[0]
      ? packages.find((p) => p.grant_id === grants[0]?.id)
      : packages[0],
  };
}
function authorize(op: Operation, i: ProvisioningInput, s: State) {
  const p = i.context.principal,
    claims = p.claims ?? {},
    roles = p.roles;
  const technical = roles.includes('technical-admin');
  const agency =
    roles.includes('agency-admin') &&
    claims.traffic_agency_id === s.device.trafficAgencyId;
  const boundAgent =
    claims.agent_id === s.device.agentId &&
    claims.device_id === s.device.deviceId &&
    p.subject === s.device.principalSubject;
  let allowed = false;
  if (op === 'challenge' || op === 'revoke') allowed = technical || agency;
  if (op === 'issue')
    allowed =
      (roles.includes('agency-admin') || roles.includes('field-supervisor')) &&
      claims.traffic_agency_id === s.device.trafficAgencyId;
  if (op === 'readiness') allowed = technical || agency || boundAgent;
  if (op === 'register')
    allowed =
      p.subject === s.device.principalSubject &&
      claims.device_id === s.device.deviceId &&
      claims.traffic_agency_id === s.device.trafficAgencyId;
  if (op === 'download') allowed = p.subject === s.grant?.issued_by_subject;
  if (op === 'receipt' || op === 'reconcile')
    allowed = claims.device_id === s.device.deviceId;
  if (!allowed) fail('FORBIDDEN_ACTION', 403);
}
function grantBindings(s: State, grant: Row): Row[] {
  return s.bindings.filter((b) => b.grant_id === grant.id);
}
function boundReservationIds(s: State, grant: Row): string[] {
  return grantBindings(s, grant).map((b) => String(b.reservation_id));
}
function validBindings(s: State, grant: Row): boolean {
  const bindings = grantBindings(s, grant);
  const declared = ids(grant.numbering_reservation_ids_json);
  const agents = Array.isArray(grant.authorized_agents_json)
    ? grant.authorized_agents_json.map((a) => json(a).agent_id)
    : [];
  return (
    bindings.length > 0 &&
    bindings.length === declared.length &&
    new Set(declared).size === declared.length &&
    bindings.every((b) => {
      const r = s.reservations.find((r) => r.id === b.reservation_id);
      return (
        declared.includes(String(b.reservation_id)) &&
        b.tenant_id === grant.tenant_id &&
        b.tenant_id === s.device.tenantId &&
        b.traffic_agency_id === grant.traffic_agency_id &&
        b.traffic_agency_id === s.device.trafficAgencyId &&
        b.device_id === grant.device_id &&
        b.device_id === s.device.deviceId &&
        agents.includes(b.authorized_agent_id) &&
        r &&
        r.tenant_id === b.tenant_id &&
        r.traffic_agency_id === b.traffic_agency_id &&
        r.device_id === b.device_id &&
        r.agent_id === b.authorized_agent_id
      );
    })
  );
}
function grantConsumption(s: State, grant: Row): Row[] {
  const linked = boundReservationIds(s, grant);
  return s.consumptions.filter((c) =>
    linked.includes(String(c.reservation_id)),
  );
}
function grantQueue(s: State, grant: Row): Row[] {
  const linked = boundReservationIds(s, grant);
  return s.queue.filter((q) => {
    const payload = json(q.payload_json);
    return (
      payload.grant_id === grant.id ||
      linked.includes(
        String(json(payload.reserved_numbering_context).reservation_id),
      )
    );
  });
}
function reconciliationSnapshot(s: State, grant: Row, record: Row): string {
  return digest({
    tenantId: grant.tenant_id,
    grantId: grant.id,
    deviceId: grant.device_id,
    validUntil: grant.valid_until,
    revokedAt: grant.revoked_at,
    numberingReservationIds: ids(grant.numbering_reservation_ids_json),
    bindings: grantBindings(s, grant),
    revocations: s.revocations.filter(
      (r) => !r.grant_id || r.grant_id === grant.id,
    ),
    consumptions: grantConsumption(s, grant),
    queue: grantQueue(s, grant),
    conflicts: s.conflicts.filter((c) =>
      grantQueue(s, grant).some((q) => q.id === c.sync_queue_item_id),
    ),
    accepted: Number(record.accepted_act_count),
    rejected: Number(record.rejected_act_count),
    unresolved: Number(record.unresolved_act_count),
    subject: record.reconciled_by_subject,
    reconciledAt: new Date(String(record.reconciled_at)).toISOString(),
  });
}
function unresolvedCount(s: State, grant: Row): number {
  return (
    // offline-sync owns aplicado/disponivel/consumido_localmente; the
    // provisioning append-only act ledger uses the DDL default applied.
    grantConsumption(s, grant).filter(
      (c) => !['applied', 'aplicado', 'disponivel'].includes(String(c.status)),
    ).length +
    grantQueue(s, grant).filter((q) => {
      const conflicts = s.conflicts.filter(
        (c) => c.sync_queue_item_id === q.id,
      );
      if (conflicts.some((c) => c.status !== 'resolved')) return true;
      if (q.status === 'applied') return false;
      // Rejected alone can mean an item still awaiting retransmission.
      // Only the owning supervisor's terminal decision closes that path.
      return !(
        q.status === 'rejected' &&
        conflicts.length > 0 &&
        conflicts.every((c) =>
          ['accept_server', 'reject'].includes(String(c.resolution_action)),
        )
      );
    }).length
  );
}
function deviceRevoked(s: State): boolean {
  return (
    s.deviceRecord.status === 'revoked' ||
    s.revocations.some((r) => !r.grant_id)
  );
}
function grantRevoked(s: State, grant: Row): boolean {
  return (
    deviceRevoked(s) ||
    grant.status === 'revoked' ||
    s.revocations.some((r) => r.grant_id === grant.id)
  );
}
function terminalBoundary(
  s: State,
  grant: Row,
  now: number,
): number | undefined {
  const boundaries: number[] = [time(grant.valid_until)];
  if (!Number.isFinite(boundaries[0])) return NaN;
  if (grant.status === 'revoked') {
    if (!grant.revoked_at || !Number.isFinite(time(grant.revoked_at)))
      return NaN;
    boundaries.push(time(grant.revoked_at));
  }
  for (const revocation of s.revocations.filter(
    (r) => r.grant_id === grant.id,
  )) {
    const decidedAt = time(revocation.decided_at);
    if (!Number.isFinite(decidedAt)) return NaN;
    boundaries.push(decidedAt);
  }
  const boundary = Math.max(...boundaries);
  return boundary <= now ? boundary : undefined;
}
function assertRenewal(i: ProvisioningInput, s: State): void {
  for (const grant of s.grants) {
    const boundary = terminalBoundary(s, grant, i.clock.now().getTime());
    if (boundary === undefined) continue;
    if (!Number.isFinite(boundary) || !validBindings(s, grant))
      fail('VALIDATION_FAILED', 422);
    const proof = s.reconciliations.find(
      (r) =>
        r.tenant_id === i.context.tenantId &&
        r.device_id === s.device.deviceId &&
        r.grant_id === grant.id &&
        Number(r.unresolved_act_count) === 0 &&
        time(r.reconciled_at) > boundary &&
        time(r.reconciled_at) <= i.clock.now().getTime() &&
        r.reconciliation_digest === reconciliationSnapshot(s, grant, r),
    );
    if (!proof || unresolvedCount(s, grant) !== 0)
      fail('VALIDATION_FAILED', 422);
  }
}
async function readiness(
  i: ProvisioningInput,
  s: State,
): Promise<ProvisioningResult> {
  const blockers: { code: string; resource: string }[] = [];
  const block = (resource: string) => {
    if (!blockers.some((b) => b.resource === resource))
      blockers.push({ code: 'TEAT.VALIDATION_FAILED', resource });
  };
  const now = i.clock.now().getTime(),
    g = s.grant,
    p = s.pkg;
  if (
    !s.key ||
    (g &&
      !s.keys.some(
        (k) =>
          k.status === 'registered' &&
          k.key_fingerprint === g.device_key_fingerprint,
      ))
  )
    block('device_key');
  if (
    !g ||
    g.status === 'revoked' ||
    time(g.valid_from) > now ||
    time(g.valid_until) <= now
  )
    block('offline_authorization_grant');
  if (
    !p ||
    p.status === 'revoked' ||
    p.schema_version !== '1.0' ||
    json(p.artifact_digests_json).manifest !== p.manifest_digest ||
    (g && p.manifest_digest !== g.manifest_digest) ||
    (p.expires_at && time(p.expires_at) <= now) ||
    !(await i.ports.trustedSigningKey(String(p.signature_key_id)))
  )
    block('provisioning_package');
  const bindingValid = g ? validBindings(s, g) : false;
  const linked = g && bindingValid ? boundReservationIds(s, g) : [];
  const consumed = g ? grantConsumption(s, g) : [];
  const usableReservations = s.reservations.filter(
    (r) =>
      linked.includes(String(r.id)) &&
      r.tenant_id === i.context.tenantId &&
      r.device_id === s.device.deviceId &&
      r.traffic_agency_id === s.device.trafficAgencyId &&
      r.status === 'reserved' &&
      time(r.valid_until) > now,
  );
  const remainingActs = g
    ? Math.max(0, Number(g.maximum_acts) - consumed.length)
    : 0;
  const remainingNumbering = usableReservations.reduce(
    (n, r) =>
      n +
      Math.max(
        0,
        Number(r.end_number) -
          Number(r.start_number) +
          1 -
          consumed.filter((c) => c.reservation_id === r.id).length,
      ),
    0,
  );
  if (
    g &&
    (!bindingValid ||
      usableReservations.length !== linked.length ||
      remainingNumbering === 0)
  )
    block('numbering_reservation');
  if (g && remainingActs === 0) block('offline_authorization_grant');
  const normative = g
    ? g.traffic_agency_id === s.device.trafficAgencyId &&
      (!p || p.normative_package_id === g.normative_package_id) &&
      (await i.ports.normativeUsable(String(g.normative_package_id), {
        tenantId: i.context.tenantId,
        trafficAgencyId: s.device.trafficAgencyId,
        deviceId: s.device.deviceId,
      }))
    : true;
  if (!normative) block('normative_package');
  if (deviceRevoked(s) || (g && s.revocations.some((r) => r.grant_id === g.id)))
    block('device_revocation');
  return {
    body: {
      device_id: s.device.deviceId,
      ready: blockers.length === 0,
      remaining_acts: remainingActs,
      remaining_numbering_count: remainingNumbering,
      blockers,
      evaluated_at: i.clock.now().toISOString(),
    },
    etag: etag(
      digest({
        device: s.device,
        deviceRecord: s.deviceRecord,
        keys: s.keys,
        grants: s.grants,
        packages: s.packages,
        reservations: s.reservations,
        bindings: s.bindings,
        revocations: s.revocations,
        consumptions: consumed,
        remainingActs,
        remainingNumbering,
        reconciliations: s.reconciliations,
        queue: g ? grantQueue(s, g) : [],
        conflicts: s.conflicts,
        normative,
        blockers,
      }),
    ),
  };
}
function requireMatch(i: ProvisioningInput, current: string) {
  if (i.ifMatch !== current) fail('VERSION_CONFLICT', 412);
}
function cryptoBoundary(i: ProvisioningInput) {
  // ADR-0028: there is no approved production cryptographic implementation.
  if (
    !i.ports.fixtureOnly ||
    !['test', 'local-sandbox'].includes(i.runtimeProfile)
  )
    fail('VALIDATION_FAILED', 422);
}
async function challenge(
  repo: ProvisioningRepository,
  s: State,
): Promise<ProvisioningResult> {
  const i = repo.input;
  cryptoBoundary(i);
  requireMatch(i, (await readiness(i, s)).etag);
  const version =
    Math.max(s.device.version, ...s.keys.map((key) => Number(key.version))) + 1;
  const id = randomUUID(),
    nonce = randomUUID();
  // The non-production challenge fixture is deliberately not a production TTL policy.
  const expires = new Date(i.clock.now().getTime() + 86_400_000).toISOString();
  await repo.insert('ops.device_key', {
    id,
    tenant_id: i.context.tenantId,
    device_id: s.device.deviceId,
    key_fingerprint: id,
    public_key: 'source_pending',
    attestation_evidence_json: {
      challenge: nonce,
      expires_at: expires,
      subject: s.device.principalSubject,
    },
    status: 'challenged',
    version,
    registered_at: i.clock.now(),
  });
  return {
    body: {
      challenge_id: id,
      device_id: s.device.deviceId,
      challenge: nonce,
      expires_at: expires,
    },
    etag: etag(version),
  };
}
async function register(
  repo: ProvisioningRepository,
  s: State,
): Promise<ProvisioningResult> {
  const i = repo.input,
    b = schemas.register.parse(i.body);
  cryptoBoundary(i);
  safeMaterial(b);
  const c = s.keys.find((k) => k.id === b.challenge_id),
    evidence = json(c?.attestation_evidence_json);
  if (
    !c ||
    c.status !== 'challenged' ||
    evidence.subject !== i.context.principal.subject ||
    time(evidence.expires_at) <= i.clock.now().getTime()
  )
    fail('VALIDATION_FAILED', 422);
  requireMatch(i, etag(c.version));
  if (
    !(await i.ports.verifyAttestation({
      challenge: String(evidence.challenge),
      proof: b.challenge_proof,
      deviceId: s.device.deviceId,
      publicKey: b.public_key,
    }))
  )
    fail('VALIDATION_FAILED', 422);
  const row = await repo.one(
    "update ops.device_key set public_key=$1,key_fingerprint=$2,attestation_evidence_json=$3,status='registered',version=version+1,registered_at=$4,updated_at=$4 where tenant_id=$5 and id=$6 returning version",
    [
      b.public_key,
      b.key_fingerprint,
      JSON.stringify(b.attestation_evidence),
      i.clock.now(),
      i.context.tenantId,
      c.id,
    ],
  );
  return {
    body: {
      device_key_id: c.id,
      device_id: s.device.deviceId,
      key_fingerprint: b.key_fingerprint,
      status: 'registered',
    },
    etag: etag(row!.version),
  };
}
async function issue(
  repo: ProvisioningRepository,
  s: State,
): Promise<ProvisioningResult> {
  const i = repo.input,
    b = schemas.issue.parse(i.body);
  cryptoBoundary(i);
  requireMatch(i, (await readiness(i, s)).etag);
  assertRenewal(i, s);
  if (
    !s.key ||
    time(b.valid_from) >= time(b.valid_until) ||
    time(b.valid_until) <= i.clock.now().getTime() ||
    !(await i.ports.normativeUsable(b.normative_package_id, {
      tenantId: i.context.tenantId,
      trafficAgencyId: s.device.trafficAgencyId,
      deviceId: s.device.deviceId,
    })) ||
    deviceRevoked(s)
  )
    fail('VALIDATION_FAILED', 422);
  const reservations = b.numbering_reservation_ids.map((id) =>
    s.reservations.find((r) => r.id === id),
  );
  const recipientIds = b.authorized_agents.map((a) => a.agent_id);
  const recipients = await repo.rows(
    'select * from ops.ops_agent_profile where tenant_id=$1 and id=any($2::uuid[]) order by id for share',
    [i.context.tenantId, recipientIds],
  );
  if (
    new Set(recipientIds).size !== recipientIds.length ||
    recipients.length !== recipientIds.length ||
    recipients.some((a) => a.traffic_agency_id !== s.device.trafficAgencyId)
  )
    fail('VALIDATION_FAILED', 422);
  if (
    new Set(b.numbering_reservation_ids).size !== reservations.length ||
    reservations.some(
      (r) =>
        !r ||
        r.tenant_id !== i.context.tenantId ||
        r.device_id !== s.device.deviceId ||
        !recipientIds.includes(String(r.agent_id)) ||
        r.status !== 'reserved' ||
        r.traffic_agency_id !== s.device.trafficAgencyId ||
        time(r.valid_until) < time(b.valid_until) ||
        json(r.reconciliation_json).grant_id ||
        s.bindings.some((binding) => binding.reservation_id === r.id),
    )
  )
    fail('VALIDATION_FAILED', 422);
  if (
    reservations.reduce(
      (n, r) => n + Number(r!.end_number) - Number(r!.start_number) + 1,
      0,
    ) < b.maximum_acts
  )
    fail('VALIDATION_FAILED', 422);
  const grantId = randomUUID(),
    packageId = randomUUID(),
    now = i.clock.now().toISOString();
  const keyId = String(s.grant?.key_id ?? 'fixture-kid-a');
  const revocationEpoch = Math.max(
    0,
    Number(s.grant?.revocation_epoch ?? 0),
    ...s.revocations.map((r) => Number(r.revocation_epoch)),
  );
  if (!(await i.ports.trustedSigningKey(keyId))) fail('VALIDATION_FAILED', 422);
  const manifest = {
    schemaVersion: '1.0',
    grantId,
    tenantId: i.context.tenantId,
    trafficAgencyId: s.device.trafficAgencyId,
    deviceId: s.device.deviceId,
    deviceKeyThumbprint: s.key.key_fingerprint,
    authorizedAgents: b.authorized_agents.map((a) => ({
      agentId: a.agent_id,
      registrationNumber: a.registration_number,
      roles: a.roles,
      permissions: a.permissions,
    })),
    validFrom: b.valid_from,
    validUntil: b.valid_until,
    maximumOfflineSeconds: b.maximum_offline_seconds,
    maximumActs: b.maximum_acts,
    revocationEpoch,
    policyVersion: b.policy_version,
    normativePackageId: b.normative_package_id,
    numberingReservationIds: b.numbering_reservation_ids,
    issuedAt: now,
    issuedBySubject: i.context.principal.subject,
    keyId,
  };
  const signed = await i.ports.sign(manifest);
  if (signed.digest !== digest(manifest) || signed.keyId !== keyId)
    fail('VALIDATION_FAILED', 422);
  const envelope = await i.ports.encrypt({
    deviceId: s.device.deviceId,
    digest: signed.digest,
    manifest,
    signature: signed.signature,
  });
  await repo.insert('ops.offline_authorization_grant', {
    id: grantId,
    tenant_id: i.context.tenantId,
    traffic_agency_id: s.device.trafficAgencyId,
    device_id: s.device.deviceId,
    device_key_fingerprint: s.key.key_fingerprint,
    authorized_agents_json: b.authorized_agents,
    valid_from: b.valid_from,
    valid_until: b.valid_until,
    maximum_offline_seconds: b.maximum_offline_seconds,
    maximum_acts: b.maximum_acts,
    revocation_epoch: revocationEpoch,
    policy_version: b.policy_version,
    normative_package_id: b.normative_package_id,
    numbering_reservation_ids_json: b.numbering_reservation_ids,
    issued_at: now,
    issued_by_subject: i.context.principal.subject,
    key_id: keyId,
    manifest_digest: signed.digest,
  });
  await repo.insert('ops.provisioning_package', {
    id: packageId,
    tenant_id: i.context.tenantId,
    grant_id: grantId,
    device_id: s.device.deviceId,
    manifest_digest: signed.digest,
    artifact_digests_json: { manifest: signed.digest },
    trust_chain_json: {
      chain: signed.publicChain,
      signature: signed.signature,
    },
    normative_package_id: b.normative_package_id,
    numbering_policy_json: { reservation_ids: b.numbering_reservation_ids },
    envelope_uri: envelope.envelopeUri,
    signature_key_id: keyId,
    issued_at: now,
    expires_at: b.valid_until,
  });
  for (const reservation of reservations)
    await repo.insert('ops.provisioning_grant_reservation_binding', {
      tenant_id: i.context.tenantId,
      grant_id: grantId,
      reservation_id: reservation!.id,
      traffic_agency_id: s.device.trafficAgencyId,
      device_id: s.device.deviceId,
      authorized_agent_id: reservation!.agent_id,
      bound_at: now,
    });
  await i.ports.checkpoint?.('after-domain');
  for (const r of reservations)
    await repo.rows(
      "update ops.numbering_reservation set reconciliation_json=coalesce(reconciliation_json,'{}'::jsonb)||$1::jsonb where tenant_id=$2 and id=$3",
      [
        JSON.stringify({ grant_id: grantId, package_id: packageId }),
        i.context.tenantId,
        r!.id,
      ],
    );
  return {
    body: {
      package_id: packageId,
      grant_id: grantId,
      device_id: s.device.deviceId,
      manifest_digest: signed.digest,
      envelope_uri: envelope.envelopeUri,
      expires_at: b.valid_until,
    },
    etag: etag(1),
  };
}
async function receipt(
  repo: ProvisioningRepository,
  s: State,
): Promise<ProvisioningResult> {
  const i = repo.input,
    b = schemas.receipt.parse(i.body),
    p = s.pkg!,
    g = s.grant!;
  safeMaterial(b);
  requireMatch(i, etag(p.version));
  if (!validBindings(s, g)) fail('VALIDATION_FAILED', 422);
  const now = i.clock.now();
  if (
    b.manifest_digest !== p.manifest_digest ||
    p.manifest_digest !== g.manifest_digest ||
    json(p.artifact_digests_json).manifest !== p.manifest_digest ||
    p.schema_version !== '1.0' ||
    g.status === 'revoked' ||
    grantRevoked(s, g) ||
    time(g.valid_until) <= now.getTime() ||
    time(g.valid_from) > now.getTime() ||
    (p.expires_at && time(p.expires_at) <= now.getTime()) ||
    !s.keys.some(
      (k) =>
        k.status === 'registered' &&
        k.key_fingerprint === g.device_key_fingerprint,
    ) ||
    !(await i.ports.trustedSigningKey(String(p.signature_key_id)))
  )
    fail('VALIDATION_FAILED', 422);
  const r = await repo.insert('ops.provisioning_receipt', {
    tenant_id: i.context.tenantId,
    package_id: p.id,
    grant_id: g.id,
    device_id: s.device.deviceId,
    receipt_type: b.receipt_type,
    idempotency_key: i.idempotencyKey,
    manifest_digest: b.manifest_digest,
    device_attestation_json: b.device_attestation ?? null,
    occurred_at: b.occurred_at,
    received_at: now,
  });
  const updated = await repo.one(
    'update ops.provisioning_package set version=version+1,updated_at=$1 where tenant_id=$2 and id=$3 returning version',
    [now, i.context.tenantId, p.id],
  );
  return {
    body: {
      receipt_id: r.id,
      package_id: p.id,
      grant_id: g.id,
      device_id: s.device.deviceId,
      receipt_type: b.receipt_type,
      received_at: now.toISOString(),
    },
    etag: etag(updated!.version),
  };
}
async function revoke(
  repo: ProvisioningRepository,
  s: State,
): Promise<ProvisioningResult> {
  const i = repo.input,
    b = schemas.revoke.parse(i.body),
    g = s.grant!;
  requireMatch(i, etag(g.version));
  if (b.revocation_epoch <= Number(g.revocation_epoch))
    fail('VALIDATION_FAILED', 422);
  await repo.insert('ops.device_revocation', {
    tenant_id: i.context.tenantId,
    grant_id: g.id,
    device_id: s.device.deviceId,
    revocation_epoch: b.revocation_epoch,
    reason_code: b.reason_code,
    decision_by_subject: i.context.principal.subject,
    decided_at: b.decided_at,
  });
  const r = await repo.one(
    "update ops.offline_authorization_grant set status='revoked',revocation_epoch=$1,revoked_at=$2,version=version+1,updated_at=$2 where tenant_id=$3 and id=$4 returning version",
    [b.revocation_epoch, b.decided_at, i.context.tenantId, g.id],
  );
  await i.ports.checkpoint?.('after-domain');
  await repo.rows(
    "update ops.numbering_reservation set status='blocked' where tenant_id=$1 and id=any($2::uuid[])",
    [i.context.tenantId, ids(g.numbering_reservation_ids_json)],
  );
  return {
    body: {
      grant_id: g.id,
      device_id: s.device.deviceId,
      revocation_epoch: b.revocation_epoch,
      revoked_at: new Date(b.decided_at).toISOString(),
    },
    etag: etag(r!.version),
  };
}
async function reconcile(
  repo: ProvisioningRepository,
  s: State,
): Promise<ProvisioningResult> {
  const i = repo.input,
    b = schemas.reconcile.parse(i.body),
    g = s.grant!;
  requireMatch(i, etag(g.version));
  if (b.acts.length > Number(g.maximum_acts)) fail('VALIDATION_FAILED', 422);
  if (!validBindings(s, g)) fail('VALIDATION_FAILED', 422);
  const count = await repo.one(
    'select count(*)::int as count from ops.numbering_consumption where tenant_id=$1 and reservation_id=any($2::uuid[])',
    [i.context.tenantId, boundReservationIds(s, g)],
  );
  let consumed = Number(count?.count ?? 0);
  for (const act of b.acts) {
    safeMaterial(act);
    const context = act.reserved_numbering_context,
      number = Number(context.number);
    const reservation = s.reservations.find(
      (r) => r.id === context.reservation_id,
    );
    const agents = Array.isArray(g.authorized_agents_json)
      ? g.authorized_agents_json
      : [];
    if (
      act.device_id !== s.device.deviceId ||
      act.normative_package_id !== g.normative_package_id ||
      !agents.some((a) => json(a).agent_id === act.agent_id) ||
      !boundReservationIds(s, g).includes(String(context.reservation_id)) ||
      !grantBindings(s, g).some(
        (binding) =>
          binding.reservation_id === context.reservation_id &&
          binding.authorized_agent_id === act.agent_id,
      ) ||
      !reservation ||
      !Number.isSafeInteger(number) ||
      number < Number(reservation.start_number) ||
      number > Number(reservation.end_number) ||
      time(act.occurred_at) < time(g.valid_from) ||
      time(act.occurred_at) > time(g.valid_until) ||
      (g.revoked_at && time(act.occurred_at) >= time(g.revoked_at))
    )
      fail('VALIDATION_FAILED', 422);
    const existing = await repo.one(
      'select * from ops.numbering_consumption where tenant_id=$1 and (idempotency_key=$2 or (range_id=$3 and number=$4)) for update',
      [i.context.tenantId, act.idempotency_key, reservation.range_id, number],
    );
    if (existing) {
      if (digest(existing.details_json) !== digest(act))
        fail('IDEMPOTENCY_REPLAY', 409);
    } else {
      if (++consumed > Number(g.maximum_acts)) fail('VALIDATION_FAILED', 422);
      await repo.insert('ops.numbering_consumption', {
        tenant_id: i.context.tenantId,
        reservation_id: reservation.id,
        range_id: reservation.range_id,
        number,
        idempotency_key: act.idempotency_key,
        finalized_at: act.occurred_at,
        reconciled_at: i.clock.now(),
        details_json: act,
      });
    }
  }
  const r = await repo.one(
    'update ops.offline_authorization_grant set version=version+1,updated_at=$1 where tenant_id=$2 and id=$3 returning version',
    [i.clock.now(), i.context.tenantId, g.id],
  );
  s.consumptions = await repo.rows(
    'select * from ops.numbering_consumption where tenant_id=$1 and reservation_id=any($2::uuid[]) order by id for update',
    [i.context.tenantId, boundReservationIds(s, g)],
  );
  const record = {
    tenant_id: i.context.tenantId,
    grant_id: g.id,
    device_id: s.device.deviceId,
    accepted_act_count: b.acts.length,
    rejected_act_count: 0,
    unresolved_act_count: unresolvedCount(s, g),
    reconciled_by_subject: i.context.principal.subject,
    reconciled_at: i.clock.now(),
  };
  const reconciliationDigest = reconciliationSnapshot(s, g, record);
  await repo.insert('ops.provisioning_reconciliation', {
    ...record,
    reconciliation_digest: reconciliationDigest,
  });
  return {
    body: {
      grant_id: g.id,
      accepted_count: b.acts.length,
      rejected_count: 0,
      unresolved_count: record.unresolved_act_count,
      reconciliation_digest: reconciliationDigest,
      reconciled_at: record.reconciled_at.toISOString(),
    },
    etag: etag(r!.version),
  };
}
export async function executeProvisioning(
  op: Operation,
  raw: unknown,
): Promise<ProvisioningResult> {
  const i = raw as ProvisioningInput;
  if (!i?.context || !i.db || !i.clock || !i.ports)
    fail('VALIDATION_FAILED', 400);
  if (!i.context.principal?.subject) fail('AUTH_REQUIRED', 401);
  if (
    i.ports.fixtureOnly &&
    !['test', 'local-sandbox'].includes(i.runtimeProfile)
  )
    fail('VALIDATION_FAILED', 422);
  const mutation = op !== 'readiness' && op !== 'download';
  if (mutation && !i.ifMatch?.trim()) fail('IF_MATCH_REQUIRED', 428);
  if (mutation && !i.idempotencyKey?.trim()) fail('VALIDATION_FAILED', 400);
  if (
    mutation &&
    !schemas[op as keyof typeof schemas].safeParse(i.body).success
  )
    fail('VALIDATION_FAILED', 400);
  if (mutation) safeMaterial(i.body);
  for (const id of [i.context.tenantId, i.deviceId, i.packageId, i.grantId]) {
    if (
      id !== undefined &&
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/iu.test(
        id,
      )
    )
      fail('VALIDATION_FAILED', 400);
  }
  const repo = new ProvisioningRepository(i);
  if (!i.transactionManaged) await i.db.query('begin');
  try {
    await i.db.query("select set_config('app.tenant_id',$1,true)", [
      i.context.tenantId,
    ]);
    let packageRow: Row | undefined, grantRow: Row | undefined;
    if (op === 'receipt' || op === 'download') {
      packageRow = await repo.one(
        'select * from ops.provisioning_package where tenant_id=$1 and id=$2',
        [i.context.tenantId, i.packageId],
      );
      if (!packageRow) fail('FORBIDDEN_ACTION', 403);
    }
    if (op === 'revoke' || op === 'reconcile' || packageRow) {
      grantRow = await repo.one(
        'select * from ops.offline_authorization_grant where tenant_id=$1 and id=$2',
        [i.context.tenantId, packageRow?.grant_id ?? i.grantId],
      );
      if (!grantRow) fail('FORBIDDEN_ACTION', 403);
    }
    const deviceId = String(
      packageRow?.device_id ??
        grantRow?.device_id ??
        i.deviceId ??
        json(i.body).device_id ??
        '',
    );
    const device = await i.ports.resolveDevice(i.context.tenantId, deviceId);
    if (
      !device ||
      device.tenantId !== i.context.tenantId ||
      device.deviceId !== deviceId
    ) {
      if (
        op === 'readiness' &&
        i.context.principal.roles.includes('technical-admin')
      )
        fail('TENANT_MISMATCH', 404);
      fail('FORBIDDEN_ACTION', 403);
    }
    // The device advisory lock covers all aggregates including absent rows and issuance reservations.
    await repo.rows('select pg_advisory_xact_lock(hashtextextended($1,0))', [
      i.context.tenantId + ':' + deviceId,
    ]);
    const lockedDevice = await repo.one(
      'select * from ops.ops_operational_device where tenant_id=$1 and id=$2 for update',
      [i.context.tenantId, deviceId],
    );
    if (!lockedDevice) fail('FORBIDDEN_ACTION', 403);
    const s = await state(repo, device, lockedDevice);
    const lockedBinding = await i.ports.resolveDevice(
      i.context.tenantId,
      deviceId,
    );
    if (
      !lockedBinding ||
      lockedBinding.tenantId !== i.context.tenantId ||
      lockedBinding.deviceId !== deviceId
    )
      fail('FORBIDDEN_ACTION', 403);
    s.device = lockedBinding;
    if (
      !['test', 'local-sandbox'].includes(i.runtimeProfile) &&
      (s.keys.some((k) => k.key_algorithm === 'source_pending') ||
        s.packages.some(
          (p) =>
            p.signature_algorithm === 'source_pending' ||
            String(p.envelope_uri).startsWith('fixture:'),
        ))
    )
      fail('VALIDATION_FAILED', 422);
    if (packageRow) {
      s.pkg = s.packages.find((p) => p.id === packageRow!.id);
      s.grant = s.grants.find((g) => g.id === packageRow!.grant_id);
    }
    if (grantRow && !packageRow)
      s.grant = s.grants.find((g) => g.id === grantRow!.id);
    authorize(op, i, s);
    const requestDigest = digest({
      body: i.body,
      deviceId,
      packageId: packageRow?.id ?? null,
      grantId: grantRow?.id ?? null,
      subject: i.context.principal.subject,
      ifMatch: i.ifMatch ?? null,
    });
    if (mutation) {
      const replay = await repo.one(
        'select * from ops.provisioning_command_idempotency where tenant_id=$1 and command_name=$2 and idempotency_key=$3',
        [i.context.tenantId, op, i.idempotencyKey],
      );
      if (replay) {
        if (replay.request_digest !== requestDigest)
          fail('IDEMPOTENCY_REPLAY', 409);
        if (!i.transactionManaged) await i.db.query('commit');
        return {
          body: json(replay.response_body_json),
          etag: String(replay.response_etag),
        };
      }
      if (json(i.body).idempotency_key !== i.idempotencyKey)
        fail('VALIDATION_FAILED', 400);
    }
    let result: ProvisioningResult;
    switch (op) {
      case 'challenge':
        result = await challenge(repo, s);
        break;
      case 'register':
        result = await register(repo, s);
        break;
      case 'issue':
        result = await issue(repo, s);
        break;
      case 'receipt':
        result = await receipt(repo, s);
        break;
      case 'revoke':
        result = await revoke(repo, s);
        break;
      case 'reconcile':
        result = await reconcile(repo, s);
        break;
      case 'readiness':
        result = await readiness(i, s);
        break;
      case 'download': {
        const p = s.pkg!;
        const g = s.grant!;
        const now = i.clock.now().getTime();
        if (
          p.status === 'revoked' ||
          p.schema_version !== '1.0' ||
          (p.expires_at && time(p.expires_at) <= now) ||
          time(g.valid_until) <= now ||
          time(g.valid_from) > now ||
          g.status === 'revoked' ||
          grantRevoked(s, g) ||
          p.grant_id !== g.id ||
          p.manifest_digest !== g.manifest_digest ||
          p.device_id !== g.device_id ||
          p.normative_package_id !== g.normative_package_id ||
          json(p.artifact_digests_json).manifest !== p.manifest_digest ||
          !s.keys.some(
            (k) =>
              k.status === 'registered' &&
              k.key_fingerprint === g.device_key_fingerprint,
          ) ||
          !(await i.ports.trustedSigningKey(String(p.signature_key_id)))
        )
          fail('VALIDATION_FAILED', 410);
        result = {
          body: {
            package_id: p.id,
            grant_id: p.grant_id,
            device_id: p.device_id,
            manifest_digest: p.manifest_digest,
            envelope_uri: p.envelope_uri,
            signature_key_id: p.signature_key_id,
            schema_version: p.schema_version,
          },
          etag: etag(p.version),
        };
        break;
      }
    }
    if (mutation) {
      if (op !== 'issue' && op !== 'revoke')
        await i.ports.checkpoint?.('after-domain');
      await i.ports.checkpoint?.('after-numbering');
      await repo.insert('integration.outbox', {
        tenant_id: i.context.tenantId,
        topic: 'ops.provisioning.' + op,
        aggregate_type: 'ops.provisioning',
        aggregate_id: String(
          result.body.package_id ?? result.body.grant_id ?? deviceId,
        ),
        payload: result.body,
        idempotency_key: `${op}:${i.idempotencyKey}`,
      });
      await i.ports.checkpoint?.('after-outbox');
      await repo.insert('ops.provisioning_command_idempotency', {
        tenant_id: i.context.tenantId,
        command_name: op,
        idempotency_key: i.idempotencyKey,
        request_digest: requestDigest,
        response_body_json: result.body,
        response_etag: result.etag,
        completed_at: i.clock.now(),
      });
      await i.ports.checkpoint?.('before-commit');
    }
    if (!i.transactionManaged) await i.db.query('commit');
    return result;
  } catch (error) {
    if (!i.transactionManaged) await i.db.query('rollback');
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === '23505'
    )
      fail('IDEMPOTENCY_REPLAY', 409);
    throw error;
  }
}
