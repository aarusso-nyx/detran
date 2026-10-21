// Article7 Inspector: synthetic isolated S2 sources, never production qualification.
import { randomUUID, createHash } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import { readFileSync } from 'node:fs';
import type { Transaction } from '@stynx-nyx/data';
import pg from 'pg';
import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { expect } from 'vitest';
import {
  RAIT_TENANT,
  RAIT_SECRETARY,
  RAIT_CASE,
  assertDedicatedDatabaseEnvironment,
} from './rait-case-command.fixture.js';

export { RAIT_TENANT, RAIT_SECRETARY };
export const PREFIX = '/v1/inf/rait';
export const syntheticSource =
  'Inspector-only P4-02-S2 qualified tenant fixture; not production evidence';
export type CaseRow = {
  id: string;
  state: string;
  version: number;
  assignment_id?: string;
  instance: string;
};
type Sql = Pick<Transaction, 'query'>;
export type SourceRow = {
  sourceRef: string;
  table: string;
  fields: Record<string, unknown>;
};
export type ReceiptCore = {
  schemaVersion: 1;
  namespace: 'rait-risk-receipt-v1';
  receiptId: string;
  kind: string;
  tenantId: string;
  caseId: string | null;
  bindings: { sourceRef: string; rowRevision: string }[];
  authorization: {
    authorityRef: string;
    actorId: string;
    decisionRef: string;
    recordedAt: string;
  };
  dependencies: string[];
  policySources: {
    sourceRef: string;
    sourceRevision: string;
    decisionRef: string;
  }[];
};
export type QualifiedReceipt = {
  core: ReceiptCore;
  digest: string;
  admittedOrigin: 'owner-approved-isolated-inspector-fixture';
};
export type ProvenanceRequest = {
  kind: string;
  tenantId: string;
  caseId: string;
  sourceRefs: readonly string[];
  contentRevision: string;
};
export type PolicyRequest = {
  purpose: string;
  tenantId: string;
  caseId: string;
  sourceRefs: readonly string[];
  contentRevision: string;
  policySources: readonly { sourceRef: string; sourceRevision: string }[];
};
export const isolatedPolicyPurpose =
  'TASK-0044:C_USEFUL_MOVEMENT_POLICY:isolated-test-only';
export function opaqueReceiptVersion(digest: string) {
  return (
    'rrv1:' +
    canonicalRevision({
      namespace: 'isolated-fixture-opaque-version-v1',
      receiptDigest: digest,
    }).slice('sha256:'.length)
  );
}
const provenanceFormat = JSON.parse(
  readFileSync(
    new URL(
      '../../../../work/rounds/R-0025/reports/S2-execution/source-provenance-format.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as {
  rowFields: Record<string, string[]>;
  policyCanonicalSources: { sourceRef: string; sourceRevision: string }[];
};

export function canonicalBytes(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'string' || typeof value === 'boolean')
    return JSON.stringify(value);
  if (typeof value === 'number') {
    if (
      !Number.isFinite(value) ||
      Object.is(value, -0) ||
      Math.abs(value) > Number.MAX_SAFE_INTEGER
    )
      throw Error('Unsafe canonical source number');
    return JSON.stringify(value);
  }
  if (Array.isArray(value))
    return '[' + value.map(canonicalBytes).join(',') + ']';
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
            canonicalBytes((value as Record<string, unknown>)[k]),
        )
        .join(',') +
      '}'
    );
  throw Error('Unrepresentable canonical source value');
}
export function canonicalRevision(value: unknown): string {
  return (
    'sha256:' + createHash('sha256').update(canonicalBytes(value)).digest('hex')
  );
}

const sourceColumnTypes = new Map<string, Map<string, string>>();
export async function readSourceRowsScalar(
  q: Sql,
  sourceRefs: readonly string[],
): Promise<SourceRow[]> {
  if (new Set(sourceRefs).size !== sourceRefs.length)
    throw Error('Duplicate source reference');
  const rows: SourceRow[] = [];
  for (const sourceRef of [...sourceRefs].sort()) {
    const match = /^sql:([a-z_]+\.[a-z_]+):(.+)$/.exec(sourceRef);
    if (!match) throw Error('Unqualified source reference');
    const table = match[1]!;
    const id = match[2]!;
    const fields = provenanceFormat.rowFields[table];
    if (!fields) throw Error('Unowned source table');
    const [schema, name] = table.split('.');
    let types = sourceColumnTypes.get(table);
    if (!types) {
      const columns = (
        await q.query<{ column_name: string; data_type: string }>(
          `select column_name,data_type from information_schema.columns where table_schema=$1 and table_name=$2`,
          [schema, name],
        )
      ).rows;
      types = new Map(columns.map((c) => [c.column_name, c.data_type]));
      sourceColumnTypes.set(table, types);
    }
    const projections = fields.map((k) => {
      const type = types!.get(k);
      if (!type) throw Error('S2_SCHEMA_PENDING: ' + table + '.' + k);
      if (type === 'timestamp with time zone')
        return `to_char("${k}" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as "${k}"`;
      if (type === 'date') return `to_char("${k}",'YYYY-MM-DD') as "${k}"`;
      if (type === 'bytea') return `encode("${k}",'hex') as "${k}"`;
      if (k === 'event_id' || type === 'uuid') return `"${k}"::text as "${k}"`;
      return `"${k}"`;
    });
    const audit = table === 'audit.events';
    const split = id.indexOf('@');
    const where = audit
      ? 'event_id=$1::bigint and occurred_at=$2::timestamptz'
      : 'id=$1::uuid';
    const result = await q.query<Record<string, unknown>>(
      `select ${projections.join(',')} from ${table} where ${where}`,
      audit ? [id.slice(0, split), id.slice(split + 1)] : [id],
    );
    if (result.rows.length !== 1) throw Error('Missing/ambiguous source row');
    const row = result.rows[0]!;
    if (Object.keys(row).sort().join('|') !== [...fields].sort().join('|'))
      throw Error('Incomplete source projection');
    rows.push({ sourceRef, table, fields: row });
  }
  return rows;
}

/** Independent fixed-table batching; the frozen scalar oracle above remains separate. */
export async function readSourceRows(
  q: Sql,
  sourceRefs: readonly string[],
): Promise<SourceRow[]> {
  if (new Set(sourceRefs).size !== sourceRefs.length)
    throw Error('Duplicate source reference');
  const groups = new Map<string, { sourceRef: string; id: string }[]>();
  for (const sourceRef of [...sourceRefs].sort()) {
    const m = /^sql:([a-z_]+\.[a-z_]+):(.+)$/.exec(sourceRef);
    if (!m) throw Error('Unqualified source reference');
    if (!provenanceFormat.rowFields[m[1]!]) throw Error('Unowned source table');
    const entries = groups.get(m[1]!) ?? [];
    entries.push({ sourceRef, id: m[2]! });
    groups.set(m[1]!, entries);
  }
  const rows: SourceRow[] = [];
  for (const [table, entries] of groups) {
    const fields = provenanceFormat.rowFields[table]!;
    let types = sourceColumnTypes.get(table);
    if (!types) {
      const [schema, name] = table.split('.');
      const result = await q.query<{ column_name: string; data_type: string }>(
        'select column_name,data_type from information_schema.columns where table_schema=$1 and table_name=$2',
        [schema, name],
      );
      types = new Map(result.rows.map((c) => [c.column_name, c.data_type]));
      sourceColumnTypes.set(table, types);
    }
    const columns = fields.map((k) => {
      const type = types!.get(k);
      if (!type) throw Error('S2_SCHEMA_PENDING: ' + table + '.' + k);
      if (type === 'timestamp with time zone')
        return `to_char("${k}" AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as "${k}"`;
      if (type === 'date') return `to_char("${k}",'YYYY-MM-DD') as "${k}"`;
      if (type === 'bytea') return `encode("${k}",'hex') as "${k}"`;
      if (k === 'event_id' || type === 'uuid') return `"${k}"::text as "${k}"`;
      return `"${k}"`;
    });
    const audit = table === 'audit.events';
    const where = audit
      ? "event_id=split_part(requested.identity,'@',1)::bigint and occurred_at=substring(requested.identity from position('@' in requested.identity)+1)::timestamptz"
      : 'id=requested.identity::uuid';
    const result = await q.query<Record<string, unknown>>(
      `select requested.ordinality::int as __source_ordinal, source.* from unnest($1::text[]) with ordinality requested(identity,ordinality) cross join lateral (select ${columns.join(',')} from ${table} where ${where}) source`,
      [entries.map((e) => e.id)],
    );
    for (let index = 0; index < entries.length; index++) {
      const matches = result.rows.filter(
        (row) => row.__source_ordinal === index + 1,
      );
      if (matches.length !== 1) throw Error('Missing/ambiguous source row');
      const { __source_ordinal: _, ...fieldsRow } = matches[0]!;
      if (
        Object.keys(fieldsRow).sort().join('|') !== [...fields].sort().join('|')
      )
        throw Error('Incomplete source projection');
      rows.push({
        sourceRef: entries[index]!.sourceRef,
        table,
        fields: fieldsRow,
      });
    }
    if (result.rows.length !== entries.length)
      throw Error('Missing/ambiguous source row');
  }
  return rows.sort((a, b) =>
    a.sourceRef < b.sourceRef ? -1 : a.sourceRef > b.sourceRef ? 1 : 0,
  );
}

/** Frozen physical scalar discovery SQL from provider d9a85938; real same-Tx oracle, never a producer override. */
export async function frozenScalarProviderInventories(
  tx: Sql,
  input: {
    caseId: string;
    infractionId: string;
    agencyId: string;
    today: string;
  },
) {
  const observations: {
    kind: string;
    sql: string;
    args: unknown[];
    rows: Record<string, unknown>[];
    elapsedMs: number;
  }[] = [];
  const q = async (kind: string, sql: string, args: unknown[]) => {
    const start = performance.now();
    const result = await tx.query<Record<string, unknown>>(sql, args);
    observations.push({
      kind,
      sql,
      args,
      rows: result.rows,
      elapsedMs: performance.now() - start,
    });
    return result.rows;
  };
  const clocks = await q(
    'clocks',
    'select id,clock_code from inf.rait_clock where tenant_id=$1 and case_id=$2 order by id for share',
    [RAIT_TENANT, input.caseId],
  );
  const refs: string[] = [];
  const selected: {
    code: string;
    clock: string;
    timer: string;
    parameter: string;
    alerts: string[];
    incidents: string[];
  }[] = [];
  for (const [code, timerCode, key] of [
    ['A', 'T-DEC', 'rait.ladder.A'],
    ['C', 'T-PAR-3A', 'rait.ladder.C'],
    ['D', 'T-PRESC-5A', 'rait.ladder.D'],
  ] as const) {
    const matching = clocks.filter((c) => c.clock_code === code);
    expect(matching).toHaveLength(1);
    const clockRef = 'sql:inf.rait_clock:' + matching[0]!.id;
    refs.push(clockRef);
    const clock = (await readSourceRowsScalar(tx, [clockRef]))[0]!.fields;
    const timers = await q(
      'timers',
      "select id from inf.infraction_timer where tenant_id=$1 and infraction_id=$2 and timer_code=$3 and status='armado' and satisfied_at is null and expired_at is null and instance is null order by id for share",
      [RAIT_TENANT, input.infractionId, timerCode],
    );
    expect(timers).toHaveLength(1);
    const timerRef = 'sql:inf.infraction_timer:' + timers[0]!.id;
    refs.push(timerRef);
    const parameters = await q(
      'parameters',
      "select id,traffic_agency_id from ops.parameter where tenant_id=$1 and surface='rait' and key=$2 and effective_from<=$3 and (effective_to is null or effective_to>=$3) and (traffic_agency_id=$4 or traffic_agency_id is null) order by (traffic_agency_id is not null) desc,effective_from desc,version desc for share",
      [RAIT_TENANT, key, input.today, input.agencyId],
    );
    const agency = parameters.filter(
      (p) => p.traffic_agency_id === input.agencyId,
    );
    const tier = agency.length
      ? agency
      : parameters.filter((p) => p.traffic_agency_id === null);
    expect(tier).toHaveLength(1);
    const parameterRef = 'sql:ops.parameter:' + tier[0]!.id;
    refs.push(parameterRef);
    const record = {
      code,
      clock: clockRef,
      timer: timerRef,
      parameter: parameterRef,
      alerts: [] as string[],
      incidents: [] as string[],
    };
    if (input.today >= String(clock.ceiling_on)) {
      const alerts = await q(
        'alerts',
        "select id,incident_ref from inf.rait_clock_alert where tenant_id=$1 and clock_id=$2 and level='PRESCRITO_OPERACIONAL' order by id for share",
        [RAIT_TENANT, clock.id],
      );
      expect(alerts).toHaveLength(1);
      expect(alerts[0]!.incident_ref).toEqual(expect.any(String));
      const incidents = await q(
        'incidents',
        'select id,case_id,clock_id from inf.rait_incident where tenant_id=$1 and incident_ref=$2 order by id for share',
        [RAIT_TENANT, alerts[0]!.incident_ref],
      );
      expect(incidents).toHaveLength(1);
      expect(incidents[0]!.case_id).toBe(input.caseId);
      expect(incidents[0]!.clock_id).toBe(clock.id);
      record.alerts.push('sql:inf.rait_clock_alert:' + alerts[0]!.id);
      record.incidents.push('sql:inf.rait_incident:' + incidents[0]!.id);
      refs.push(...record.alerts, ...record.incidents);
    }
    selected.push(record);
  }
  const rows = await readSourceRowsScalar(tx, refs);
  return { rows, selected, observations, digest: canonicalRevision(rows) };
}

type P0Context = {
  observer?: P0QueryObservation;
  operation: string;
  caseId?: string | null;
  kind?: string;
  depth: number;
  span?: number;
};
export class P0QueryObservation {
  private static active: P0QueryObservation | undefined;
  private static readonly context = new AsyncLocalStorage<P0Context>();
  private readonly context = P0QueryObservation.context;
  private readonly start = performance.now();
  private currentOperation = 'ambient';
  private phaseName = 'setup';
  private stopped = false;
  private sequence = 0;
  private readonly queries: Record<string, unknown>[] = [];
  private readonly spans: Record<string, unknown>[] = [];
  private readonly operations: Record<string, unknown>[] = [];
  private static readonly originalQuery = pg.Client.prototype.query;
  private readonly originalQuery = P0QueryObservation.originalQuery;
  static restore() {
    pg.Client.prototype.query = P0QueryObservation.originalQuery;
    P0QueryObservation.active = undefined;
    console.log(
      'P0_OBSERVER_RESTORED',
      pg.Client.prototype.query === P0QueryObservation.originalQuery,
    );
  }
  private server?: {
    removeListener: (
      name: string,
      listener: (...args: any[]) => void,
    ) => unknown;
  };
  private listener?: (...args: any[]) => void;
  constructor(
    readonly test: string,
    readonly tenantId: string,
  ) {}
  install(server: {
    prependListener: (
      name: string,
      listener: (...args: any[]) => void,
    ) => unknown;
    removeListener: (
      name: string,
      listener: (...args: any[]) => void,
    ) => unknown;
  }) {
    if (P0QueryObservation.active) throw Error('P0 observer overlap');
    P0QueryObservation.active = this;
    const original = this.originalQuery as unknown as (
      ...args: unknown[]
    ) => unknown;
    (
      pg.Client.prototype as unknown as {
        query: (...args: unknown[]) => unknown;
      }
    ).query = function (this: pg.Client, ...args: unknown[]) {
      const observation =
        P0QueryObservation.context.getStore()?.observer ??
        P0QueryObservation.active;
      if (!observation) return original.apply(this, args);
      const overheadStart = performance.now();
      const text =
        typeof args[0] === 'string'
          ? args[0]
          : (args[0] as { text?: string })?.text;
      const sql = text ?? '[unsupported query representation]';
      const stack = new Error().stack ?? '';
      const context = observation.context.getStore();
      const operation = context?.operation ?? observation.currentOperation;
      const phase = observation.phaseName;
      const identity = /current_role|pg_backend_pid\(\)/i.test(sql);
      const tables = [
        ...new Set(
          [
            ...sql.matchAll(
              /\b(?:from|join|update|into|table)\s+([a-z_]+\.[a-z_]+)/gi,
            ),
          ].map((m) => m[1]),
        ),
      ].sort();
      let category = 'unclassified';
      if (identity && context?.kind) category = 'verifier.identity';
      else if (
        /rait_holiday/i.test(sql) &&
        /isBusinessDay|nextBusinessDay|calendar/i.test(stack)
      )
        category = 'runtime.calendar';
      else if (context?.kind) category = 'verifier.receipt';
      else if (/raitSourceRows/.test(stack)) category = 'runtime.source_rows';
      else if (/rait-risk\.providers/.test(stack))
        category = 'runtime.discovery';
      else if (
        /raitLockRisk|rait-claim-context\.service|rait-case-command\.service/.test(
          stack,
        ) &&
        /lock table|eligible_pool|potential as materialized|for (?:share|update)|selector_/i.test(
          sql,
        )
      )
        category = 'runtime.lock_universe';
      else if (/rait-p402-claim\.fixture/.test(stack))
        category =
          observation.phaseName === 'setup' ? 'fixture.setup' : 'unclassified';
      if (
        category === 'unclassified' &&
        /^(?:begin|commit|rollback|set\s|select set_config)/i.test(sql.trim())
      )
        category = 'session_control';
      const observerBeforeMs = performance.now() - overheadStart;
      const queryStart = performance.now();
      let completed = false;
      const finish = (error?: unknown, value?: unknown) => {
        if (completed) return;
        completed = true;
        const end = performance.now();
        const row = (value as { rows?: Record<string, unknown>[] })?.rows?.[0];
        const record = {
          observerTest: observation.test,
          operation,
          phase,
          tenantId: observation.tenantId,
          caseId: context?.caseId ?? null,
          kind: context?.kind ?? null,
          depth: context?.depth ?? 0,
          span: context?.span ?? null,
          category,
          sqlHash: createHash('sha256').update(sql).digest('hex'),
          tables,
          command: sql.trim().split(/\s+/)[0]?.toLowerCase(),
          elapsedMs: end - queryStart,
          observerBeforeMs,
          late: observation.stopped,
          error: error
            ? ((error as { code?: string }).code ??
              (error as Error).name ??
              'error')
            : null,
          backendPid:
            (this as unknown as { processID?: number }).processID ?? null,
          identity:
            identity && row
              ? {
                  role: row.role ?? null,
                  tenant: row.tenant ?? null,
                  pid: row.pid ?? null,
                }
              : undefined,
        };
        Object.assign(record, { observerAfterMs: performance.now() - end });
        observation.queries.push(record);
        if (observation.stopped)
          console.log('P0_LATE_QUERY', JSON.stringify(record));
      };
      const callbackIndex = args.length - 1;
      const hasCallback = typeof args[callbackIndex] === 'function';
      if (typeof args[callbackIndex] === 'function') {
        const callback = args[callbackIndex] as (
          ...values: unknown[]
        ) => unknown;
        args[callbackIndex] = function (this: unknown, ...values: unknown[]) {
          finish(values[0], values[1]);
          return callback.apply(this, values);
        };
      }
      try {
        const result = original.apply(this, args);
        if (result && typeof (result as Promise<unknown>).then === 'function')
          void (result as Promise<unknown>).then(
            (value) => finish(undefined, value),
            (error) => finish(error),
          );
        if (
          (!result ||
            typeof (result as Promise<unknown>).then !== 'function') &&
          !hasCallback
        )
          observation.queries.push({
            observerTest: observation.test,
            operation,
            phase,
            category: 'unclassified',
            sqlHash: createHash('sha256').update(sql).digest('hex'),
            tables,
            elapsedMs: null,
            unsupportedOverload: true,
            late: observation.stopped,
          });
        return result;
      } catch (error) {
        finish(error);
        throw error;
      }
    } as never;
    this.listener = (req, res) => {
      const id = 'http-' + ++this.sequence;
      const begin = performance.now();
      const url = new URL(req.url ?? '/', 'http://fixture.invalid');
      this.currentOperation = id;
      this.context.enterWith({ observer: this, operation: id, depth: 0 });
      res.once('finish', () => {
        const end = performance.now();
        this.operations.push({
          observerTest: this.test,
          id,
          method: req.method,
          path: url.pathname,
          cursorPresent: url.searchParams.has('queue_cursor'),
          elapsedMs: end - begin,
          status: res.statusCode,
          late: this.stopped,
        });
        if (this.currentOperation === id)
          this.currentOperation = 'between-http';
        if (this.stopped)
          console.log(
            'P0_LATE_OPERATION',
            JSON.stringify(this.operations.at(-1)),
          );
      });
    };
    server.prependListener('request', this.listener);
    this.server = server;
  }
  async span<T>(
    kind: string,
    caseId: string | null,
    depth: number,
    work: () => Promise<T>,
  ): Promise<T> {
    const parent = this.context.getStore();
    const id = ++this.sequence,
      start = performance.now();
    try {
      const value = await this.context.run(
        {
          observer: this,
          operation: parent?.operation ?? this.currentOperation,
          caseId,
          kind,
          depth,
          span: id,
        },
        work,
      );
      this.spans.push({
        observerTest: this.test,
        id,
        parent: parent?.span ?? null,
        operation: parent?.operation ?? this.currentOperation,
        caseId,
        kind,
        depth,
        inclusiveMs: performance.now() - start,
        status: (value as { status?: string })?.status ?? 'returned',
        late: this.stopped,
      });
      return value;
    } catch (error) {
      this.spans.push({
        observerTest: this.test,
        id,
        parent: parent?.span ?? null,
        caseId,
        kind,
        depth,
        inclusiveMs: performance.now() - start,
        error: (error as Error).name,
        late: this.stopped,
      });
      throw error;
    }
  }
  phase(name: string) {
    this.phaseName = name;
  }
  stop(status: string) {
    this.stopped = true;
    if (this.listener) this.server?.removeListener('request', this.listener);
    if (P0QueryObservation.active === this) {
      P0QueryObservation.active = undefined;
    }
    console.log(
      'P0_OBSERVATION',
      JSON.stringify({
        test: this.test,
        status,
        elapsedMs: performance.now() - this.start,
        queries: this.queries,
        spans: this.spans,
        operations: this.operations,
        limitations: [
          'query elapsed includes driver/network/PG/lock time, not server-only execution',
          'inclusive verifier spans overlap leaf SQL and are never added to SQL totals',
          'serialization and exact PG lock-wait time unobserved; remain within HTTP/residual wall',
          'callsite-ambiguous queries explicitly unclassified',
          'late asynchronous callbacks are not PASS',
        ],
      }),
    );
  }
}

export class RaitP402ClaimFixture {
  observation: P0QueryObservation | undefined;
  private observe<T>(
    kind: string,
    caseId: string | null,
    depth: number,
    work: () => Promise<T>,
  ): Promise<T> {
    return this.observation
      ? this.observation.span(kind, caseId, depth, work)
      : work();
  }
  readonly owner = new pg.Client({
    connectionString: process.env.STYNX_OWNER_DATABASE_URL,
  });
  readonly unit = randomUUID();
  readonly agency = randomUUID();
  practiceOn = '2026-06-15';
  provenanceChecks = 0;
  policyPortAbsent = false;
  policyResultMode:
    'normal' | 'missing' | 'ambiguous' | 'malformed' | 'badDigest' = 'normal';
  readonly policyRequests: PolicyRequest[] = [];
  readonly policyDependencyDigests = new Set<string>();
  readonly qualifiedVersions = new Set<string>();
  readonly qualifiedBackendPids = new Set<number>();
  onQualified: ((req: ProvenanceRequest) => Promise<void>) | undefined;
  readonly parameters = new Map<
    string,
    { id: string; receipt: QualifiedReceipt }
  >();
  readonly pool = randomUUID();
  readonly actor = randomUUID();
  readonly reader = randomUUID();
  readonly secondActor = randomUUID();
  readonly secretaryMember = randomUUID();
  readonly member = randomUUID();
  readonly secondMember = randomUUID();
  readonly cases: string[] = [];
  readonly receipts: QualifiedReceipt[] = [];
  readonly revokedReceipts = new Set<string>();
  async connect() {
    assertDedicatedDatabaseEnvironment();
    // Execution custody checks the owned local port; CI uses its isolated service.
    await this.owner.connect();
    await this.owner.query("select set_config('app.tenant_id',$1,false)", [
      RAIT_TENANT,
    ]);
    await this.owner.query(
      `insert into auth.users(id,tenant_id,email,display_name) values($1::uuid,$3::uuid,$1::text||'@s2.invalid','S2 isolated analyst'),($2::uuid,$3::uuid,$2::text||'@s2.invalid','S2 second analyst')`,
      [this.actor, this.secondActor, RAIT_TENANT],
    );
    await this.owner.query(
      'insert into auth.memberships(tenant_id,user_id) values($1,$2),($1,$3)',
      [RAIT_TENANT, this.actor, this.secondActor],
    );
    await this.owner.query(
      "insert into inf.rait_unit(id,tenant_id,name,judging_body) values($1::uuid,$2::uuid,$1::text,'jari')",
      [this.unit, RAIT_TENANT],
    );
    await this.owner.query(
      "insert into inf.rait_pool(id,tenant_id,name,instance,circuit,strategy,unit_id) values($1,$2,'S2 isolated defense','defesa_previa',1,'pull',$3)",
      [this.pool, RAIT_TENANT, this.unit],
    );
    await this.owner.query(
      "insert into auth.users(id,tenant_id,email,display_name) values($1::uuid,$2::uuid,$1::text||'@s2.invalid','S2 scoped oversight reader')",
      [this.reader, RAIT_TENANT],
    );
    await this.owner.query(
      'insert into auth.memberships(tenant_id,user_id) values($1,$2)',
      [RAIT_TENANT, this.reader],
    );
    await this.owner.query(
      "insert into inf.rait_case_read_scope(tenant_id,actor_id,role,unit_id,active,authorization_ref) values($1,$2,'rait-coordinator',$3,true,$4)",
      [RAIT_TENANT, this.reader, this.unit, syntheticSource],
    );
    for (const [id, person, role] of [
      [this.secretaryMember, RAIT_SECRETARY, 'secretaria'],
      [this.member, this.actor, 'analista'],
      [this.secondMember, this.secondActor, 'analista'],
    ]) {
      await this.owner.query(
        "insert into inf.rait_pool_member(id,tenant_id,pool_id,person_id,member_role,status) values($1,$2,$3,$4,$5,'ATIVO')",
        [id, RAIT_TENANT, this.pool, person, role],
      );
      if (role === 'analista') {
        const schedule = randomUUID();
        await this.owner.query(
          `insert into inf.rait_schedule(id,tenant_id,pool_id,member_id,kind,period_start,period_end,wip_limit,published_at,published_by)
          values($1,$2,$3,$4,'escala_semanal',current_date-1,current_date+1,2,clock_timestamp(),$5)`,
          [schedule, RAIT_TENANT, this.pool, id, RAIT_SECRETARY],
        );
        await this.owner.query(
          `insert into inf.rait_schedule_slot(tenant_id,schedule_id,slot_on,availability)
          select $1,$2,current_date+n,'DISPONIVEL' from generate_series(-1,1)n`,
          [RAIT_TENANT, schedule],
        );
      }
    }
  }
  headers(
    role = 'rait-analyst',
    actor = this.actor,
    key = `s2-${randomUUID()}`,
    match?: string,
  ) {
    process.env.DETRAN_LOCAL_TENANT_ID = RAIT_TENANT;
    process.env.DETRAN_LOCAL_ACTOR_ID = actor;
    process.env.DETRAN_LOCAL_ROLES = role;
    return {
      authorization: 'Bearer local',
      'x-tenant-id': RAIT_TENANT,
      'idempotency-key': key,
      ...(match === undefined ? {} : { 'if-match': match }),
    };
  }
  riskHeaders(role = 'rait-coordinator', actor = this.reader) {
    return this.headers(role, actor);
  }
  async extraPool(unit: string | null = this.unit, withMember = true) {
    const pool = randomUUID(),
      member = randomUUID(),
      schedule = randomUUID();
    await this.owner.query(
      "insert into inf.rait_pool(id,tenant_id,name,instance,circuit,strategy,unit_id) values($1,$2,'S2 other defense','defesa_previa',1,'pull',$3)",
      [pool, RAIT_TENANT, unit],
    );
    if (withMember) {
      await this.owner.query(
        "insert into inf.rait_pool_member(id,tenant_id,pool_id,person_id,member_role,status) values($1,$2,$3,$4,'analista','ATIVO')",
        [member, RAIT_TENANT, pool, this.actor],
      );
      await this.owner.query(
        "insert into inf.rait_schedule(id,tenant_id,pool_id,member_id,kind,period_start,period_end,wip_limit,published_at,published_by) values($1,$2,$3,$4,'escala_semanal',current_date-1,current_date+1,2,clock_timestamp(),$5)",
        [schedule, RAIT_TENANT, pool, member, RAIT_SECRETARY],
      );
      await this.owner.query(
        "insert into inf.rait_schedule_slot(tenant_id,schedule_id,slot_on,availability) select $1,$2,current_date+n,'DISPONIVEL' from generate_series(-1,1)n",
        [RAIT_TENANT, schedule],
      );
    }
    return pool;
  }
  async joinExistingPool(pool: string) {
    // Add only a fresh test actor's availability; preserve the canonical pool and historical case facts.
    const member = randomUUID(),
      schedule = randomUUID();
    await this.owner.query(
      "insert into inf.rait_pool_member(id,tenant_id,pool_id,person_id,member_role,status) values($1,$2,$3,$4,'analista','ATIVO')",
      [member, RAIT_TENANT, pool, this.actor],
    );
    await this.owner.query(
      "insert into inf.rait_schedule(id,tenant_id,pool_id,member_id,kind,period_start,period_end,wip_limit,published_at,published_by) values($1,$2,$3,$4,'escala_semanal',current_date-1,current_date+1,2,clock_timestamp(),$5)",
      [schedule, RAIT_TENANT, pool, member, RAIT_SECRETARY],
    );
    await this.owner.query(
      "insert into inf.rait_schedule_slot(tenant_id,schedule_id,slot_on,availability) select $1,$2,current_date+n,'DISPONIVEL' from generate_series(-1,1)n",
      [RAIT_TENANT, schedule],
    );
  }
  async syntheticLegacy() {
    // This initial routing sample is ONLY for validation-before-effects RED.
    // It is deliberately not an ADR0048 qualified legacy disposition.
    const id = randomUUID();
    await this.owner.query('begin');
    try {
      await this.owner.query(
        `insert into inf.rait_case(id,tenant_id,ait_id,protocol_number,instance,circuit,state,intake_channel,protocolled_at,unit_id)
        select $1,tenant_id,ait_id,$2,'defesa_previa',1,'DISTRIBUIDO',intake_channel,protocolled_at,$3 from inf.rait_case where id=$4`,
        [id, `S2-${id}`, this.unit, RAIT_CASE('06')],
      );
      await this.owner.query(
        'select inf.rait_record_initial_priority($1,$2,clock_timestamp(),$3::jsonb)',
        [id, RAIT_SECRETARY, '[]'],
      );
      await this.owner.query(
        `insert into inf.rait_case_pool_scope(tenant_id,case_id,pool_id,active,authorization_ref,source_ref) values($1,$2,$3,true,$4,'s2-fixture-qualified-routing')`,
        [RAIT_TENANT, id, this.pool, syntheticSource],
      );
      await this.owner.query('commit');
    } catch (e) {
      await this.owner.query('rollback');
      throw e;
    }
    this.cases.push(id);
    return id;
  }
  async admitted(
    app: INestApplication,
    proofs: Record<string, unknown>[] = [],
  ) {
    const own = await this.ownInfraction();
    // Actual mounted protocol and all four admissibility stages; never set ADMITIDO in fixture SQL.
    const response = await request(app.getHttpServer())
      .post(`${PREFIX}/cases`)
      .set(this.headers('rait-secretary', RAIT_SECRETARY))
      .send({
        ait_id: own.ait,
        protocol_number: `S2-${randomUUID()}`,
        instance: 'defesa_previa',
        circuit: 1,
        intake_channel: 'portal',
        protocolled_at: '2026-09-11T13:00:00Z',
        unit_id: this.unit,
        documents: [],
        proofs,
      });
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const id = String(response.body.data.id);
    this.cases.push(id);
    const triage = await request(app.getHttpServer())
      .post(`${PREFIX}/cases/${id}/commands/triage`)
      .set(
        this.headers(
          'rait-analyst',
          this.actor,
          undefined,
          response.headers.etag,
        ),
      )
      .send({});
    expect(triage.status, JSON.stringify(triage.body)).toBe(200);
    let etag = triage.headers.etag;
    for (const criterion of [
      'legitimidade',
      'assinatura',
      'pedido_compativel',
    ]) {
      const saved = await request(app.getHttpServer())
        .post(`${PREFIX}/admissibility`)
        .set(this.headers('rait-analyst', this.actor, undefined, etag))
        .send({
          case_id: id,
          criterion,
          verdict: true,
          reason: 'Independent S2 human fixture check',
        });
      expect(saved.status, JSON.stringify(saved.body)).toBe(200);
      etag = saved.headers.etag;
    }
    const admitted = await request(app.getHttpServer())
      .post(`${PREFIX}/cases/${id}/commands/admit`)
      .set(this.headers('rait-analyst', this.actor, undefined, etag))
      .send({});
    expect(admitted.status, JSON.stringify(admitted.body)).toBe(200);
    expect(admitted.body.data.state).toBe('ADMITIDO');
    return (
      await this.owner.query<CaseRow>(
        'select id,state,version,instance from inf.rait_case where tenant_id=$1 and id=$2',
        [RAIT_TENANT, id],
      )
    ).rows[0]!;
  }
  async triaged(app: INestApplication) {
    const source = await this.ownInfraction();
    const late = (
      await this.owner.query<{ d: string }>(
        "select (due_on+1)::text d from inf.infraction_timer where infraction_id=$1 and timer_code='T-DEF'",
        [source.infraction],
      )
    ).rows;
    expect(late).toHaveLength(1);
    const r = await request(app.getHttpServer())
      .post(`${PREFIX}/cases`)
      .set(this.headers('rait-secretary', RAIT_SECRETARY))
      .send({
        ait_id: source.ait,
        protocol_number: 'S2-' + randomUUID(),
        instance: 'defesa_previa',
        circuit: 1,
        intake_channel: 'portal',
        protocolled_at: late[0]!.d + 'T13:00:00Z',
        unit_id: this.unit,
        documents: [],
        proofs: [],
      });
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    this.cases.push(r.body.data.id);
    const t = await request(app.getHttpServer())
      .post(`${PREFIX}/cases/${r.body.data.id}/commands/triage`)
      .set(this.headers('rait-analyst', this.actor, undefined, r.headers.etag))
      .send({});
    expect(t.status, JSON.stringify(t.body)).toBe(200);
    const verdict = await this.owner.query<{ verdict: boolean }>(
      "select verdict from inf.rait_admissibility where case_id=$1 and criterion='tempestividade'",
      [r.body.data.id],
    );
    expect(verdict.rows).toEqual([{ verdict: false }]);
    return (
      await this.owner.query<CaseRow>(
        'select id,state,version,instance from inf.rait_case where id=$1',
        [r.body.data.id],
      )
    ).rows[0]!;
  }
  readonly batchSources: { ait: string; infraction: string }[] = [];
  readonly batchCases: { id: string; etag: string }[] = [];
  async prepareBatchSources(count: number) {
    for (let i = 0; i < count; i++)
      this.batchSources.push(await this.ownInfraction());
  }
  async protocolBatch(app: INestApplication, start: number, end: number) {
    const next = await Promise.all(
      this.batchSources.slice(start, end).map(async (source) => {
        const r = await request(app.getHttpServer())
          .post(`${PREFIX}/cases`)
          .set(this.headers('rait-secretary', RAIT_SECRETARY))
          .send({
            ait_id: source.ait,
            protocol_number: 'S2-' + randomUUID(),
            instance: 'defesa_previa',
            circuit: 1,
            intake_channel: 'portal',
            protocolled_at: '2026-09-11T13:00:00Z',
            unit_id: this.unit,
            documents: [],
            proofs: [],
          });
        expect(r.status, JSON.stringify(r.body)).toBe(200);
        this.cases.push(r.body.data.id);
        return { id: r.body.data.id as string, etag: r.headers.etag as string };
      }),
    );
    this.batchCases.push(...next);
  }
  async transitionBatch(
    app: INestApplication,
    stage: string,
    start: number,
    end: number,
  ) {
    await Promise.all(
      this.batchCases.slice(start, end).map(async (c) => {
        const human = [
          'legitimidade',
          'assinatura',
          'pedido_compativel',
        ].includes(stage);
        const path = human
          ? `${PREFIX}/admissibility`
          : `${PREFIX}/cases/${c.id}/commands/${stage}`;
        const body = human
          ? {
              case_id: c.id,
              criterion: stage,
              verdict: true,
              reason: 'Independent batched S2 human fixture check',
            }
          : {};
        const r = await request(app.getHttpServer())
          .post(path)
          .set(this.headers('rait-analyst', this.actor, undefined, c.etag))
          .send(body);
        expect(r.status, JSON.stringify(r.body)).toBe(200);
        c.etag = r.headers.etag;
      }),
    );
  }
  async effects() {
    const result = await this.owner.query(
      `select
      (select coalesce(jsonb_agg(to_jsonb(c) order by c.id),'[]'::jsonb) from inf.rait_case c where c.id=any($2::uuid[])) cases,
      (select coalesce(jsonb_agg(to_jsonb(a) order by a.id),'[]'::jsonb) from inf.rait_assignment a where a.tenant_id=$1 and a.pool_id=$3) assignments,
      (select count(*)::int from inf.rait_case_event e where e.case_id=any($2::uuid[])) history,
      (select count(*)::int from audit.events where tenant_id=$1) audit,
      (select count(*)::int from integration.idempotency_keys where tenant_id=$1) ledger,
      (select count(*)::int from integration.outbox where tenant_id=$1) outbox,
      (select coalesce(jsonb_agg(to_jsonb(c) order by c.id),'[]'::jsonb) from inf.rait_clock c where c.case_id=any($2::uuid[])) clocks,
      (select count(*)::int from inf.rait_clock_alert a join inf.rait_clock c on c.id=a.clock_id where c.case_id=any($2::uuid[])) alerts`,
      [RAIT_TENANT, this.cases, this.pool],
    );
    return result.rows[0];
  }
  async forwardBusinessDay(raw: string) {
    let d = raw;
    for (let i = 0; i < 370; i++) {
      const ok = (
        await this.owner.query<{ business: boolean }>(
          `select extract(isodow from $1::date)<6 and not exists(select 1 from inf.rait_holiday where tenant_id=$2 and holiday_on=$1::date) business`,
          [d, RAIT_TENANT],
        )
      ).rows[0]!.business;
      if (ok) return d;
      d = (
        await this.owner.query<{ d: string }>('select ($1::date+1)::text d', [
          d,
        ])
      ).rows[0]!.d;
    }
    throw Error('Canonical fixture calendar cannot resolve business day');
  }
  async cloneRow(table: string, id: string, changes: Record<string, unknown>) {
    const allowed = new Set([
      'inf.ait_ait',
      'inf.infraction',
      'inf.infraction_timer',
    ]);
    if (!allowed.has(table)) throw Error('Unowned clone table');
    const next = String(changes.id ?? randomUUID());
    await this.owner.query(
      `insert into ${table} select (jsonb_populate_record(null::${table},to_jsonb(s)||$2::jsonb)).* from ${table} s where s.id=$1`,
      [id, JSON.stringify({ ...changes, id: next })],
    );
    return next;
  }
  async ownInfraction() {
    const ait = await this.cloneRow(
      'inf.ait_ait',
      '00000000-0000-7000-8000-0000f0000002',
      {
        ait_number: 'S2-' + randomUUID(),
        receipt_protocol: 'S2-' + randomUUID(),
        traffic_agency_id: this.agency,
        infraction_at: this.practiceOn + 'T12:00:00.000000Z',
        issued_at: this.practiceOn + 'T12:00:00.000000Z',
      },
    );
    const infraction = await this.cloneRow(
      'inf.infraction',
      '00000000-0000-7000-8000-0000d0000002',
      {
        ait_id: ait,
        committed_on: this.practiceOn,
        known_on: this.practiceOn,
        flagrant: true,
        version: 1,
        last_transition_id: null,
      },
    );
    const timers = await this.owner.query<{ id: string }>(
      'select id from inf.infraction_timer where tenant_id=$1 and infraction_id=$2',
      [RAIT_TENANT, '00000000-0000-7000-8000-0000d0000002'],
    );
    for (const t of timers.rows)
      await this.cloneRow('inf.infraction_timer', t.id, {
        infraction_id: infraction,
      });
    return { ait, infraction };
  }
  async executableParameters() {
    if (this.parameters.size) return;
    const catalogue = readFileSync(
      new URL(
        '../../../../docs/framework/arch/parameter-catalogue.md',
        import.meta.url,
      ),
      'utf8',
    );
    for (const code of ['A', 'B', 'C', 'D']) {
      const key = 'rait.ladder.' + code;
      const line = catalogue
        .split('\n')
        .find((l) => l.includes('`' + key + '`'));
      if (!line) throw Error('Missing canonical ladder row');
      const cell = line.split('|')[3]!.trim().replace(/^`|`$/g, '');
      const value = JSON.parse(cell) as Record<string, unknown>;
      const id = randomUUID();
      // Separate agency-scoped executable fixture version; canonical proposals remain untouched.
      await this.owner.query(
        `insert into ops.parameter(id,tenant_id,traffic_agency_id,scope,surface,key,value_json,value_type,status,source_pending,legal_readonly,decision_ref,legal_basis,reason,version,effective_from,changed_by)
        values($1,$2,$3,'agency','rait',$4,$5::jsonb,'json','vigente',false,false,'S2-TEST-ACTIVATION',$6,$7,1001,'2026-01-01',$8)`,
        [
          id,
          RAIT_TENANT,
          this.agency,
          key,
          JSON.stringify(value),
          String(value.sourceRef),
          syntheticSource,
          RAIT_SECRETARY,
        ],
      );
      const r = await this.admitReceipt('parameter', null, [
        'sql:ops.parameter:' + id,
      ]);
      this.parameters.set(code, { id, receipt: r });
    }
  }
  async prepareRisk(
    caseId: string,
    track: 180 | 360 = 360,
    options: {
      missing?: string;
      operational?: boolean;
      movementOn?: string;
      originalMissing?: boolean;
    } = {},
  ) {
    await this.executableParameters();
    const parent = (
      await this.owner.query<{ ait_id: string }>(
        'select ait_id from inf.rait_case where id=$1',
        [caseId],
      )
    ).rows[0]!;
    const infraction = (
      await this.owner.query<{ id: string }>(
        'select id from inf.infraction where tenant_id=$1 and ait_id=$2',
        [RAIT_TENANT, parent.ait_id],
      )
    ).rows[0]!.id;
    const caseRef = 'sql:inf.rait_case:' + caseId,
      aitRef = 'sql:inf.ait_ait:' + parent.ait_id,
      infRef = 'sql:inf.infraction:' + infraction;
    const base = [caseRef, aitRef, infRef];
    const days = (
      await this.owner.query<{ d180: string; d360: string }>(
        'select ($1::date+180)::text d180,($1::date+360)::text d360',
        [this.practiceOn],
      )
    ).rows[0]!;
    // Raw180 falls Saturday; fixed canonical fixture calendar rolls to Monday.
    const aDue = await this.forwardBusinessDay(
      track === 180 ? days.d180 : days.d360,
    );
    const event = (
      await this.owner.query<{
        id: string;
        movement_on: string;
        occurred_at: string;
      }>(
        `select id,(occurred_at at time zone 'America/Manaus')::date::text movement_on,to_char(occurred_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') occurred_at from inf.rait_case_event where tenant_id=$1 and case_id=$2 and to_state='ADMITIDO' order by occurred_at desc,id limit 1`,
        [RAIT_TENANT, caseId],
      )
    ).rows[0];
    const currentMovement = (
      await this.owner.query<{
        id: string;
        movement_on: string;
        occurred_at: string;
      }>(
        `select id,(occurred_at at time zone 'America/Manaus')::date::text movement_on,to_char(occurred_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') occurred_at from inf.rait_case_event where tenant_id=$1 and case_id=$2 and to_state in ('ADMITIDO','DISTRIBUIDO','TRIAGEM_ADMISSIBILIDADE') order by occurred_at desc,id limit 1`,
        [RAIT_TENANT, caseId],
      )
    ).rows[0];
    const movement =
      currentMovement?.movement_on ?? options.movementOn ?? '2026-09-11';
    const cDue = (
      await this.owner.query<{ d: string }>(
        "select ($1::date+interval '36 months')::date::text d",
        [movement],
      )
    ).rows[0]!.d;
    const dStart = this.practiceOn;
    const dRaw = (
      await this.owner.query<{ d: string }>(
        "select ($1::date+interval '60 months')::date::text d",
        [dStart],
      )
    ).rows[0]!.d;
    const dDue = await this.forwardBusinessDay(dRaw); // Five-year raw ceiling June15 is Sunday; calendar forward.
    const eventRefs =
      track === 180 && currentMovement
        ? ['sql:inf.rait_case_event:' + currentMovement.id]
        : event
          ? ['sql:inf.rait_case_event:' + event.id]
          : [];
    const audit = (
      await this.owner.query<{ event_id: string; occurred_at: string }>(
        `select event_id::text,to_char(occurred_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') occurred_at from audit.events where tenant_id=$1 and entity_id=$2 and action=$3 order by event_id desc limit 1`,
        [
          RAIT_TENANT,
          caseId,
          track === 180 ? 'INF_RAIT_CASE_TRIAGE' : 'INF_RAIT_CASE_ADMIT',
        ],
      )
    ).rows[0];
    const auditRefs = audit
      ? ['sql:audit.events:' + audit.event_id + '@' + audit.occurred_at]
      : [];
    const temporal: Record<
      string,
      { code: string; start: string; raw: string; due: string }
    > = {
      A: {
        code: 'T-DEC',
        start: this.practiceOn,
        raw: track === 180 ? days.d180 : days.d360,
        due: aDue,
      },
      C: {
        code: 'T-PAR-3A',
        start: movement,
        raw: cDue,
        due: await this.forwardBusinessDay(cDue),
      },
      D: { code: 'T-PRESC-5A', start: dStart, raw: dRaw, due: dDue },
    };
    const criterion = (
      await this.owner.query<{ id: string }>(
        "select id from inf.rait_admissibility where tenant_id=$1 and case_id=$2 and criterion='tempestividade'",
        [RAIT_TENANT, caseId],
      )
    ).rows[0];
    const extensionRefs: string[] = [];
    if (track === 360) {
      if (!criterion || !event || !audit)
        throw Error(
          '360 fixture requires actual HTTP admission and timely verdict',
        );
      const extension = randomUUID();
      // Existing canonical transition7, explicitly synthetic compatibility input, not invented audit action.
      await this.owner.query(
        `insert into inf.infraction_event(id,tenant_id,infraction_id,transition_id,rule_ref,from_state,to_state,trigger_kind,trigger_code,event_code,occurred_at,actor_id,actor_kind,payload)
        values($1,$2,$3,7,6,'NOTIFICADO_AUTUACAO','DEFESA_EM_JULGAMENTO','evento','RAIT_CASO_PROTOCOLADO(defesa_previa)','INFRACAO_ESTADO_ALTERADO','2026-09-11T12:00:00Z',$4,'user',$5::jsonb)`,
        [
          extension,
          RAIT_TENANT,
          infraction,
          RAIT_SECRETARY,
          JSON.stringify({
            caseId,
            track: 360,
            timerCode: 'T-DEC',
            oldDueOn: await this.forwardBusinessDay(days.d180),
            newDueOn: aDue,
            admissionRef: eventRefs[0],
            qualification: syntheticSource,
          }),
        ],
      );
      await this.owner.query(
        "update inf.infraction set state='DEFESA_EM_JULGAMENTO',last_transition_id=7 where id=$1",
        [infraction],
      );
      extensionRefs.push('sql:inf.infraction_event:' + extension);
    }
    const records = new Map<
      string,
      { timer: string; clock: string; refs: string[] }
    >();
    for (const code of ['A', 'C', 'D']) {
      const t = temporal[code]!;
      await this.owner.query(
        'delete from inf.infraction_timer where tenant_id=$1 and infraction_id=$2 and timer_code=$3',
        [RAIT_TENANT, infraction, t.code],
      );
      const timer = randomUUID(),
        clock = randomUUID();
      await this.owner.query(
        `insert into inf.infraction_timer(id,tenant_id,infraction_id,timer_code,instance,start_basis,started_on,raw_due_on,due_on,ceiling_on,business_days,status,suspended_days,extension_count,legal_basis)
        values($1,$2,$3,$4,null,$5,$6,$7,$8,$8,false,'armado',0,$10,$9)`,
        [
          timer,
          RAIT_TENANT,
          infraction,
          t.code,
          code === 'A'
            ? 'cometimento; 360 dias se defesa tempestiva'
            : code === 'C'
              ? 'último ato registrado no caso'
              : 'cometimento/cessação',
          t.start,
          t.raw,
          t.due,
          code === 'A'
            ? 'RN-RAIT-114'
            : code === 'C'
              ? 'RN-RAIT-113; WF-RAIT-002#4.2'
              : 'RN-RAIT-113; DT-030',
          code === 'A' && track === 360 ? 1 : 0,
        ],
      );
      await this.owner.query(
        `insert into inf.rait_clock(id,tenant_id,case_id,clock_code,started_on,ceiling_on,last_reset_at,legal_basis) values($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          clock,
          RAIT_TENANT,
          caseId,
          code,
          t.start,
          t.due,
          code === 'C' ? (currentMovement?.occurred_at ?? null) : null,
          code === 'A' ? 'RN-RAIT-114' : 'RN-RAIT-113',
        ],
      );
      const refs = [
        ...base,
        'sql:inf.rait_clock:' + clock,
        'sql:inf.infraction_timer:' + timer,
      ];
      records.set(code, { timer, clock, refs });
      if (options.missing !== code)
        await this.admitReceipt('timer', caseId, refs);
    }
    await this.admitReceipt('applicability', caseId, base);
    const a = records.get('A')!;
    if (options.missing !== 'track')
      await this.admitReceipt('track', caseId, [
        ...a.refs,
        ...(criterion ? ['sql:inf.rait_admissibility:' + criterion.id] : []),
        ...eventRefs,
        ...auditRefs,
        ...extensionRefs,
      ]);
    const c = records.get('C')!;
    if (!currentMovement)
      throw Error(
        'C reset fixture requires an actual qualified movement event',
      );
    // Sourced current movement is admission; capture its actual instant, not an invented reset event.
    const policyRefs = [
      ...base,
      'sql:inf.rait_clock:' + c.clock,
      'sql:inf.infraction_timer:' + c.timer,
      'sql:inf.rait_case_event:' + currentMovement.id,
      ...auditRefs,
    ];
    // Existing receipt inventory is the sole custody store. This is an isolated-test admission, never legal/production approval.
    const decision = await this.admitReceipt(
      'movement',
      caseId,
      policyRefs,
      [],
      [],
      randomUUID(),
      isolatedPolicyPurpose,
    );
    const anchor = provenanceFormat.policyCanonicalSources.find(
      (x) =>
        x.sourceRef ===
        'docs/framework/product/domains/inf/rait/workflows/WF-RAIT-002.md#4.2',
    )!;
    const policy = await this.admitReceipt(
      'movement',
      caseId,
      policyRefs,
      [],
      [{ ...anchor, decisionRef: decision.core.receiptId }],
    );
    if (options.missing !== 'movement')
      await this.admitReceipt(
        'movement',
        caseId,
        [
          caseRef,
          infRef,
          'sql:inf.rait_clock:' + c.clock,
          'sql:inf.infraction_timer:' + c.timer,
          'sql:inf.rait_case_event:' + currentMovement!.id,
          ...auditRefs,
        ],
        [policy.digest],
      );
    const d = records.get('D')!;
    // Complete actual history inventory is bound by the independent ORIGINAL disposition.
    const events = await this.owner.query<{ id: string }>(
      'select id from inf.rait_case_event where tenant_id=$1 and case_id=$2 order by id',
      [RAIT_TENANT, caseId],
    );
    const history = events.rows.map((e) => 'sql:inf.rait_case_event:' + e.id);
    if (!options.originalMissing && options.missing !== 'interruption')
      await this.admitReceipt('interruption', caseId, [
        ...d.refs,
        ...history,
        ...auditRefs,
        ...extensionRefs,
      ]);
    return { records, infraction, ait: parent.ait_id, caseId, track };
  }
  async observeStages(caseId: string) {
    const name = 's2_observe_' + randomUUID().replaceAll('-', '');
    const captured: { from: string; state: string; version: number }[] = [];
    const onNotification = (message: { channel: string; payload?: string }) => {
      if (message.channel === name && message.payload)
        captured.push(JSON.parse(message.payload));
    };
    this.owner.on('notification', onNotification);
    await this.owner.query(`listen ${name}`);
    await this.owner.query(
      `create function inf.${name}() returns trigger language plpgsql as $$ begin perform pg_notify('${name}',json_build_object('from',OLD.state,'state',NEW.state,'version',NEW.version)::text); return NEW; end $$`,
    );
    await this.owner.query(
      `create trigger ${name} after update of state on inf.rait_case for each row when (NEW.id='${caseId}'::uuid and OLD.state is distinct from NEW.state) execute function inf.${name}()`,
    );
    return {
      read: async (count: number) => {
        const end = Date.now() + 5000;
        while (captured.length < count && Date.now() < end)
          await new Promise((r) => setTimeout(r, 10));
        return captured;
      },
      close: async () => {
        await this.owner.query(
          `drop trigger if exists ${name} on inf.rait_case`,
        );
        await this.owner.query(`drop function if exists inf.${name}()`);
        await this.owner.query(`unlisten ${name}`);
        this.owner.off('notification', onNotification);
      },
    };
  }
  async operationalIncidents(
    caseId: string,
    records: Map<string, { timer: string; clock: string; refs: string[] }>,
  ) {
    const sources: {
      incident: string;
      alert: string;
      clock: string;
      ref: string;
      receipt: QualifiedReceipt;
    }[] = [];
    for (const record of records.values()) {
      const due = await this.owner.query<{ passed: boolean }>(
        "select ceiling_on <= (clock_timestamp() at time zone 'America/Manaus')::date passed from inf.rait_clock where id=$1",
        [record.clock],
      );
      if (!due.rows[0]!.passed) continue;
      const ref = (
        await this.owner.query<{ ref: string }>(
          "select 'INC-2026-'||lpad((coalesce(max(substring(incident_ref from 10)::int),0)+1)::text,4,'0') ref from inf.rait_incident where tenant_id=$1 and incident_ref like 'INC-2026-%'",
          [RAIT_TENANT],
        )
      ).rows[0]!.ref;
      const incident = randomUUID(),
        alert = randomUUID();
      await this.owner.query(
        'insert into inf.rait_incident(id,tenant_id,incident_ref,clock_id,case_id,opened_by) values($1,$2,$3,$4,$5,$6)',
        [incident, RAIT_TENANT, ref, record.clock, caseId, RAIT_SECRETARY],
      );
      await this.owner.query(
        "insert into inf.rait_clock_alert(id,tenant_id,clock_id,level,notified_role,incident_ref) values($1,$2,$3,'PRESCRITO_OPERACIONAL','rait-coordinator',$4)",
        [alert, RAIT_TENANT, record.clock, ref],
      );
      const receipt = await this.admitReceipt('incident', caseId, [
        'sql:inf.rait_case:' + caseId,
        'sql:inf.rait_clock:' + record.clock,
        'sql:inf.rait_clock_alert:' + alert,
        'sql:inf.rait_incident:' + incident,
      ]);
      sources.push({ incident, alert, clock: record.clock, ref, receipt });
    }
    expect(sources).toHaveLength(2); // Old A and D; current real C movement remains within its36-month ceiling.
    return sources;
  }
  async foreignIncidentSource(sourceCase: string) {
    // R8: separate genuine tenant/context/source lineage. Never move A rows to B.
    const client = new pg.Client({
      connectionString: process.env.STYNX_OWNER_DATABASE_URL,
    });
    const tenantId = randomUUID(),
      caseId = randomUUID(),
      ait = randomUUID(),
      actor = randomUUID(),
      clock = randomUUID(),
      alert = randomUUID(),
      incident = randomUUID();
    await client.connect();
    try {
      await client.query('begin');
      await client.query("select set_config('app.tenant_id',$1,true)", [
        tenantId,
      ]);
      await client.query(
        `insert into auth.tenants(id,slug,name,short_name,cnpj,timezone,contact_email,contact_phone,state,is_active,suspended_reason,archived_at)
        select $1::uuid,$1::text,'S2 isolated foreign tenant',short_name,null,timezone,contact_email,contact_phone,state,is_active,suspended_reason,archived_at from auth.tenants where id=$2`,
        [tenantId, RAIT_TENANT],
      );
      await client.query(
        "insert into auth.users(id,tenant_id,email,display_name) values($1::uuid,$2::uuid,$1::text||'@s2.invalid','S2 foreign fixture reviewer')",
        [actor, tenantId],
      );
      const pool = randomUUID();
      await client.query(
        'insert into auth.memberships(tenant_id,user_id) values($1,$2)',
        [tenantId, actor],
      );
      await client.query(
        "insert into inf.rait_pool(id,tenant_id,name,instance,circuit,strategy) values($1,$2,'S2 foreign source secretary pool','defesa_previa',1,'pull')",
        [pool, tenantId],
      );
      await client.query(
        "insert into inf.rait_pool_member(id,tenant_id,pool_id,person_id,member_role,status) values($1,$2,$3,$4,'secretaria','ATIVO')",
        [randomUUID(), tenantId, pool, actor],
      );
      await client.query(
        `insert into inf.ait_ait select (jsonb_populate_record(null::inf.ait_ait,to_jsonb(a)||jsonb_build_object('id',$1::text,'tenant_id',$2::text,'ait_number',$1::text,'receipt_protocol',$1::text))).* from inf.ait_ait a join inf.rait_case c on c.ait_id=a.id where c.id=$3`,
        [ait, tenantId, sourceCase],
      );
      await client.query(
        `insert into ops.parameter select (jsonb_populate_record(null::ops.parameter,to_jsonb(p)||jsonb_build_object('id',$1::text,'tenant_id',$2::text,'changed_by',$3::text))).* from ops.parameter p join auth.tenants t on t.id=p.tenant_id where p.tenant_id=$4 and p.key='rait.priority.legal_bases' and p.traffic_agency_id is null and p.status='vigente' and not p.source_pending and p.effective_from <= (clock_timestamp() at time zone t.timezone)::date and (p.effective_to is null or p.effective_to >= (clock_timestamp() at time zone t.timezone)::date)`,
        [randomUUID(), tenantId, actor, RAIT_TENANT],
      );
      await client.query(
        `insert into inf.rait_case(id,tenant_id,ait_id,protocol_number,instance,circuit,state,intake_channel,protocolled_at)
        select $1::uuid,$2::uuid,$3::uuid,$1::text,instance,circuit,'PROTOCOLADO',intake_channel,clock_timestamp() from inf.rait_case where id=$4`,
        [caseId, tenantId, ait, sourceCase],
      );
      await client.query(
        'select inf.rait_record_initial_priority($1,$2,clock_timestamp(),$3::jsonb)',
        [caseId, actor, '[]'],
      );
      const ref = (
        await this.owner.query<{ ref: string }>(
          "select 'INC-2026-'||lpad((coalesce(max(substring(incident_ref from 10)::int),0)+1)::text,4,'0') ref from inf.rait_incident where tenant_id=$1 and incident_ref like 'INC-2026-%'",
          [RAIT_TENANT],
        )
      ).rows[0]!.ref;
      await client.query(
        `insert into inf.rait_clock select (jsonb_populate_record(null::inf.rait_clock,to_jsonb(c)||jsonb_build_object('id',$1::text,'tenant_id',$2::text,'case_id',$3::text))).* from inf.rait_clock c where c.tenant_id=$4 and c.case_id=$5 and c.clock_code='A'`,
        [clock, tenantId, caseId, RAIT_TENANT, sourceCase],
      );
      await client.query(
        'insert into inf.rait_incident(id,tenant_id,incident_ref,clock_id,case_id,opened_by) values($1,$2,$3,$4,$5,$6)',
        [incident, tenantId, ref, clock, caseId, actor],
      );
      await client.query(
        "insert into inf.rait_clock_alert(id,tenant_id,clock_id,level,notified_role,incident_ref) values($1,$2,$3,'PRESCRITO_OPERACIONAL','rait-coordinator',$4)",
        [alert, tenantId, clock, ref],
      );
      await client.query('set constraints all immediate');
      await client.query('commit');
      await client.query("select set_config('app.tenant_id',$1,false)", [
        tenantId,
      ]);
      await client.query('set role role_app_backend');
      expect(
        (
          await client.query(
            "select current_role::text role,current_setting('app.tenant_id',true) tenant",
          )
        ).rows,
      ).toEqual([{ role: 'role_app_backend', tenant: tenantId }]);
      expect(
        (
          await client.query(
            'select i.tenant_id,i.case_id,c.ait_id,a.tenant_id ait_tenant from inf.rait_incident i join inf.rait_case c on c.id=i.case_id and c.tenant_id=i.tenant_id join inf.ait_ait a on a.id=c.ait_id and a.tenant_id=c.tenant_id where i.id=$1',
            [incident],
          )
        ).rows,
      ).toEqual([
        {
          tenant_id: tenantId,
          case_id: caseId,
          ait_id: ait,
          ait_tenant: tenantId,
        },
      ]);
      const rows = await readSourceRows(client, [
        'sql:inf.rait_case:' + caseId,
        'sql:inf.rait_clock:' + clock,
        'sql:inf.rait_clock_alert:' + alert,
        'sql:inf.rait_incident:' + incident,
      ]);
      expect(rows).toHaveLength(4);
      const core: ReceiptCore = {
        schemaVersion: 1,
        namespace: 'rait-risk-receipt-v1',
        receiptId: randomUUID(),
        kind: 'incident',
        tenantId,
        caseId,
        bindings: rows.map((row) => ({
          sourceRef: row.sourceRef,
          rowRevision: canonicalRevision(row),
        })),
        authorization: {
          authorityRef: syntheticSource,
          actorId: actor,
          decisionRef: 'R8 isolated foreign-tenant fixture only',
          recordedAt: '2026-10-19T00:00:00.000000Z',
        },
        dependencies: [],
        policySources: [],
      };
      const receipt: QualifiedReceipt = {
        core,
        digest: canonicalRevision(core),
        admittedOrigin: 'owner-approved-isolated-inspector-fixture',
      };
      this.receipts.push(receipt);
      return { tenantId, caseId, incident, ref, receipt };
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      await client.end();
    }
  }
  async historicallyDistributed(
    caseId: string,
    classification:
      | 'qualified_unassigned'
      | 'hold'
      | 'preserve_assigned' = 'qualified_unassigned',
  ) {
    const schema = (
      await this.owner.query<{ table: string | null }>(
        "select to_regclass('inf.rait_claim_legacy_qualification')::text table",
      )
    ).rows[0]!.table;
    if (!schema)
      throw Error(
        'S2_SCHEMA_PENDING: internal legacy qualification entity absent; not protection evidence',
      );
    const admission = (
      await this.owner.query<{ id: string }>(
        "select id from inf.rait_case_event where tenant_id=$1 and case_id=$2 and to_state='ADMITIDO' order by occurred_at desc,id limit 1",
        [RAIT_TENANT, caseId],
      )
    ).rows[0];
    if (!admission) throw Error('Legacy needs actual HTTP admission history');
    const distribution = randomUUID(),
      receiptId: string = randomUUID(),
      qualification = randomUUID(),
      assignment = classification === 'preserve_assigned' ? randomUUID() : null;
    await this.owner.query('begin');
    try {
      // Explicit synthetic historical import, not a mounted distribution or invented audit writer.
      await this.owner.query(
        `insert into inf.rait_case_event(id,tenant_id,case_id,event_type,from_state,to_state,actor_id,payload)
        values($1,$2,$3,'RAIT_CASO_ESTADO_ALTERADO','ADMITIDO','DISTRIBUIDO',$4,$5::jsonb)`,
        [
          distribution,
          RAIT_TENANT,
          caseId,
          RAIT_SECRETARY,
          JSON.stringify({
            type: 'rait.case.changed',
            aggregateId: caseId,
            caseId,
            fromState: 'ADMITIDO',
            toState: 'DISTRIBUIDO',
            instance: 'defesa_previa',
            poolId: this.pool,
            qualification: syntheticSource,
          }),
        ],
      );
      await this.owner.query(
        `update inf.rait_case set state='DISTRIBUIDO',version=version+1,last_movement_at=(select occurred_at from inf.rait_case_event where id=$2) where id=$1`,
        [caseId, distribution],
      );
      const binding = (
        await this.owner.query<{ id: string }>(
          'select id from inf.rait_case_pool_scope where tenant_id=$1 and case_id=$2 and pool_id=$3 and active',
          [RAIT_TENANT, caseId, this.pool],
        )
      ).rows[0]!;
      if (assignment)
        await this.owner.query(
          'insert into inf.rait_assignment(id,tenant_id,case_id,pool_id,member_id,assigned_by,active) values($1,$2,$3,$4,$5,$6,true)',
          [
            assignment,
            RAIT_TENANT,
            caseId,
            this.pool,
            this.member,
            RAIT_SECRETARY,
          ],
        );
      await this.owner.query(
        `insert into inf.rait_claim_legacy_qualification(id,tenant_id,case_id,observed_version,observed_state,assignment_status,classification,revision,admission_ref,distribution_ref,pool_scope_ref,reason,reviewer_id,authorization_ref,observed_at,assignment_ref)
        select $1,$2,$3,c.version,'DISTRIBUIDO',$11,$4,1,$5,$6,$7,$8,$9,$10,clock_timestamp(),$12 from inf.rait_case c where c.id=$3`,
        [
          qualification,
          RAIT_TENANT,
          caseId,
          classification,
          'sql:inf.rait_case_event:' + admission.id,
          'sql:inf.rait_case_event:' + distribution,
          'sql:inf.rait_case_pool_scope:' + binding.id,
          syntheticSource,
          RAIT_SECRETARY,
          'receipt:' + receiptId,
          assignment ? 'assigned' : 'unassigned',
          assignment ? 'sql:inf.rait_assignment:' + assignment : null,
        ],
      );
      await this.owner.query('commit');
    } catch (e) {
      await this.owner.query('rollback');
      throw e;
    }
    return { qualification, receiptId, admission: admission.id, distribution };
  }
  async qualifyReleasedLegacySource(
    caseId: string,
    previous: {
      qualification: string;
      receiptId: string;
      admission: string;
      distribution: string;
    },
    writer: pg.Client,
  ) {
    const qualification = randomUUID(),
      receiptId = randomUUID();
    expect(
      (
        await writer.query(
          'select id from inf.rait_assignment where tenant_id=$1 and case_id=$2 and active',
          [RAIT_TENANT, caseId],
        )
      ).rows,
    ).toEqual([]);
    const inserted = await writer.query(
      `insert into inf.rait_claim_legacy_qualification(id,tenant_id,case_id,observed_version,observed_state,assignment_status,classification,revision,admission_ref,distribution_ref,pool_scope_ref,reason,reviewer_id,authorization_ref,observed_at,assignment_ref)
      select $1,q.tenant_id,q.case_id,c.version,c.state,'unassigned','qualified_unassigned',q.revision+1,q.admission_ref,q.distribution_ref,q.pool_scope_ref,$2,q.reviewer_id,$3,clock_timestamp(),null
      from inf.rait_claim_legacy_qualification q join inf.rait_case c on c.tenant_id=q.tenant_id and c.id=q.case_id
      where q.id=$4 and q.tenant_id=$5 and q.case_id=$6 and q.classification='preserve_assigned' and c.state='DISTRIBUIDO' and c.version=q.observed_version returning id,classification,assignment_status`,
      [
        qualification,
        syntheticSource +
          '; R10 independent current review after actual assignment release',
        'receipt:' + receiptId,
        previous.qualification,
        RAIT_TENANT,
        caseId,
      ],
    );
    expect(inserted.rows).toEqual([
      {
        id: qualification,
        classification: 'qualified_unassigned',
        assignment_status: 'unassigned',
      },
    ]);
    return {
      qualification,
      receiptId,
      admission: previous.admission,
      distribution: previous.distribution,
    };
  }
  async qualifyLegacy(
    caseId: string,
    source: {
      qualification: string;
      receiptId: string;
      admission: string;
      distribution: string;
    },
  ) {
    const binding = (
      await this.owner.query<{ id: string }>(
        'select id from inf.rait_case_pool_scope where case_id=$1 and pool_id=$2 and active',
        [caseId, this.pool],
      )
    ).rows[0]!;
    const audit = (
      await this.owner.query<{ event_id: string; at: string }>(
        `select event_id::text,to_char(occurred_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') at from audit.events where tenant_id=$1 and entity_id=$2 and action='INF_RAIT_CASE_ADMIT' order by event_id desc limit 1`,
        [RAIT_TENANT, caseId],
      )
    ).rows[0]!;
    const assignments = (
      await this.owner.query<{ id: string }>(
        'select id from inf.rait_assignment where tenant_id=$1 and case_id=$2 and active order by id',
        [RAIT_TENANT, caseId],
      )
    ).rows.map((r) => 'sql:inf.rait_assignment:' + r.id);
    return this.admitReceipt(
      'legacy',
      caseId,
      [
        'sql:inf.rait_case:' + caseId,
        'sql:inf.rait_claim_legacy_qualification:' + source.qualification,
        'sql:auth.users:' + RAIT_SECRETARY,
        'sql:inf.rait_case_event:' + source.admission,
        'sql:inf.rait_case_event:' + source.distribution,
        'sql:inf.rait_case_pool_scope:' + binding.id,
        'sql:inf.rait_pool:' + this.pool,
        ...assignments,
        'sql:audit.events:' + audit.event_id + '@' + audit.at,
      ],
      [],
      [],
      source.receiptId,
    );
  }
  /** Independently revalidate preserved C policy custody/current rows before reuse. */
  async verifiedUnchangedPolicyDependencies(): Promise<Map<string, string>> {
    const client = new pg.Client({
      connectionString: process.env.STYNX_APP_DATABASE_URL,
    });
    await client.connect();
    const preserved = new Map<string, string>();
    try {
      await client.query('begin');
      await client.query('set local role role_app_backend');
      await client.query("select set_config('app.tenant_id',$1,true)", [
        RAIT_TENANT,
      ]);
      for (const receipt of this.receipts.filter(
        (r) =>
          r.core.policySources.length && !this.revokedReceipts.has(r.digest),
      )) {
        const sourceRefs = receipt.core.bindings.map((b) => b.sourceRef);
        const rows = await readSourceRows(client, sourceRefs);
        const policySources = receipt.core.policySources.map(
          ({ sourceRef, sourceRevision }) => ({ sourceRef, sourceRevision }),
        );
        const req: PolicyRequest = {
          purpose: 'C_USEFUL_MOVEMENT_POLICY',
          tenantId: RAIT_TENANT,
          caseId: receipt.core.caseId!,
          sourceRefs,
          policySources,
          contentRevision: canonicalRevision({
            schemaVersion: 1,
            namespace: 'rait-risk-policy-request-v1',
            purpose: 'C_USEFUL_MOVEMENT_POLICY',
            tenantId: RAIT_TENANT,
            caseId: receipt.core.caseId,
            rows,
            dependencies: [],
            policySources,
          }),
        };
        const result = (await this.qualifyPolicy(client, req)) as {
          status: string;
          receiptDigest?: string;
        };
        expect(
          result.status,
          'preserved dependency needs independent current SQL/custody verification',
        ).toBe('qualified');
        expect(result.receiptDigest).toBe(receipt.digest);
        preserved.set(receipt.digest, receipt.digest);
      }
      return preserved;
    } finally {
      await client.query('rollback');
      await client.end();
    }
  }
  /** R17 additive synthetic rejected reviews; never UPDATE immutable history. */
  async negativeLegacyReview(
    caseId: string,
    previousId: string,
    overrides: {
      admission_ref?: string;
      pool_scope_ref?: string;
      observed_state?: string;
    },
  ) {
    const id = randomUUID(),
      receiptId = randomUUID();
    await this.owner.query(
      `insert into inf.rait_claim_legacy_qualification(id,tenant_id,case_id,observed_version,observed_state,assignment_status,classification,revision,admission_ref,distribution_ref,pool_scope_ref,reason,reviewer_id,authorization_ref,observed_at,assignment_ref)
      select $1,tenant_id,case_id,observed_version,coalesce($3,observed_state),assignment_status,case when $3::text is null then classification else 'hold' end,revision+1,coalesce($4,admission_ref),distribution_ref,coalesce($5,pool_scope_ref),$6,reviewer_id,$7,clock_timestamp(),assignment_ref from inf.rait_claim_legacy_qualification where id=$2 and case_id=$8`,
      [
        id,
        previousId,
        overrides.observed_state ?? null,
        overrides.admission_ref ?? null,
        overrides.pool_scope_ref ?? null,
        syntheticSource +
          '; R17 isolated negative review, not production authorization',
        'receipt:' + receiptId,
        caseId,
      ],
    );
    const q = (
      await this.owner.query<Record<string, unknown>>(
        'select * from inf.rait_claim_legacy_qualification where id=$1',
        [id],
      )
    ).rows[0]!;
    expect(q.case_id).toBe(caseId);
    const audit = (
      await this.owner.query<{ event_id: string; at: string }>(
        `select event_id::text,to_char(occurred_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') at from audit.events where tenant_id=$1 and entity_id=$2 and action='INF_RAIT_CASE_ADMIT' order by event_id desc limit 1`,
        [RAIT_TENANT, caseId],
      )
    ).rows[0]!;
    const refs = [
      'sql:inf.rait_case:' + caseId,
      'sql:inf.rait_claim_legacy_qualification:' + id,
      'sql:auth.users:' + q.reviewer_id,
      'sql:inf.rait_pool:' + this.pool,
      ...[
        'admission_ref',
        'distribution_ref',
        'pool_scope_ref',
        'assignment_ref',
      ].flatMap((k) => (q[k] ? [String(q[k])] : [])),
      'sql:audit.events:' + audit.event_id + '@' + audit.at,
    ];
    const receipt = await this.admitReceipt(
      'legacy',
      caseId,
      refs,
      [],
      [],
      receiptId,
    );
    return { id, receipt };
  }
  async admitReceipt(
    kind: string,
    caseId: string | null,
    sourceRefs: string[],
    dependencies: string[] = [],
    policySources: ReceiptCore['policySources'] = [],
    receiptId: string = randomUUID(),
    authorityDecision = 'P4-02-S2 Owner-approved isolated Inspector source qualification',
  ) {
    const rows = await readSourceRows(this.owner, sourceRefs);
    const core: ReceiptCore = {
      schemaVersion: 1,
      namespace: 'rait-risk-receipt-v1',
      receiptId,
      kind,
      tenantId: RAIT_TENANT,
      caseId,
      bindings: rows.map((row) => ({
        sourceRef: row.sourceRef,
        rowRevision: canonicalRevision(row),
      })),
      authorization: {
        authorityRef: syntheticSource,
        actorId: RAIT_SECRETARY,
        decisionRef: authorityDecision,
        recordedAt: '2026-10-19T00:00:00.000000Z',
      },
      dependencies: [...dependencies].sort(),
      policySources: [...policySources].sort((a, b) =>
        a.sourceRef < b.sourceRef ? -1 : a.sourceRef > b.sourceRef ? 1 : 0,
      ),
    };
    const receipt: QualifiedReceipt = {
      core,
      digest: canonicalRevision(core),
      admittedOrigin: 'owner-approved-isolated-inspector-fixture',
    };
    this.receipts.push(receipt);
    return receipt;
  }
  async qualify(
    tx: Sql,
    req: ProvenanceRequest,
  ): Promise<{
    status: 'qualified' | 'missing' | 'ambiguous';
    sourceVersions: readonly string[];
  }> {
    return this.observe(req.kind, req.caseId, 0, async () => {
      this.provenanceChecks++;
      const identity = (
        await tx.query<{ role: string; tenant: string }>(
          "select current_role::text role,current_setting('app.tenant_id',true) tenant",
        )
      ).rows[0]!;
      expect(identity).toEqual({
        role: 'role_app_backend',
        tenant: RAIT_TENANT,
      });
      this.qualifiedBackendPids.add(
        (await tx.query<{ pid: number }>('select pg_backend_pid() pid'))
          .rows[0]!.pid,
      );
      const missing = { status: 'missing' as const, sourceVersions: [] };
      if (
        req.tenantId !== RAIT_TENANT ||
        (req.kind === 'movement' && req.sourceRefs.length === 0)
      )
        return missing;
      const refs = [...req.sourceRefs].sort();
      const matches = this.receipts.filter(
        (r) =>
          r.core.kind === req.kind &&
          (r.core.caseId === req.caseId ||
            (r.core.kind === 'parameter' && r.core.caseId === null)) &&
          canonicalBytes(r.core.bindings.map((b) => b.sourceRef)) ===
            canonicalBytes(refs),
      );
      const valid: QualifiedReceipt[] = [];
      const verify = async (
        r: QualifiedReceipt,
        seen: Set<string>,
      ): Promise<boolean> => {
        return this.observe(
          r.core.kind,
          r.core.caseId,
          seen.size + 1,
          async () => {
            if (
              seen.has(r.digest) ||
              this.revokedReceipts.has(r.core.receiptId) ||
              this.revokedReceipts.has(r.digest) ||
              r.admittedOrigin !==
                'owner-approved-isolated-inspector-fixture' ||
              canonicalRevision(r.core) !== r.digest
            )
              return false;
            seen.add(r.digest);
            const current = await readSourceRows(
              tx,
              r.core.bindings.map((b) => b.sourceRef),
            );
            if (
              canonicalBytes(
                current.map((row) => ({
                  sourceRef: row.sourceRef,
                  rowRevision: canonicalRevision(row),
                })),
              ) !== canonicalBytes(r.core.bindings)
            )
              return false;
            for (const d of r.core.dependencies) {
              const dep = this.receipts.filter((x) => x.digest === d);
              if (dep.length !== 1 || !(await verify(dep[0]!, new Set(seen))))
                return false;
            }
            for (const p of r.core.policySources) {
              const fixed = provenanceFormat.policyCanonicalSources.find(
                (s) => s.sourceRef === p.sourceRef,
              );
              if (!fixed || fixed.sourceRevision !== p.sourceRevision)
                return false;
              const decisions = this.receipts.filter(
                (x) => x.core.receiptId === p.decisionRef,
              );
              if (decisions.length !== 1) return false;
              const decision = decisions[0]!;
              if (
                decision.core.authorization.decisionRef !==
                  isolatedPolicyPurpose ||
                decision.core.caseId !== r.core.caseId ||
                decision.core.tenantId !== r.core.tenantId ||
                decision.core.dependencies.length !== 0 ||
                decision.core.policySources.length !== 0 ||
                canonicalBytes(decision.core.bindings) !==
                  canonicalBytes(r.core.bindings) ||
                !(await verify(decision, new Set(seen)))
              )
                return false;
              const path = p.sourceRef.split('#')[0]!;
              const bytes = readFileSync(
                new URL('../../../../' + path, import.meta.url),
              );
              if (
                'sha256:' + createHash('sha256').update(bytes).digest('hex') !==
                p.sourceRevision
              )
                return false;
            }
            return true;
          },
        );
      };
      try {
        const current = await readSourceRows(tx, refs);
        for (const r of matches) {
          if (!(await verify(r, new Set()))) continue;
          const envelope = {
            schemaVersion: 1,
            namespace: 'rait-risk-source-v1',
            kind: req.kind,
            tenantId: req.tenantId,
            caseId: req.caseId,
            rows: current,
            dependencies: r.core.dependencies,
          };
          if (canonicalRevision(envelope) === req.contentRevision)
            valid.push(r);
        }
      } catch {
        return missing;
      }
      if (valid.length > 1) return { status: 'ambiguous', sourceVersions: [] };
      if (!valid.length) return missing;
      const sourceVersions = [
        ...new Set([valid[0]!.digest, ...valid[0]!.core.dependencies]),
      ]
        .sort()
        .map(opaqueReceiptVersion)
        .sort();
      for (const version of sourceVersions) this.qualifiedVersions.add(version);
      if (req.kind === 'movement')
        for (const digest of valid[0]!.core.dependencies)
          this.policyDependencyDigests.add(digest);
      await this.onQualified?.(req);
      return { status: 'qualified', sourceVersions };
    });
  }

  async qualifyPolicy(tx: Sql, req: PolicyRequest): Promise<unknown> {
    return this.observe('policy', req.caseId, 0, async () => {
      this.policyRequests.push(structuredClone(req));
      const identity = (
        await tx.query(
          "select current_role::text role,current_setting('app.tenant_id',true) tenant",
        )
      ).rows[0];
      expect(identity).toEqual({
        role: 'role_app_backend',
        tenant: RAIT_TENANT,
      });
      const missing = { status: 'missing', sourceVersions: [] };
      const keys = (value: object) => Object.keys(value).sort();
      const same = (a: unknown, b: unknown) =>
        canonicalBytes(a) === canonicalBytes(b);
      if (
        !same(
          keys(req),
          [
            'purpose',
            'tenantId',
            'caseId',
            'sourceRefs',
            'contentRevision',
            'policySources',
          ].sort(),
        ) ||
        req.purpose !== 'C_USEFUL_MOVEMENT_POLICY' ||
        req.tenantId !== RAIT_TENANT ||
        !Array.isArray(req.sourceRefs) ||
        !req.sourceRefs.length ||
        !same(req.sourceRefs, [...new Set(req.sourceRefs)].sort())
      )
        return missing;
      const anchor = provenanceFormat.policyCanonicalSources.find(
        (x) =>
          x.sourceRef ===
          'docs/framework/product/domains/inf/rait/workflows/WF-RAIT-002.md#4.2',
      )!;
      if (!same(req.policySources, [anchor])) return missing; // This pre-admitted isolated proof covers this exact closed C anchor, not a universal6-source policy.
      const policyReceipts = this.receipts.filter(
        (r) =>
          r.core.kind === 'movement' &&
          r.core.caseId === req.caseId &&
          r.core.tenantId === req.tenantId &&
          r.core.policySources.length &&
          same(
            r.core.bindings.map((b) => b.sourceRef),
            req.sourceRefs,
          ),
      );
      const valid: QualifiedReceipt[] = [];
      try {
        const current = await readSourceRows(tx, req.sourceRefs);
        const row = (table: string) => current.filter((x) => x.table === table);
        const cases = row('inf.rait_case'),
          aits = row('inf.ait_ait'),
          infractions = row('inf.infraction'),
          clocks = row('inf.rait_clock'),
          timers = row('inf.infraction_timer');
        const events = current.filter(
          (x) =>
            x.table === 'inf.rait_case_event' ||
            x.table === 'inf.infraction_event',
        );
        if (
          cases.length !== 1 ||
          aits.length !== 1 ||
          infractions.length !== 1 ||
          clocks.length !== 1 ||
          timers.length !== 1 ||
          events.length !== 1
        )
          return missing;
        const c = cases[0]!.fields,
          a = aits[0]!.fields,
          i = infractions[0]!.fields,
          cl = clocks[0]!.fields,
          t = timers[0]!.fields,
          e = events[0]!.fields;
        if (
          c.id !== req.caseId ||
          c.tenant_id !== req.tenantId ||
          a.id !== c.ait_id ||
          i.ait_id !== a.id ||
          cl.case_id !== c.id ||
          cl.clock_code !== 'C' ||
          t.infraction_id !== i.id ||
          t.timer_code !== 'T-PAR-3A' ||
          cl.last_reset_at !== e.occurred_at ||
          (events[0]!.table === 'inf.rait_case_event'
            ? e.case_id !== c.id
            : e.infraction_id !== i.id)
        )
          return missing;
        const bindings = current.map((x) => ({
          sourceRef: x.sourceRef,
          rowRevision: canonicalRevision(x),
        }));
        const trusted = (r: QualifiedReceipt) =>
          r.admittedOrigin === 'owner-approved-isolated-inspector-fixture' &&
          !this.revokedReceipts.has(r.digest) &&
          !this.revokedReceipts.has(r.core.receiptId) &&
          r.digest === canonicalRevision(r.core) &&
          r.core.authorization.authorityRef === syntheticSource;
        for (const receipt of policyReceipts) {
          if (
            !trusted(receipt) ||
            receipt.core.dependencies.length ||
            !same(receipt.core.bindings, bindings) ||
            receipt.core.policySources.length !== 1
          )
            continue;
          const triple = receipt.core.policySources[0]!;
          if (
            !same(
              keys(triple),
              ['sourceRef', 'sourceRevision', 'decisionRef'].sort(),
            ) ||
            !same(
              {
                sourceRef: triple.sourceRef,
                sourceRevision: triple.sourceRevision,
              },
              anchor,
            )
          )
            continue;
          const decisions = this.receipts.filter(
            (x) => x.core.receiptId === triple.decisionRef,
          );
          if (decisions.length !== 1) continue;
          const decision = decisions[0]!;
          if (
            !trusted(decision) ||
            decision.core.authorization.decisionRef !== isolatedPolicyPurpose ||
            decision.core.tenantId !== req.tenantId ||
            decision.core.caseId !== req.caseId ||
            decision.core.dependencies.length ||
            decision.core.policySources.length ||
            !same(decision.core.bindings, bindings)
          )
            continue;
          const file = triple.sourceRef.split('#')[0]!;
          if (
            'sha256:' +
              createHash('sha256')
                .update(
                  readFileSync(new URL('../../../../' + file, import.meta.url)),
                )
                .digest('hex') !==
            triple.sourceRevision
          )
            continue;
          const envelope = {
            schemaVersion: 1,
            namespace: 'rait-risk-policy-request-v1',
            purpose: req.purpose,
            tenantId: req.tenantId,
            caseId: req.caseId,
            rows: current,
            dependencies: [],
            policySources: req.policySources,
          };
          if (canonicalRevision(envelope) === req.contentRevision)
            valid.push(receipt);
        }
      } catch {
        return missing;
      }
      if (valid.length > 1 || this.policyResultMode === 'ambiguous')
        return { status: 'ambiguous', sourceVersions: [] };
      if (valid.length !== 1 || this.policyResultMode === 'missing')
        return missing;
      const receipt = valid[0]!;
      const versions = [
        opaqueReceiptVersion(receipt.digest),
        ...receipt.core.policySources.map((p) =>
          opaqueReceiptVersion(
            this.receipts.find((r) => r.core.receiptId === p.decisionRef)!
              .digest,
          ),
        ),
      ].sort();
      if (this.policyResultMode === 'malformed')
        return { status: 'qualified', sourceVersions: versions };
      if (this.policyResultMode === 'badDigest')
        return {
          status: 'qualified',
          receiptDigest: 'rrv1:' + receipt.digest.slice(7),
          sourceVersions: versions,
        };
      for (const v of versions) this.qualifiedVersions.add(v);
      return {
        status: 'qualified',
        receiptDigest: receipt.digest,
        sourceVersions: versions,
      };
    });
  }

  async close() {
    // Immutable priority/audit parents stay in this owned disposable database.
    // Never remove history or reuse this actor/pool in another fixture.
    await this.owner.end();
  }
}
