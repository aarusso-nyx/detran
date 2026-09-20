import { Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import {
  DetranError,
  SqlTeatEventOutbox,
  type TeatEventEnvelope,
  type TeatEventOutbox,
} from '@detran/shared';

type Sql = {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

type CrashRow = {
  id: string;
  traffic_agency_id: string;
  state: string;
  national_status: string | null;
  occurred_at: string;
  location_description: string | null;
  version: number;
};

function sql(tx: Transaction): Sql {
  return tx as unknown as Sql;
}

function boatError(
  code: string,
  status: number,
  context: Record<string, unknown> = {},
) {
  return new DetranError(`BOAT.${code}`, { status, context });
}

@Injectable()
export class BoatCrashCommandsService {
  private readonly outbox: TeatEventOutbox = new SqlTeatEventOutbox();

  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  async current(id: string): Promise<CrashRow> {
    return this.database.tx(async (tx) => this.record(sql(tx), id));
  }

  async transition(
    id: string,
    from: readonly string[],
    to: string,
    event: string,
  ): Promise<CrashRow> {
    return this.database.tx(async (tx) => {
      const query = sql(tx);
      const current = await this.record(query, id);
      if (!from.includes(current.state))
        throw boatError('CRASH_STATE_INVALID', 409, {
          currentState: current.state,
        });
      const updated = await query.query<CrashRow>(
        `update est.crash_record
            set state = $2, version = version + 1, updated_at = now()
          where id = $1
          returning id, state, national_status, version`,
        [id, to],
      );
      const row = updated.rows[0]!;
      await this.event(tx, row, event, { state: to });
      return row;
    });
  }

  async recordDuty(
    id: string,
    body: Record<string, unknown>,
  ): Promise<{ id: string }> {
    return this.database.tx(async (tx) => {
      const query = sql(tx);
      const record = await this.editable(query, id);
      const victimCount = await query.query<{ count: string }>(
        'select count(*)::text as count from est.crash_victim where crash_record_id = $1',
        [id],
      );
      const hasVictim = Number(victimCount.rows[0]?.count ?? 0) > 0;
      const regime = String(body.regime ?? '');
      if (
        (regime === 'art176' && !hasVictim) ||
        (regime === 'art178' && hasVictim)
      )
        throw boatError('DUTY_REGIME_MISMATCH', 422, { regime, hasVictim });
      const inserted = await query.query<{ id: string }>(
        `insert into est.crash_scene_duty
           (tenant_id, crash_record_id, regime, duty_code, crash_person_id,
            crash_vehicle_id, complied, note)
         values (auth.current_tenant(), $1, $2, $3, $4, $5, $6, $7)
         returning id`,
        [
          id,
          regime,
          String(body.duty_code ?? ''),
          body.crash_person_id ?? null,
          body.crash_vehicle_id ?? null,
          body.complied === true,
          body.note ?? null,
        ],
      );
      await this.event(tx, record, 'SINISTRO_CONDUTA_REGISTRADA', { regime });
      return inserted.rows[0]!;
    });
  }

  async add(
    id: string,
    table:
      | 'vehicle'
      | 'person'
      | 'victim'
      | 'damage'
      | 'witness'
      | 'sketch'
      | 'link',
    body: Record<string, unknown>,
  ): Promise<{ id: string }> {
    return this.database.tx(async (tx) => {
      const query = sql(tx);
      const record = await this.editable(query, id, table === 'sketch');
      const definitions: Record<
        string,
        { columns: string[]; values: unknown[]; event: string }
      > = {
        vehicle: {
          columns: [
            'vehicle_snapshot_id',
            'plate',
            'role',
            'sequence',
            'apparent_damage',
            'notes',
          ],
          values: [
            body.vehicle_snapshot_id ?? null,
            body.plate ?? null,
            body.role,
            body.sequence,
            body.apparent_damage ?? null,
            body.notes ?? null,
          ],
          event: 'VEICULO_REGISTRADO',
        },
        person: {
          columns: [
            'person_id',
            'name',
            'document_number',
            'document_source',
            'crash_vehicle_id',
            'role',
            'used_seatbelt_or_helmet',
            'refused_data',
            'notes',
          ],
          values: [
            body.person_id ?? null,
            body.name ?? null,
            body.document_number ?? null,
            body.document_source ?? null,
            body.crash_vehicle_id ?? null,
            body.role,
            body.used_seatbelt_or_helmet ?? null,
            body.refused_data === true,
            body.notes ?? null,
          ],
          event: 'PESSOA_REGISTRADA',
        },
        victim: {
          columns: [
            'crash_person_id',
            'severity',
            'death_at_scene',
            'medical_care',
            'hospital_destination',
            'death_at',
            'health_notes',
          ],
          values: [
            body.crash_person_id,
            body.severity,
            body.death_at_scene ?? null,
            body.medical_care ?? null,
            body.hospital_destination ?? null,
            body.death_at ?? null,
            body.health_notes ?? null,
          ],
          event: 'VITIMA_REGISTRADA',
        },
        damage: {
          columns: [
            'asset_kind',
            'description',
            'responsible_identified',
            'notify_road_owner',
          ],
          values: [
            body.asset_kind,
            body.description,
            body.responsible_identified ?? null,
            body.notify_road_owner ?? null,
          ],
          event: 'DANO_REGISTRADO',
        },
        witness: {
          columns: ['name', 'contact', 'refused', 'statement_summary'],
          values: [
            body.name,
            body.contact ?? null,
            body.refused === true,
            body.statement_summary ?? null,
          ],
          event: 'TESTEMUNHA_REGISTRADA',
        },
        sketch: {
          columns: ['sketch_type', 'evidence_id', 'drawing_json'],
          values: [
            body.sketch_type,
            body.evidence_id ?? null,
            body.drawing_json ? JSON.stringify(body.drawing_json) : null,
          ],
          event: 'CROQUI_ANEXADO',
        },
        link: {
          columns: ['kind', 'target_id', 'target_number'],
          values: [body.kind, body.target_id, body.target_number ?? null],
          event: 'SINISTRO_VINCULADO',
        },
      };
      const definition = definitions[table];
      const fields = ['tenant_id', 'crash_record_id', ...definition.columns];
      const placeholders = fields
        .map((_, index) =>
          index === 0 ? 'auth.current_tenant()' : `$${index}`,
        )
        .join(', ');
      const values = [id, ...definition.values];
      const inserted = await query.query<{ id: string }>(
        `insert into est.crash_${table} (${fields.join(', ')}) values (${placeholders}) returning id`,
        values,
      );
      await this.event(tx, record, definition.event, {});
      return inserted.rows[0]!;
    });
  }

  async transmit(id: string): Promise<CrashRow> {
    return this.database.tx(async (tx) => {
      const query = sql(tx);
      const record = await this.record(query, id);
      if (record.state !== 'FECHADO')
        throw boatError('TRANSMIT_NOT_CLOSED', 409, {
          currentState: record.state,
        });
      await this.event(tx, record, 'SINISTRO_TRANSMISSAO_PENDENTE', {
        state: record.state,
      });
      return record;
    });
  }

  async rectify(
    id: string,
    kind: 'complement' | 'correction',
    reason: unknown,
  ): Promise<CrashRow> {
    if (typeof reason !== 'string' || !reason.trim())
      throw boatError('RECTIFY_REASON_REQUIRED', 422);
    return this.database.tx(async (tx) => {
      const query = sql(tx);
      const record = await this.record(query, id);
      if (record.state !== 'INTEGRADO')
        throw boatError('CRASH_STATE_INVALID', 409, {
          currentState: record.state,
        });
      if (
        record.national_status === 'CONSOLIDADO' ||
        record.national_status === 'REJEITADO'
      )
        throw boatError('RECTIFY_TERMINAL', 409, {
          nationalStatus: record.national_status,
        });
      await this.event(tx, record, 'SINISTRO_RETIFICACAO_PENDENTE', {
        kind,
        reason: reason.trim(),
      });
      return record;
    });
  }

  async mirror(id: string): Promise<Record<string, unknown>> {
    return this.database.tx(async (tx) => {
      const query = sql(tx);
      const record = await this.record(query, id);
      const result = await query.query<Record<string, unknown>>(
        `select id, crash_record_id, protocol, national_status, layout_version,
                submitted_at, rectification_kind, rectification_reason
           from est.crash_renaest_submission
          where crash_record_id = $1
          order by created_at desc`,
        [id],
      );
      return {
        record: {
          id: record.id,
          state: record.state,
          national_status: record.national_status,
        },
        submissions: result.rows,
      };
    });
  }

  private async editable(
    query: Sql,
    id: string,
    allowRegistered = false,
  ): Promise<CrashRow> {
    const record = await this.record(query, id);
    const states = allowRegistered
      ? ['RASCUNHO', 'EM_ATENDIMENTO', 'PENDENTE_COMPLEMENTO', 'REGISTRADO']
      : ['RASCUNHO', 'EM_ATENDIMENTO', 'PENDENTE_COMPLEMENTO'];
    if (!states.includes(record.state))
      throw boatError('CRASH_STATE_INVALID', 409, {
        currentState: record.state,
      });
    return record;
  }

  private async record(query: Sql, id: string): Promise<CrashRow> {
    const found = await query.query<CrashRow>(
      `select id, traffic_agency_id, state, national_status,
              occurred_at, location_description, version
         from est.crash_record
        where id = $1
        for update`,
      [id],
    );
    if (!found.rows[0])
      throw boatError('CRASH_NOT_FOUND', 404, { crashRecordId: id });
    return found.rows[0];
  }

  private async event(
    tx: Transaction,
    record: CrashRow,
    domainEvent: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    const context = this.requestContext.snapshot();
    const envelope: TeatEventEnvelope & { schemaVersion: number } = {
      id: '',
      type: 'crash.changed',
      domainEvent,
      // Envelope schema and aggregate version evolve independently.  BOAT
      // projectors reject an absent schema version instead of inferring it
      // from the aggregate.
      schemaVersion: 1,
      version: record.version + 1,
      occurredAt: new Date().toISOString(),
      tenantId: context.tenantId ?? '',
      actor: { kind: 'user', id: context.actorId ?? '' },
      correlationId: record.id,
      aggregate: {
        kind: 'crash-record',
        id: record.id,
        version: record.version + 1,
      },
      data,
    };
    await this.outbox.append(tx, envelope);
    // The canonical event is the SSE envelope above. Keep the domain event
    // itself addressable in the outbox as well: operational consumers and the
    // BOAT route contract use this token as their durable audit topic.
    await this.outbox.append(tx, { ...envelope, type: domainEvent });
  }
}
