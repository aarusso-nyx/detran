import { createHash } from 'node:crypto';
import type { Transaction } from '@stynx-nyx/data';
import type { RaitRiskInput, RaitRiskClockCode } from '@detran/inf-deadlines';
import type { RaitOperationClockSnapshot } from './rait-operation-clock.js';
export const RAIT_RISK_SNAPSHOT_FACTORY = Symbol('RAIT_RISK_SNAPSHOT_FACTORY');
export const RAIT_RISK_PROVENANCE_READER = Symbol(
  'RAIT_RISK_PROVENANCE_READER',
);
export type RaitRiskTx = Pick<Transaction, 'query'>;
export type RaitSourceRow = {
  sourceRef: string;
  table: string;
  fields: Record<string, unknown>;
};
export interface RaitRiskProvenanceRequest {
  kind:
    | 'timer'
    | 'track'
    | 'movement'
    | 'interruption'
    | 'parameter'
    | 'incident'
    | 'legacy'
    | 'applicability';
  tenantId: string;
  caseId: string;
  sourceRefs: readonly string[];
  contentRevision: string;
}
export interface RaitRiskPolicyRequest {
  purpose: 'C_USEFUL_MOVEMENT_POLICY';
  tenantId: string;
  caseId: string;
  sourceRefs: readonly string[];
  contentRevision: string;
  policySources: readonly { sourceRef: string; sourceRevision: string }[];
}
export type RaitRiskPolicyResult =
  | {
      status: 'qualified';
      receiptDigest: string;
      sourceVersions: readonly string[];
    }
  | { status: 'missing' | 'ambiguous'; sourceVersions: readonly string[] };
export interface RaitRiskProvenanceReader {
  qualifyPolicy?(
    tx: RaitRiskTx,
    request: RaitRiskPolicyRequest,
  ): Promise<RaitRiskPolicyResult>;
  qualify(
    tx: RaitRiskTx,
    request: RaitRiskProvenanceRequest,
  ): Promise<{
    status: 'qualified' | 'missing' | 'ambiguous';
    sourceVersions: readonly string[];
  }>;
}
export interface RaitRiskSourceSnapshot {
  input: RaitRiskInput;
  incidentQualifications: readonly {
    clockCode: RaitRiskClockCode;
    status: 'qualified' | 'missing' | 'ambiguous';
    sourceVersions: readonly string[];
  }[];
  sourceRefs: readonly string[];
}
export interface RaitRiskSnapshotReader {
  read(tenantId: string, caseId: string): Promise<RaitRiskSourceSnapshot>;
}
export interface RaitRiskSnapshotFactory {
  create(
    tx: RaitRiskTx,
    operationSnapshot: RaitOperationClockSnapshot,
  ): RaitRiskSnapshotReader;
}
// ADR-0055: fixed table-global source lock order, before pool/member serialization.
export async function raitLockRiskRelations(tx: RaitRiskTx): Promise<void> {
  await tx.query('lock table ops.parameter in share mode');
  await tx.query('lock table inf.rait_holiday in share mode');
}
// Lock the complete consumed parent sets in strongest mode before any child qualification.
// Only actual validated FK edges are protected against child insertions by these locks.
export async function raitLockRiskParents(
  tx: RaitRiskTx,
  tenantId: string,
  caseIds: readonly string[],
): Promise<void> {
  if (!caseIds.length) return;
  const cases = (
    await tx.query<{ id: string; ait_id: string }>(
      'select id,ait_id from inf.rait_case where tenant_id=$1 and id=any($2::uuid[]) order by id for update',
      [tenantId, [...new Set(caseIds)].sort()],
    )
  ).rows;
  const aitIds = [...new Set(cases.map((item) => item.ait_id))].sort();
  await tx.query(
    'select id from inf.ait_ait where tenant_id=$1 and id=any($2::uuid[]) order by id for update',
    [tenantId, aitIds],
  );
  await tx.query(
    'select id from inf.infraction where tenant_id=$1 and ait_id=any($2::uuid[]) order by id for update',
    [tenantId, aitIds],
  );
  await tx.query(
    'select id from inf.rait_clock where tenant_id=$1 and case_id=any($2::uuid[]) order by id for update',
    [tenantId, cases.map((item) => item.id)],
  );
}
// Compiled closed projections from the reviewed source format; no runtime file inputs.
const FIELDS: Record<string, readonly string[]> = {
  'inf.rait_case': [
    'id',
    'tenant_id',
    'ait_id',
    'instance',
    'state',
    'version',
    'protocolled_at',
    'admitted_at',
    'judge_body_received_at',
    'judge_body_received_on',
    'cetran_received_at',
    'cetran_received_on',
    'last_movement_at',
    'closed_at',
    'unit_id',
  ],
  'inf.ait_ait': [
    'id',
    'tenant_id',
    'traffic_agency_id',
    'infraction_at',
    'version',
  ],
  'inf.infraction': [
    'id',
    'tenant_id',
    'ait_id',
    'state',
    'committed_on',
    'known_on',
    'flagrant',
    'version',
    'last_transition_id',
  ],
  'inf.infraction_timer': [
    'id',
    'tenant_id',
    'infraction_id',
    'timer_code',
    'instance',
    'start_basis',
    'started_on',
    'raw_due_on',
    'due_on',
    'ceiling_on',
    'business_days',
    'status',
    'satisfied_at',
    'expired_at',
    'cancel_reason',
    'suspended_by_act_id',
    'suspended_days',
    'extension_count',
    'legal_basis',
  ],
  'inf.rait_deadline': [
    'id',
    'tenant_id',
    'case_id',
    'timer_code',
    'start_basis',
    'started_on',
    'raw_due_on',
    'due_on',
    'business_days',
    'extension_count',
    'satisfied_at',
    'suspended_by_act_id',
    'legal_basis',
  ],
  'inf.rait_clock': [
    'id',
    'tenant_id',
    'case_id',
    'clock_code',
    'started_on',
    'ceiling_on',
    'last_reset_at',
    'legal_basis',
  ],
  'inf.rait_admissibility': [
    'id',
    'tenant_id',
    'case_id',
    'criterion',
    'verdict',
    'evaluated_at',
    'evaluated_by',
  ],
  'inf.rait_case_event': [
    'id',
    'tenant_id',
    'case_id',
    'event_type',
    'from_state',
    'to_state',
    'occurred_at',
    'actor_id',
    'payload',
  ],
  'inf.infraction_event': [
    'id',
    'tenant_id',
    'infraction_id',
    'transition_id',
    'rule_ref',
    'from_state',
    'to_state',
    'from_substate',
    'to_substate',
    'trigger_kind',
    'trigger_code',
    'event_code',
    'occurred_at',
    'actor_id',
    'actor_kind',
    'payload',
    'outbox_id',
  ],
  'ops.parameter': [
    'id',
    'tenant_id',
    'traffic_agency_id',
    'scope',
    'surface',
    'key',
    'value_json',
    'value_type',
    'status',
    'source_pending',
    'legal_readonly',
    'decision_ref',
    'legal_basis',
    'reason',
    'version',
    'effective_from',
    'effective_to',
    'changed_by',
  ],
  'inf.rait_clock_alert': [
    'id',
    'tenant_id',
    'clock_id',
    'level',
    'incident_ref',
  ],
  'inf.rait_incident': [
    'id',
    'tenant_id',
    'incident_ref',
    'clock_id',
    'case_id',
    'opened_at',
    'opened_by',
  ],
  'audit.events': [
    'event_id',
    'tenant_id',
    'occurred_at',
    'actor_id',
    'actor_role',
    'action',
    'entity',
    'entity_id',
    'details',
    'prev_hash',
    'self_hash',
  ],
  'inf.rait_claim_legacy_qualification': [
    'id',
    'tenant_id',
    'case_id',
    'observed_version',
    'observed_state',
    'assignment_status',
    'classification',
    'revision',
    'admission_ref',
    'distribution_ref',
    'assignment_ref',
    'pool_scope_ref',
    'reason',
    'reviewer_id',
    'authorization_ref',
    'observed_at',
    'created_at',
  ],
  'inf.rait_case_pool_scope': [
    'id',
    'tenant_id',
    'case_id',
    'pool_id',
    'active',
    'authorization_ref',
    'source_ref',
  ],
  'inf.rait_assignment': [
    'id',
    'tenant_id',
    'case_id',
    'pool_id',
    'member_id',
    'assigned_at',
    'assigned_by',
    'released_at',
    'release_reason',
    'active',
    'batch_id',
  ],
  'inf.rait_pool': [
    'id',
    'tenant_id',
    'instance',
    'circuit',
    'strategy',
    'active',
    'unit_id',
  ],
  'auth.users': ['id', 'tenant_id', 'is_active'],
};
const TIMESTAMPS = new Set([
  'infraction_at',
  'protocolled_at',
  'admitted_at',
  'judge_body_received_at',
  'cetran_received_at',
  'last_movement_at',
  'closed_at',
  'satisfied_at',
  'expired_at',
  'last_reset_at',
  'evaluated_at',
  'occurred_at',
  'opened_at',
  'observed_at',
  'created_at',
  'assigned_at',
  'released_at',
]);
const DATES = new Set([
  'committed_on',
  'known_on',
  'started_on',
  'raw_due_on',
  'due_on',
  'ceiling_on',
  'judge_body_received_on',
  'cetran_received_on',
  'effective_from',
  'effective_to',
]);
export function raitCanonical(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'number') {
    if (
      !Number.isFinite(value) ||
      Object.is(value, -0) ||
      Math.abs(value) > Number.MAX_SAFE_INTEGER
    )
      throw Error('Invalid source number');
    return JSON.stringify(value);
  }
  if (typeof value === 'boolean' || typeof value === 'string')
    return JSON.stringify(value);
  if (Array.isArray(value))
    return '[' + value.map(raitCanonical).join(',') + ']';
  if (
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  )
    return (
      '{' +
      Object.keys(value)
        .sort()
        .map(
          (k) =>
            JSON.stringify(k) +
            ':' +
            raitCanonical((value as Record<string, unknown>)[k]),
        )
        .join(',') +
      '}'
    );
  throw Error('Invalid source value');
}
export function raitRevision(value: unknown): string {
  return (
    'sha256:' + createHash('sha256').update(raitCanonical(value)).digest('hex')
  );
}
export async function raitSourceRows(
  tx: RaitRiskTx,
  tenantId: string,
  refs: readonly string[],
): Promise<RaitSourceRow[]> {
  if (new Set(refs).size !== refs.length) throw Error('Duplicate source');
  const groups = new Map<
    string,
    { sourceRef: string; id: string; at: number }[]
  >();
  for (const sourceRef of [...refs].sort()) {
    const m = /^sql:([a-z_]+\.[a-z_]+):(.+)$/.exec(sourceRef);
    if (!m || !FIELDS[m[1]!]) throw Error('Unknown source');
    const table = m[1]!,
      id = m[2]!,
      audit = table === 'audit.events',
      at = id.indexOf('@');
    if (
      audit
        ? !/^[1-9][0-9]*@[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}Z$/.test(
            id,
          )
        : !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
            id,
          )
    )
      throw Error('Noncanonical source identity');
    const group = groups.get(table) ?? [];
    group.push({ sourceRef, id, at });
    groups.set(table, group);
  }
  const rows: RaitSourceRow[] = [];
  // Each call re-reads actual rows. Only physical reads within this call are
  // batched; sourceRef identity is ordinal, never a lossy physical-ID map.
  for (const [table, group] of groups) {
    const audit = table === 'audit.events';
    const expected = new Map(
      group.map((entry, index) => [String(index + 1), entry]),
    );
    const columns = FIELDS[table]!.map((k) =>
      TIMESTAMPS.has(k)
        ? `to_char(src."${k}" at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as "${k}"`
        : DATES.has(k)
          ? `to_char(src."${k}",'YYYY-MM-DD') as "${k}"`
          : ['prev_hash', 'self_hash'].includes(k)
            ? `encode(src."${k}",'hex') as "${k}"`
            : k === 'event_id'
              ? `src."${k}"::text as "${k}"`
              : `src."${k}"`,
    ).join(',');
    const target = audit
      ? 'unnest($2::bigint[],$3::timestamptz[]) with ordinality wanted(event_id,occurred_at,ordinal) on src.event_id=wanted.event_id and src.occurred_at=wanted.occurred_at'
      : 'unnest($2::uuid[]) with ordinality wanted(id,ordinal) on src.id=wanted.id';
    const args = audit
      ? [
          tenantId,
          group.map((entry) => entry.id.slice(0, entry.at)),
          group.map((entry) => entry.id.slice(entry.at + 1)),
        ]
      : [tenantId, group.map((entry) => entry.id)];
    const result = await tx.query<Record<string, unknown>>(
      `select wanted.ordinal::text as "__rait_source_ordinal",${columns} from ${table} src join ${target} where src.tenant_id=$1 order by wanted.ordinal${audit || table === 'inf.rait_claim_legacy_qualification' ? '' : ' for share of src'}`,
      args,
    );
    if (result.rows.length !== group.length)
      throw Error('Missing or ambiguous source');
    for (const row of result.rows) {
      const { __rait_source_ordinal: ordinal, ...fields } = row;
      const entry =
        typeof ordinal === 'string' ? expected.get(ordinal) : undefined;
      if (!entry || fields.tenant_id !== tenantId)
        throw Error('Missing or ambiguous source');
      expected.delete(ordinal as string);
      rows.push({ sourceRef: entry.sourceRef, table, fields });
    }
    if (expected.size) throw Error('Missing source');
  }
  return rows.sort((a, b) =>
    a.sourceRef < b.sourceRef ? -1 : a.sourceRef > b.sourceRef ? 1 : 0,
  );
}
// Additive policy-request-v1 encoding, S2-R13 v2: source pairs identify bytes;
// the trusted reader independently retrieves receipt decisions and authority.
export async function raitQualifyPolicy(
  tx: RaitRiskTx,
  reader: RaitRiskProvenanceReader,
  tenantId: string,
  caseId: string,
  refs: readonly string[],
): Promise<{ receiptDigest: string; sourceVersions: readonly string[] }> {
  if (!reader.qualifyPolicy || !refs.length)
    throw Error('Missing qualified C policy');
  const rows = await raitSourceRows(tx, tenantId, refs);
  const purpose = 'C_USEFUL_MOVEMENT_POLICY' as const;
  const policySources = [
    {
      sourceRef:
        'docs/framework/product/domains/inf/rait/workflows/WF-RAIT-002.md#4.2',
      sourceRevision:
        'sha256:1f0020512955efae8710e6d5195f0457f10a59ce0c385c28809b7f6a1f2930b5',
    },
  ];
  const result = await reader.qualifyPolicy(tx, {
    purpose,
    tenantId,
    caseId,
    sourceRefs: [...refs].sort(),
    policySources,
    contentRevision: raitRevision({
      schemaVersion: 1,
      namespace: 'rait-risk-policy-request-v1',
      purpose,
      tenantId,
      caseId,
      rows,
      dependencies: [],
      policySources,
    }),
  });
  if (
    !result ||
    typeof result !== 'object' ||
    Array.isArray(result) ||
    Object.keys(result).sort().join(',') !==
      'receiptDigest,sourceVersions,status' ||
    result.status !== 'qualified' ||
    typeof result.receiptDigest !== 'string' ||
    !/^sha256:[a-f0-9]{64}$/.test(result.receiptDigest) ||
    !Array.isArray(result.sourceVersions) ||
    !result.sourceVersions.length
  )
    throw Error('Unqualified C policy');
  for (const version of result.sourceVersions) {
    if (typeof version !== 'string' || !/^rrv1:[a-f0-9]{64}$/.test(version))
      throw Error('Invalid policy version');
  }
  if (
    raitCanonical(result.sourceVersions) !==
    raitCanonical([...new Set(result.sourceVersions)].sort())
  )
    throw Error('Noncanonical policy versions');
  return {
    receiptDigest: result.receiptDigest,
    sourceVersions: result.sourceVersions,
  };
}
export async function raitQualify(
  tx: RaitRiskTx,
  reader: RaitRiskProvenanceReader,
  kind: RaitRiskProvenanceRequest['kind'],
  tenantId: string,
  caseId: string,
  refs: readonly string[],
  dependencies: readonly string[] = [],
) {
  const rows = await raitSourceRows(tx, tenantId, refs);
  const result = await reader.qualify(tx, {
    kind,
    tenantId,
    caseId,
    sourceRefs: [...refs].sort(),
    contentRevision: raitRevision({
      schemaVersion: 1,
      namespace: 'rait-risk-source-v1',
      kind,
      tenantId,
      caseId,
      rows,
      dependencies: [...dependencies].sort(),
    }),
  });
  if (
    result.status !== 'qualified' ||
    !result.sourceVersions.length ||
    result.sourceVersions.some((v) => !/^rrv1:[a-f0-9]{64}$/.test(v))
  )
    throw Error('Unqualified source kind ' + kind);
  return result.sourceVersions;
}
export type { RaitOperationClockSnapshot } from './rait-operation-clock.js';
