import {
  DetranError,
  SqlTeatEventOutbox,
  type TeatEventEnvelope,
} from '@detran/shared';
import type { Transaction } from '@stynx-nyx/data';

type SqlQueryable = {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    statement: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};
interface SyncEntityApplierItem {
  id: string;
  tenantId: string;
  trafficAgencyId: string;
  deviceId: string;
  agentId: string;
  entityType: string;
  localEntityId: string;
  idempotencyKey: string;
  payloadHash: string;
  createdLocallyAt: string;
  concurrencySuspect: boolean;
  receiptId: string;
}
interface SyncApplierRejection {
  code: string;
  fields: readonly string[];
}
interface SyncEntityApplier {
  readonly entityType: string;
  validate(value: unknown): SyncApplierRejection | null;
  apply(
    item: SyncEntityApplierItem,
    tx: Transaction,
  ): Promise<{ serverEntityId: string }>;
}
type Payload = {
  record: Record<string, unknown>;
  vehicles: Array<Record<string, unknown>>;
  people: Array<Record<string, unknown>>;
  victims: Array<Record<string, unknown>>;
  sceneDuties: Array<Record<string, unknown>>;
  damages: Array<Record<string, unknown>>;
  witnesses: Array<Record<string, unknown>>;
  sketch: Record<string, unknown> | null;
  evidenceLocalIds: string[];
  links: Array<Record<string, unknown>>;
};

function asQueryable(tx: Transaction): SqlQueryable | undefined {
  const candidate = tx as unknown as Partial<SqlQueryable>;
  return typeof candidate.query === 'function'
    ? (candidate as SqlQueryable)
    : undefined;
}

function parse(value: unknown): { data?: Payload; fields: string[] } {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return { fields: [''] };
  const raw = value as Record<string, unknown>;
  const source = raw.record;
  if (!source || typeof source !== 'object' || Array.isArray(source))
    return { fields: ['record'] };
  const record = source as Record<string, unknown>;
  const required = [
    'traffic_agency_id',
    'crash_type',
    'severity',
    'occurred_at',
    'recorded_at',
    'location_description',
    'municipality_code',
    'uf',
    'road_condition',
    'weather_condition',
    'lighting_condition',
    'signage_condition',
    'source_local_id',
  ];
  const missing = required
    .filter(
      (key) => typeof record[key] !== 'string' || !String(record[key]).trim(),
    )
    .map((key) => `record.${key}`);
  if (missing.length) return { fields: missing };
  const collection = (key: string) =>
    Array.isArray(raw[key])
      ? raw[key].filter(
          (item): item is Record<string, unknown> =>
            !!item && typeof item === 'object' && !Array.isArray(item),
        )
      : [];
  return {
    data: {
      record,
      vehicles: collection('vehicles'),
      people: collection('people'),
      victims: collection('victims'),
      sceneDuties: collection('sceneDuties'),
      damages: collection('damages'),
      witnesses: collection('witnesses'),
      sketch:
        raw.sketch &&
        typeof raw.sketch === 'object' &&
        !Array.isArray(raw.sketch)
          ? (raw.sketch as Record<string, unknown>)
          : null,
      evidenceLocalIds: Array.isArray(raw.evidenceLocalIds)
        ? raw.evidenceLocalIds.filter(
            (id): id is string => typeof id === 'string' && id.length > 0,
          )
        : [],
      links: collection('links'),
    },
    fields: [],
  };
}

/** CTG-0002 §3: materializa o agregado inteiro dentro da transação do item. */
export class CrashSyncApplier implements SyncEntityApplier {
  readonly entityType = 'crash-record';
  private readonly outbox = new SqlTeatEventOutbox();

  validate(value: unknown): SyncApplierRejection | null {
    const parsed = parse(value);
    return parsed.data
      ? null
      : { code: 'BOAT.SYNC_INVALID_CRASH_RECORD', fields: parsed.fields };
  }

  async apply(
    item: SyncEntityApplierItem,
    tx: Transaction,
  ): Promise<{ serverEntityId: string }> {
    const query = asQueryable(tx);
    if (!query)
      throw new Error('The crash sync applier requires a SQL transaction');
    const payload = await this.payload(query, item.id);
    this.guardVictims(payload);
    const inserted = await this.insertRecord(query, item, payload);
    const id = inserted.id;
    await this.satellites(query, id, payload);
    const warnings = await this.warnings(query, item, payload);
    if (warnings.length)
      await query.query(
        `update ops.sync_receipt
            set details_json = $2::jsonb
          where id = $1`,
        [item.receiptId, JSON.stringify({ warnings })],
      );
    const event: TeatEventEnvelope & { schemaVersion: number } = {
      id: '',
      type: 'crash.changed',
      domainEvent: 'SINISTRO_RECEBIDO_SINCRONIZACAO',
      schemaVersion: 1,
      version: 1,
      occurredAt: item.createdLocallyAt,
      tenantId: item.tenantId,
      actor: { kind: 'user', id: item.agentId },
      correlationId: item.id,
      aggregate: { kind: 'crash-record', id, version: 1 },
      data: { state: 'RASCUNHO', localEntityId: item.localEntityId },
    };
    await this.outbox.append(tx, event);
    return { serverEntityId: id };
  }

  private async payload(query: SqlQueryable, itemId: string): Promise<Payload> {
    const found = await query.query<{ payload_json: unknown }>(
      'select payload_json from ops.sync_queue_item where id = $1',
      [itemId],
    );
    const parsed = parse(found.rows[0]?.payload_json);
    if (!parsed.data)
      throw new DetranError('BOAT.SYNC_INVALID_CRASH_RECORD', {
        status: 422,
        context: { fields: parsed.fields },
      });
    return parsed.data;
  }

  private guardVictims(payload: Payload): void {
    const hasVictim = payload.victims.length > 0;
    if ((payload.record.severity === 'SEM_VITIMA') !== !hasVictim)
      throw new DetranError('BOAT.SYNC_VICTIMS_INCONSISTENT', {
        status: 422,
        context: {},
      });
  }

  private async insertRecord(
    query: SqlQueryable,
    item: SyncEntityApplierItem,
    payload: Payload,
  ): Promise<{ id: string }> {
    const value = payload.record;
    try {
      const result = await query.query<{ id: string }>(
        `insert into est.crash_record
          (tenant_id, traffic_agency_id, crash_type, severity, state, occurred_at, recorded_at,
           location_description, municipality_code, uf, road_condition, weather_condition,
           lighting_condition, signage_condition, source_system, source_local_id,
           source_idempotency_key, source_payload_hash)
         values (auth.current_tenant(), $1, $2, $3, 'RASCUNHO', $4, $5, $6, $7, $8, $9, $10, $11,
                 $12, 'boat-offline', $13, $14, $15) returning id`,
        [
          value.traffic_agency_id,
          value.crash_type,
          value.severity,
          value.occurred_at,
          value.recorded_at,
          value.location_description,
          value.municipality_code,
          value.uf,
          value.road_condition,
          value.weather_condition,
          value.lighting_condition,
          value.signage_condition,
          value.source_local_id,
          item.idempotencyKey,
          item.payloadHash,
        ],
      );
      return result.rows[0]!;
    } catch (error) {
      if ((error as { code?: string }).code === '23505')
        throw new DetranError('BOAT.SYNC_DUPLICATE_NATURAL_KEY', {
          status: 409,
          context: {},
        });
      throw error;
    }
  }

  private async satellites(
    query: SqlQueryable,
    crashId: string,
    payload: Payload,
  ): Promise<void> {
    for (const [index, vehicle] of payload.vehicles.entries())
      await query.query(
        `insert into est.crash_vehicle (tenant_id, crash_record_id, plate, role, sequence, apparent_damage, notes)
         values (auth.current_tenant(), $1, $2, $3, $4, $5, $6)`,
        [
          crashId,
          vehicle.plate ?? null,
          vehicle.role ?? 'source_pending',
          vehicle.sequence ?? index + 1,
          vehicle.apparent_damage ?? null,
          vehicle.notes ?? null,
        ],
      );
    for (const person of payload.people)
      await query.query(
        `insert into est.crash_person (tenant_id, crash_record_id, name, document_number, role, refused_data)
         values (auth.current_tenant(), $1, $2, $3, $4, $5)`,
        [
          crashId,
          person.name ?? null,
          person.document_number ?? null,
          person.role ?? 'pedestre',
          person.refused_data === true,
        ],
      );
    for (const victim of payload.victims)
      await query.query(
        `insert into est.crash_victim
          (tenant_id, crash_record_id, crash_person_id, severity, death_at_scene,
           medical_care, hospital_destination, death_at, health_notes)
         values (auth.current_tenant(), $1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          crashId,
          victim.crash_person_id,
          victim.severity,
          victim.death_at_scene ?? null,
          victim.medical_care ?? null,
          victim.hospital_destination ?? null,
          victim.death_at ?? null,
          victim.health_notes ?? null,
        ],
      );
    for (const duty of payload.sceneDuties)
      await query.query(
        `insert into est.crash_scene_duty
          (tenant_id, crash_record_id, regime, duty_code, crash_person_id,
           crash_vehicle_id, complied, note)
         values (auth.current_tenant(), $1, $2, $3, $4, $5, $6, $7)`,
        [
          crashId,
          duty.regime,
          duty.duty_code,
          duty.crash_person_id ?? null,
          duty.crash_vehicle_id ?? null,
          duty.complied === true,
          duty.note ?? null,
        ],
      );
    for (const damage of payload.damages)
      await query.query(
        `insert into est.crash_damage
          (tenant_id, crash_record_id, asset_kind, description,
           responsible_identified, notify_road_owner)
         values (auth.current_tenant(), $1, $2, $3, $4, $5)`,
        [
          crashId,
          damage.asset_kind,
          damage.description,
          damage.responsible_identified ?? null,
          damage.notify_road_owner ?? null,
        ],
      );
    for (const witness of payload.witnesses)
      await query.query(
        `insert into est.crash_witness
          (tenant_id, crash_record_id, name, contact, refused, statement_summary)
         values (auth.current_tenant(), $1, $2, $3, $4, $5)`,
        [
          crashId,
          witness.name,
          witness.contact ?? null,
          witness.refused === true,
          witness.statement_summary ?? null,
        ],
      );
    if (payload.sketch)
      await query.query(
        `insert into est.crash_sketch
          (tenant_id, crash_record_id, sketch_type, evidence_id, drawing_json)
         values (auth.current_tenant(), $1, $2, $3, $4::jsonb)`,
        [
          crashId,
          payload.sketch.sketch_type,
          payload.sketch.evidence_id ?? null,
          payload.sketch.drawing_json
            ? JSON.stringify(payload.sketch.drawing_json)
            : null,
        ],
      );
    for (const link of payload.links)
      await query.query(
        `insert into est.crash_link (tenant_id, crash_record_id, kind, target_id, target_number)
         values (auth.current_tenant(), $1, $2, $3, $4)`,
        [crashId, link.kind, link.target_id, link.target_number ?? null],
      );
  }

  private async warnings(
    query: SqlQueryable,
    item: SyncEntityApplierItem,
    payload: Payload,
  ): Promise<string[]> {
    const warnings: string[] = [];
    if (payload.evidenceLocalIds.length) {
      const result = await query.query<{ status: string }>(
        `select status from ops.evidence_evidence
          where id = any($1::uuid[])`,
        [payload.evidenceLocalIds],
      );
      if (
        result.rows.length !== payload.evidenceLocalIds.length ||
        result.rows.some(
          (row) =>
            !['validated', 'linked', 'packaged', 'archived'].includes(
              row.status,
            ),
        )
      )
        warnings.push('BOAT.SYNC_EVIDENCE_PENDING');
    }
    if (payload.links.length) {
      // A link is intentionally external to BOAT. It remains materialized
      // even when the target aggregate has not arrived yet.
      const unresolved = await Promise.all(
        payload.links.map(async (link) => {
          const table =
            link.kind === 'ait' ? 'inf.ait_ait' : 'inf.administrative_measure';
          const result = await query.query<{ id: string }>(
            `select id from ${table} where id = $1 limit 1`,
            [link.target_id],
          );
          return result.rows.length === 0;
        }),
      );
      if (unresolved.some(Boolean)) warnings.push('BOAT.SYNC_LINK_UNRESOLVED');
    }
    return warnings;
  }
}
