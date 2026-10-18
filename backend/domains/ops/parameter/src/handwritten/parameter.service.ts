import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext, StynxError } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import type { Parameter } from '../entities/parameter.entity.js';

export interface ParameterClock {
  today(): string;
  now(): string;
}

export interface ParameterCache {
  invalidate(tenantId: string, key: string): unknown;
}

export interface ParameterOutbox {
  append(event: {
    type: 'PARAMETRO_ALTERADO';
    tenantId: string;
    key: string;
    actorId: string;
    payload: Record<string, unknown>;
    occurredAt: string;
    transaction?: Transaction;
    idempotencyKey?: string;
  }): unknown;
}

export interface ParameterLookupOptions {
  agencyId?: string;
  on?: string;
  required?: boolean;
}

export interface ParameterPutInput {
  value?: unknown;
  valueType?: string;
  reason?: string;
  decisionRef?: string;
  effectiveFrom?: string;
  trafficAgencyId?: string;
  scope?: string;
  surface?: string;
  status?: string;
  sourcePending?: boolean;
  legalBasis?: string;
  [field: string]: unknown;
}

export interface ParameterPutOptions {
  ifMatch?: string;
  idempotencyKey?: string;
}

interface ParameterRow extends Record<string, unknown> {
  tenant_id?: string;
  traffic_agency_id?: string | null;
  scope?: string;
  surface?: string;
  key?: string;
  version?: number;
  effective_from?: string;
  effective_to?: string | null;
  source_pending?: boolean;
  legal_readonly?: boolean;
}

interface QueryTransaction {
  query<T extends ParameterRow = ParameterRow>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

interface DatabasePort {
  tx(work: (transaction: unknown) => Promise<unknown>): Promise<unknown>;
}

interface RequestContextPort {
  hasActiveContext(): boolean;
  snapshot(): { tenantId?: string; actorId?: string };
}

@Injectable()
export class SystemParameterClock implements ParameterClock {
  today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  now(): string {
    return new Date().toISOString();
  }
}

@Injectable()
export class NullParameterCache implements ParameterCache {
  invalidate(_tenantId: string, _key: string): void {
    // Parameter reads are not cache-backed in this release.
  }
}

@Injectable()
export class SqlParameterOutbox implements ParameterOutbox {
  append(event: {
    type: 'PARAMETRO_ALTERADO';
    tenantId: string;
    key: string;
    actorId: string;
    payload: Record<string, unknown>;
    occurredAt: string;
    transaction?: Transaction;
    idempotencyKey?: string;
  }): Promise<unknown> {
    if (!event.transaction)
      throw new Error('Outbox append requires a transaction');
    return event.transaction.query(
      `insert into integration.outbox
        (tenant_id, topic, aggregate_type, aggregate_id, payload,
         idempotency_key, status, available_at)
       values ($1, $2, $3, $4, $5, $6, 'pending', $7)
       on conflict (tenant_id, idempotency_key) do nothing`,
      [
        event.tenantId,
        event.type,
        'ops.parameter',
        event.key,
        JSON.stringify({ ...event.payload, actorId: event.actorId }),
        event.idempotencyKey ?? `ops.parameter:${event.key}`,
        event.occurredAt,
      ],
    );
  }
}

export class OpsParameterError extends StynxError {
  constructor(code: string, status: number, context: Record<string, string>) {
    super(code, { code, status, context });
  }
}

const SURFACE_BY_PREFIX: Readonly<Record<string, string>> = {
  rait: 'rait',
  collection: 'rait',
  deadline: 'rait',
  session: 'rait',
  teat: 'teat',
  sync: 'teat',
  portal: 'portal',
  privacy: 'portal',
  est: 'est',
  dashboard: 'dashboard',
};

const PUT_FIELDS = new Set([
  'value',
  'valueType',
  'reason',
  'decisionRef',
  'effectiveFrom',
  'trafficAgencyId',
  'scope',
  'surface',
  'status',
  'sourcePending',
  'legalBasis',
]);

function dayBefore(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const previous = new Date(Date.UTC(year, month - 1, day - 1));
  return previous.toISOString().slice(0, 10);
}

function normalizeIfMatch(value: string): string {
  const match = value.match(/^(?:(?:W\/)?"(0|[1-9]\d*)"|(0|[1-9]\d*))$/);
  const version = match?.[1] ?? match?.[2];
  if (!version) throw new BadRequestException('Invalid If-Match header');
  return version;
}

@Injectable()
export class OpsParameterService {
  constructor(
    @Inject(Database) private readonly database: DatabasePort,
    @Inject(RequestContext) private readonly requestContext: RequestContextPort,
    @Inject(SystemParameterClock) private readonly clock: ParameterClock,
    @Inject(NullParameterCache) private readonly cache: ParameterCache,
    @Inject(SqlParameterOutbox) private readonly outbox: ParameterOutbox,
  ) {}

  async get(
    key: string,
    options: ParameterLookupOptions = {},
  ): Promise<Parameter> {
    const surface = this.surfaceFor(key);
    const on = options.on ?? this.clock.today();
    const rows = (await this.database.tx(async (tx) => {
      const result = await (tx as QueryTransaction).query(
        `select * from ops.parameter
          where key = $1 and surface = $2 and effective_from <= $3
            and (effective_to is null or effective_to >= $3)
          order by effective_from desc, version desc`,
        [key, surface, on],
      );
      return result.rows;
    })) as ParameterRow[];
    const selected = this.select(rows, key, options.agencyId, on);
    if (!selected) throw new NotFoundException(`Parameter ${key} not found`);
    if (
      options.required &&
      selected.source_pending === true &&
      surface === 'rait'
    ) {
      throw new OpsParameterError('RAIT.PARAMETER_SOURCE_PENDING', 422, {
        key,
      });
    }
    return selected as unknown as Parameter;
  }

  async put(
    key: string,
    input: ParameterPutInput,
    options: ParameterPutOptions,
  ): Promise<Parameter> {
    const surface = this.surfaceFor(key);
    if (!options.ifMatch) {
      throw new OpsParameterError('RAIT.IF_MATCH_REQUIRED', 428, { key });
    }
    const ifMatch = normalizeIfMatch(options.ifMatch);
    if (!options.idempotencyKey)
      throw new BadRequestException('Idempotency-Key is required');
    if (Object.keys(input).some((field) => !PUT_FIELDS.has(field))) {
      throw new BadRequestException('Invalid parameter payload');
    }
    if (input.surface !== undefined && input.surface !== surface)
      throw new BadRequestException('Parameter surface does not match key');
    for (const field of [
      'value',
      'valueType',
      'reason',
      'decisionRef',
      'effectiveFrom',
    ]) {
      if (input[field] === undefined || input[field] === '') {
        throw new BadRequestException('Invalid parameter payload');
      }
    }
    if (!this.requestContext.hasActiveContext())
      throw new BadRequestException('Active tenant context is required');
    const context = this.requestContext.snapshot();
    const tenantId = context.tenantId;
    const actorId = context.actorId;
    if (!tenantId || !actorId)
      throw new Error('Parameter command requires tenant and actor context');
    const result = (await this.database.tx(async (tx) => {
      const queryTx = tx as QueryTransaction;
      const targetScope = input.scope ?? 'tenant';
      const targetAgency = input.trafficAgencyId ?? null;
      const immutable = await queryTx.query(
        `select legal_readonly from ops.parameter
          where tenant_id = current_setting('app.tenant_id')::uuid
            and key = $1 and surface = $2 and legal_readonly = true
          limit 1 for key share`,
        [key, surface],
      );
      if (immutable.rows.some((row) => row.legal_readonly === true))
        throw new OpsParameterError('RAIT.PARAMETER_LEGAL_READONLY', 422, {
          key,
        });
      // Serializa os PUT da mesma série (tenant+chave+superfície+escopo+
      // órgão): sem linha anterior não há o que `for update` bloquear, e o
      // `limit 1` sob READ COMMITTED relê a versão antiga depois da espera.
      await queryTx.query(
        `select pg_advisory_xact_lock(hashtextextended(
           'ops.parameter:' || current_setting('app.tenant_id') || ':' || $1
             || ':' || $2 || ':' || $3 || ':' || coalesce($4::text, ''), 0))`,
        [key, surface, targetScope, targetAgency],
      );
      const currentResult = await queryTx.query(
        `select * from ops.parameter
          where tenant_id = current_setting('app.tenant_id')::uuid
            and key = $1 and surface = $2 and scope = $3
            and traffic_agency_id is not distinct from $4
          order by version desc limit 1 for update`,
        [key, surface, targetScope, targetAgency],
      );
      const current = currentResult.rows[0];
      const currentVersion = Number(current?.version ?? 0);
      if (String(currentVersion) !== ifMatch)
        throw new OpsParameterError('RAIT.VERSION_CONFLICT', 412, { key });
      if ((input.effectiveFrom as string) < this.clock.today())
        throw new OpsParameterError('RAIT.PARAMETER_EFFECTIVE_DATE_PAST', 422, {
          key,
        });
      if (
        current?.effective_from &&
        current.effective_from >= (input.effectiveFrom as string)
      )
        throw new ConflictException('Parameter effective date must advance');

      const nextVersion = currentVersion + 1;
      if (current) {
        await queryTx.query(
          'update ops.parameter set effective_to = $1 where id = $2 and effective_to is null',
          [dayBefore(input.effectiveFrom as string), current.id],
        );
      }
      const values = [
        tenantId,
        input.trafficAgencyId ?? current?.traffic_agency_id ?? null,
        input.scope ?? current?.scope ?? 'tenant',
        surface,
        key,
        input.value,
        input.valueType as string,
        input.status ?? current?.status ?? 'vigente',
        input.sourcePending ?? current?.source_pending ?? false,
        current?.legal_readonly ?? false,
        input.decisionRef as string,
        input.legalBasis ?? current?.legal_basis ?? null,
        input.reason as string,
        nextVersion,
        input.effectiveFrom as string,
        actorId,
        this.clock.now(),
      ];
      const inserted = await queryTx.query(
        `insert into ops.parameter
          (tenant_id, traffic_agency_id, scope, surface, key, value_json,
           value_type, status, source_pending, legal_readonly, decision_ref,
           legal_basis, reason, version, effective_from, changed_by, created_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                 $14, $15, $16, $17)
         returning *`,
        values,
      );
      const created = {
        ...current,
        ...(inserted.rows[0] ?? {}),
        tenant_id: tenantId,
        traffic_agency_id: values[1],
        scope: values[2],
        surface: values[3],
        key,
        value_json: input.value,
        value_type: input.valueType,
        status: values[7],
        source_pending: values[8],
        legal_readonly: values[9],
        decision_ref: input.decisionRef,
        legal_basis: values[11],
        reason: input.reason,
        version: nextVersion,
        effective_from: input.effectiveFrom,
        changed_by: actorId,
        created_at: this.clock.now(),
      } as Parameter;
      await this.outbox.append({
        type: 'PARAMETRO_ALTERADO',
        tenantId,
        key,
        actorId,
        payload: { version: nextVersion },
        occurredAt: this.clock.now(),
        transaction: tx as Transaction,
        idempotencyKey: `ops.parameter:${key}:${options.idempotencyKey}`,
      });
      return created;
    })) as Parameter;
    this.cache.invalidate(tenantId, key);
    return result;
  }

  private surfaceFor(key: string): string {
    const prefix = key.split('.')[0];
    const surface = SURFACE_BY_PREFIX[prefix];
    if (!surface)
      throw new BadRequestException(`Unknown parameter surface for ${key}`);
    return surface;
  }

  private select(
    rows: ParameterRow[],
    key: string,
    agencyId: string | undefined,
    on: string,
  ): ParameterRow | undefined {
    // R-0009 (plant-bug, pre-existing): `pg` returns `date` columns as `Date`
    // objects, and `Date <= '2026-09-16'` is always false — every governed
    // parameter read from a real database resolved to "not found". Compare
    // calendar days as ISO strings instead (the SQL already filtered by
    // `effective_from`/`effective_to`; this is the in-memory re-check).
    const dayOf = (value: unknown): string =>
      value instanceof Date
        ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
        : String(value).slice(0, 10);
    const effective = rows.filter(
      (row) =>
        (!row.key || row.key === key) &&
        (!row.effective_from || dayOf(row.effective_from) <= on) &&
        (!row.effective_to || dayOf(row.effective_to) >= on),
    );
    const rank = (row: ParameterRow): number => {
      if (row.scope === 'agency' && row.traffic_agency_id === agencyId)
        return 3;
      if (row.scope === 'tenant') return 2;
      if (row.scope === 'surface' || !row.scope) return 1;
      return 0;
    };
    return effective
      .filter((row) => rank(row) > 0)
      .sort(
        (a, b) =>
          rank(b) - rank(a) ||
          String(b.effective_from ?? '').localeCompare(
            String(a.effective_from ?? ''),
          ) ||
          Number(b.version ?? 0) - Number(a.version ?? 0),
      )[0];
  }
}
