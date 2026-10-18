import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import type {
  CrashCorrectionInput,
  CrashReportInput,
  RenaestPort,
} from '@detran/senatran-adapter';
import { SenatranAdapterError } from '@detran/senatran-adapter';
import {
  SqlTeatEventOutbox,
  type TeatEventEnvelope,
  withTenantContext,
} from '@detran/shared';

/**
 * Tenant-scoped executor for the durable BOAT RENAEST outbox.
 *
 * The scheduler and the tenant discovery mechanism are deliberately outside
 * this component. `runOnce` must be called only while the caller has bound a
 * tenant and actor to RequestContext; that preserves the RLS request path and
 * avoids an owner-role scan across tenants.
 */
export const BOAT_RENAEST_PORT = Symbol('BOAT_RENAEST_PORT');

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

type PendingKind = 'submit' | 'complement' | 'correction';

interface ClaimedOutboxItem {
  id: string;
  aggregate_id: string;
  payload: { data?: { kind?: unknown; reason?: unknown } };
  idempotency_key: string;
  attempts: number;
  topic: string;
}

interface CrashSource {
  id: string;
  state: string;
  severity: string;
  occurred_at: string;
  uf: string;
  municipality_code: string;
  location_description: string;
  location_json: { latitude?: unknown; longitude?: unknown } | null;
}

interface VehicleSource extends Record<string, unknown> {
  plate: string | null;
  role: string;
  apparent_damage: string | null;
}

interface PersonSource extends Record<string, unknown> {
  id: string;
  name: string | null;
  document_number: string | null;
  document_source: string | null;
  role: string;
}

interface VictimSource extends Record<string, unknown> {
  severity: string;
  death_at_scene: boolean | null;
  death_at: string | null;
  name: string | null;
  document_number: string | null;
  document_source: string | null;
  role: string;
}

export interface BoatRenaestDispatchResult {
  outboxId: string;
  status: 'acked' | 'error';
  protocol?: string;
  error?: string;
}

@Injectable()
export class BoatRenaestTransmissionService {
  private readonly outbox = new SqlTeatEventOutbox();

  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
    @Inject(BOAT_RENAEST_PORT) private readonly renaest: RenaestPort,
  ) {}

  async runOnce(limit = 25): Promise<BoatRenaestDispatchResult[]> {
    const boundedLimit = Number.isFinite(limit)
      ? Math.max(1, Math.min(25, Math.floor(limit)))
      : 25;
    const claimed = await this.transaction(async (tx) => {
      await this.assertMonthlyTimer(tx);
      return tx.query<ClaimedOutboxItem>(
        `with due as (
           select id
             from integration.outbox
            where topic in ('SINISTRO_TRANSMISSAO_PENDENTE', 'SINISTRO_RETIFICACAO_PENDENTE')
              and ((status in ('pending', 'error') and available_at <= now())
                or (status = 'processing' and dispatched_at <= now() - interval '15 minutes'))
            order by created_at
            limit $1
            for update skip locked
         )
         update integration.outbox outbox
            set status = 'processing', attempts = outbox.attempts + 1,
                dispatched_at = now(), last_error = null, updated_at = now()
           from due
          where outbox.id = due.id
         returning outbox.id, outbox.aggregate_id, outbox.payload,
                   outbox.idempotency_key, outbox.attempts, outbox.topic`,
        [boundedLimit],
      );
    });
    const results: BoatRenaestDispatchResult[] = [];
    for (const item of claimed.rows) results.push(await this.dispatch(item));
    return results;
  }

  private async dispatch(
    item: ClaimedOutboxItem,
  ): Promise<BoatRenaestDispatchResult> {
    try {
      const kind = this.kind(item);
      const source = await this.loadSource(item.aggregate_id);
      const context = this.integrationContext(item.idempotency_key);
      if (kind === 'submit') {
        const receipt = await this.renaest.submitCrash(
          await this.reportInput(source),
          context,
        );
        if (!receipt.protocol)
          throw new Error('RENAEST receipt has no protocol');
        await this.persistSubmission(
          item,
          source,
          receipt.protocol,
          'RECEBIDO',
        );
        return {
          outboxId: item.id,
          status: 'acked',
          protocol: receipt.protocol,
        };
      }
      const protocol = await this.latestProtocol(source.id);
      if (!protocol)
        throw new Error('RENAEST rectification requires a protocol');
      const correction = await this.correctionInput(source, item);
      const receipt =
        kind === 'complement'
          ? await this.renaest.complementCrash(protocol, correction, context)
          : await this.renaest.correctCrash(protocol, correction, context);
      await this.persistRectification(
        item,
        source,
        receipt.protocol ?? protocol,
        kind,
        correction.reason as string,
      );
      return {
        outboxId: item.id,
        status: 'acked',
        ...(receipt.protocol ? { protocol: receipt.protocol } : {}),
      };
    } catch (error) {
      return this.persistError(item, error);
    }
  }

  private kind(item: ClaimedOutboxItem): PendingKind {
    if (item.topic === 'SINISTRO_TRANSMISSAO_PENDENTE') return 'submit';
    const kind = item.payload.data?.kind;
    if (kind === 'complement' || kind === 'correction') return kind;
    throw new Error('RENAEST rectification outbox item has no valid kind');
  }

  private async loadSource(id: string): Promise<CrashSource> {
    const source = await this.transaction(async (tx) => {
      const result = await tx.query<CrashSource>(
        `select id, state, severity, occurred_at::text as occurred_at, uf,
                municipality_code, location_description, location_json
           from est.crash_record where id = $1`,
        [id],
      );
      return result.rows[0];
    });
    if (!source) throw new Error(`Crash record ${id} was not found`);
    return source;
  }

  private async reportInput(source: CrashSource): Promise<CrashReportInput> {
    // Sequencial: leituras concorrentes dentro de uma tx ambiente disputam
    // savepoints da mesma conexão.
    const vehicles = await this.rows<VehicleSource>(
      `select plate, role, apparent_damage from est.crash_vehicle
          where crash_record_id = $1 order by sequence`,
      [source.id],
    );
    const people = await this.rows<PersonSource>(
      `select id, name, document_number, document_source, role
           from est.crash_person where crash_record_id = $1 order by created_at`,
      [source.id],
    );
    const victims = await this.rows<VictimSource>(
      `select victim.severity, victim.death_at_scene, victim.death_at::text as death_at,
                person.name, person.document_number, person.document_source, person.role
           from est.crash_victim victim join est.crash_person person on person.id = victim.crash_person_id
          where victim.crash_record_id = $1 order by victim.created_at`,
      [source.id],
    );
    const position = source.location_json ?? {};
    return {
      occurredAt: source.occurred_at,
      state: source.uf,
      municipalityCode: source.municipality_code,
      severity: severityForMock(source.severity),
      location: source.location_description,
      ...(scalar(position.latitude)
        ? { latitude: scalar(position.latitude) }
        : {}),
      ...(scalar(position.longitude)
        ? { longitude: scalar(position.longitude) }
        : {}),
      // `mock` is the approved proposal, not a national layout version.
      layoutVersion: 'mock',
      vehicles: vehicles.map((vehicle) => ({
        ...(vehicle.plate ? { plate: vehicle.plate } : {}),
        involvementType: vehicle.role,
        ...(vehicle.apparent_damage ? { damage: vehicle.apparent_damage } : {}),
      })),
      people: people.map((person) => ({
        ...(person.document_source === 'CPF' && person.document_number
          ? { cpf: person.document_number }
          : {}),
        involvementType: person.role,
        ...(person.name ? { name: person.name } : {}),
      })),
      victims: victims.map((victim) => ({
        ...(victim.document_source === 'CPF' && victim.document_number
          ? { cpf: victim.document_number }
          : {}),
        involvementType: victim.role,
        injurySeverity: victim.severity,
        ...(victim.death_at_scene !== null
          ? { diedAtScene: victim.death_at_scene }
          : {}),
        ...(victim.death_at ? { deathAt: victim.death_at } : {}),
      })),
    };
  }

  private async correctionInput(
    source: CrashSource,
    item: ClaimedOutboxItem,
  ): Promise<CrashCorrectionInput> {
    const reason = item.payload.data?.reason;
    if (typeof reason !== 'string' || !reason.trim())
      throw new Error('RENAEST rectification requires a reason');
    const position = source.location_json ?? {};
    return {
      reason: reason.trim(),
      layoutVersion: 'mock',
      location: source.location_description,
      ...(scalar(position.latitude)
        ? { latitude: scalar(position.latitude) }
        : {}),
      ...(scalar(position.longitude)
        ? { longitude: scalar(position.longitude) }
        : {}),
    };
  }

  private async persistSubmission(
    item: ClaimedOutboxItem,
    source: CrashSource,
    protocol: string,
    nationalStatus: 'RECEBIDO',
  ): Promise<void> {
    await this.transaction(async (tx) => {
      const record = await tx.query<{ version: number }>(
        `update est.crash_record set state = 'INTEGRADO', national_status = $2,
                version = version + 1, updated_at = now()
          where id = $1 and state = 'FECHADO' returning version`,
        [source.id, nationalStatus],
      );
      if (!record.rows[0])
        throw new Error('Crash is no longer closed for RENAEST submission');
      await tx.query(
        `insert into est.crash_renaest_submission
          (crash_record_id, protocol, national_status, layout_version, submitted_at)
         values ($1, $2, $3, 'mock', now())`,
        [source.id, protocol, nationalStatus],
      );
      await this.ack(tx, item, protocol, { protocol, nationalStatus });
      await this.events(
        tx,
        source.id,
        record.rows[0].version,
        'SINISTRO_TRANSMITIDO',
        {
          protocol,
          nationalStatus,
        },
        true,
      );
      await this.events(
        tx,
        source.id,
        record.rows[0].version,
        'SINISTRO_SITUACAO_NACIONAL',
        {
          nationalStatus,
        },
      );
    });
  }

  private async persistRectification(
    item: ClaimedOutboxItem,
    source: CrashSource,
    protocol: string,
    kind: 'complement' | 'correction',
    reason: string,
  ): Promise<void> {
    await this.transaction(async (tx) => {
      const record = await tx.query<{ version: number }>(
        `update est.crash_record set national_status = 'EM_ANALISE', version = version + 1,
                updated_at = now() where id = $1 and state = 'INTEGRADO' returning version`,
        [source.id],
      );
      if (!record.rows[0])
        throw new Error('Crash is no longer integrated for rectification');
      await tx.query(
        `insert into est.crash_renaest_submission
          (crash_record_id, protocol, national_status, layout_version, submitted_at,
           rectification_kind, rectification_reason)
         values ($1, $2, 'EM_ANALISE', 'mock', now(), $3, $4)`,
        [source.id, protocol, kind, reason],
      );
      await this.ack(tx, item, protocol, {
        protocol,
        nationalStatus: 'EM_ANALISE',
        kind,
      });
      await this.events(
        tx,
        source.id,
        record.rows[0].version,
        'SINISTRO_RETIFICADO',
        {
          protocol,
          kind,
        },
        true,
      );
      await this.events(
        tx,
        source.id,
        record.rows[0].version,
        'SINISTRO_SITUACAO_NACIONAL',
        {
          nationalStatus: 'EM_ANALISE',
        },
      );
    });
  }

  private async ack(
    tx: SqlTransaction,
    item: ClaimedOutboxItem,
    protocol: string,
    body: unknown,
  ): Promise<void> {
    const hash = sha256(body);
    await tx.query(
      `insert into integration.delivery_attempt
        (outbox_id, attempt_number, status, provider_protocol, request_sha256,
         response_sha256, completed_at)
       values ($1, $2, 'acked', $3, $4, $5, now())
       on conflict (tenant_id, outbox_id, attempt_number) do nothing`,
      [item.id, item.attempts, protocol, sha256(item.payload), hash],
    );
    await tx.query(
      `update integration.outbox set status = 'acked', completed_at = now(),
              available_at = now(), last_error = null, updated_at = now()
        where id = $1 and status = 'processing'`,
      [item.id],
    );
  }

  private async events(
    tx: SqlTransaction,
    recordId: string,
    version: number,
    domainEvent: string,
    data: Record<string, unknown>,
    emitSse = false,
  ): Promise<void> {
    const context = this.requestContext.snapshot();
    const envelope: TeatEventEnvelope & { schemaVersion: number } = {
      id: '',
      type: emitSse ? 'crash.renaest.changed' : domainEvent,
      domainEvent,
      schemaVersion: 1,
      version,
      occurredAt: new Date().toISOString(),
      tenantId: context.tenantId ?? '',
      actor: { kind: 'system' as const, id: context.actorId ?? '' },
      correlationId: recordId,
      aggregate: { kind: 'crash-renaest-submission', id: recordId, version },
      data,
    };
    await this.outbox.append(tx, envelope);
    // The canonical SSE envelope and the named durable event have distinct
    // topics. This keeps both receipt events addressable without defeating the
    // outbox's `(type, aggregate, version)` idempotency key.
    if (emitSse) {
      await this.outbox.append(tx, { ...envelope, type: domainEvent });
    }
  }

  private async persistError(
    item: ClaimedOutboxItem,
    error: unknown,
  ): Promise<BoatRenaestDispatchResult> {
    const translated = translate(error);
    await this.transaction(async (tx) => {
      await tx.query(
        `insert into integration.delivery_attempt
          (outbox_id, attempt_number, status, provider_code, provider_message,
           request_sha256, completed_at)
         values ($1, $2, 'error', $3, $4, $5, now())
         on conflict (tenant_id, outbox_id, attempt_number) do nothing`,
        [
          item.id,
          item.attempts,
          translated.code,
          translated.message,
          sha256(item.payload),
        ],
      );
      await tx.query(
        `update integration.outbox set status = 'error', last_error = $2,
                available_at = now() + interval '15 minutes', updated_at = now()
          where id = $1 and status = 'processing'`,
        [item.id, `${translated.code}: ${translated.message}`],
      );
    });
    return { outboxId: item.id, status: 'error', error: translated.code };
  }

  private async latestProtocol(crashId: string): Promise<string | undefined> {
    const result = await this.rows<{ protocol: string }>(
      `select protocol from est.crash_renaest_submission
        where crash_record_id = $1 and protocol is not null
        order by created_at desc limit 1`,
      [crashId],
    );
    return result[0]?.protocol;
  }

  private rows<T extends Record<string, unknown>>(
    sql: string,
    values: readonly unknown[],
  ): Promise<T[]> {
    return this.transaction(
      async (tx) => (await tx.query<T>(sql, values)).rows,
    );
  }

  private async assertMonthlyTimer(tx: SqlTransaction): Promise<void> {
    const result = await tx.query<{ value_json: unknown }>(
      `select parameter.value_json
         from est.crash_timer_ref timer
         join ops.parameter parameter on parameter.key = timer.parameter_key
          and parameter.surface = 'est' and parameter.scope = 'tenant'
          and parameter.status = 'vigente' and parameter.effective_from <= current_date
          and (parameter.effective_to is null or parameter.effective_to >= current_date)
        where timer.code = 'T-BOAT-TRANSM' and timer.trigger_state = 'FECHADO'
          and timer.default_period = 'monthly' and timer.owner = 'sinistro'
          and timer.status = 'vigente'
        order by parameter.effective_from desc, parameter.version desc limit 1`,
    );
    if (jsonString(result.rows[0]?.value_json) !== 'monthly') {
      throw new Error('T-BOAT-TRANSM monthly parameter is not active');
    }
  }

  private integrationContext(idempotencyKey: string) {
    const context = this.requestContext.snapshot();
    return {
      tenantId: context.tenantId,
      actorId: context.actorId,
      correlationId: context.requestId,
      metadata: { idempotencyKey },
    };
  }

  private transaction<T>(
    work: (transaction: SqlTransaction) => Promise<T>,
  ): Promise<T> {
    return withTenantContext(this.database, this.requestContext, (tx) =>
      work(tx as SqlTransaction),
    );
  }
}

function severityForMock(value: string): CrashReportInput['severity'] {
  const map: Record<string, CrashReportInput['severity']> = {
    SEM_VITIMA: 'NO_VICTIMS',
    COM_VITIMA_FERIDA: 'WITH_INJURED_VICTIM',
    COM_VITIMA_FATAL: 'WITH_FATAL_VICTIM',
  };
  const severity = map[value];
  if (!severity) throw new Error(`Unsupported BOAT severity ${value}`);
  return severity;
}

function scalar(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function jsonString(value: unknown): string | undefined {
  if (typeof value === 'string') return value.replace(/^"|"$/gu, '');
  return undefined;
}

function sha256(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function translate(error: unknown): { code: string; message: string } {
  if (error instanceof SenatranAdapterError) {
    const provider = error.providerCode ?? '';
    if (provider === 'RENAEST.CRASH.DUPLICATED')
      return { code: 'BOAT.TRANSMIT_DUPLICATED', message: error.message };
    if (provider === 'RENAEST.CRASH.INVALID_LAYOUT')
      return {
        code: 'BOAT.TRANSMIT_LAYOUT_UNSUPPORTED',
        message: error.message,
      };
    if (provider === 'RENAEST.CRASH.INCOMPLETE_DATA')
      return { code: 'BOAT.TRANSMIT_INCOMPLETE_DATA', message: error.message };
    if (error.retryable)
      return { code: 'BOAT.RENAEST_UNAVAILABLE', message: error.message };
    return { code: 'BOAT.RENAEST_REJECTED', message: error.message };
  }
  return {
    code: 'BOAT.RENAEST_UNAVAILABLE',
    message: error instanceof Error ? error.message : String(error),
  };
}
