// CTG-0003 §5.1 e §5.2 (M12, R-0008, TASK-0007) — `POST/GET
// /v1/ops/snapshots/external-queries`.
//
// A consulta sai por `SNAPSHOT_QUERY_PORTS`; nenhum `fetch` nasce aqui
// (ADR-0003, C-0003-35). Toda tentativa é escriturada em
// `ops.snapshots_external_query`, inclusive as que falham — a auditoria da
// consulta é o efeito, e por isso a linha de `not_found`/`failed` é gravada
// em transação própria antes da exceção. As leituras de congelamento
// acontecem antes da transação de escrita, que fica com um único ciclo.
import { DetranError } from '@detran/shared';

import {
  agencyOfPrincipal,
  findRowsWhere,
  insertRow,
  inTenantTransaction,
  listRows,
  parametersHashOf,
  patchRow,
  stringOf,
  tenantScope,
  validationFailed,
  type DriverRecord,
  type SnapshotRow,
  type SnapshotsDeps,
  type VehicleRecord,
} from './snapshots-runtime.js';

export const EXTERNAL_QUERY_TYPES = [
  'vehicle_by_plate',
  'driver_by_cpf',
  'driver_by_license',
] as const;

export type ExternalQueryType = (typeof EXTERNAL_QUERY_TYPES)[number];

/**
 * `snapshots_external_query.external_system_id` é `not null` e nenhum
 * blueprint `ops` define uma tabela de sistemas externos: os identificadores
 * por porta são os fixados em CTG-0003 §13 item 10 (OD-T34).
 */
const EXTERNAL_SYSTEM_IDS: Record<ExternalQueryType, string> = {
  vehicle_by_plate: '00000000-0000-7000-8000-0000ef800001',
  driver_by_cpf: '00000000-0000-7000-8000-0000ef800002',
  driver_by_license: '00000000-0000-7000-8000-0000ef800002',
};

const SOURCE_BY_TYPE: Record<ExternalQueryType, 'wsdenatran' | 'renach'> = {
  vehicle_by_plate: 'wsdenatran',
  driver_by_cpf: 'renach',
  driver_by_license: 'renach',
};

/** Campos congelados comparados campo a campo (§5.1, `divergence_recorded`). */
const VEHICLE_COMPARED_FIELDS = [
  'plate',
  'renavam',
  'chassis',
  'uf',
  'make_model',
] as const;

const PERSON_COMPARED_FIELDS = ['name', 'cpf', 'birth_date'] as const;

export interface CreateExternalQueryInput {
  query_type: string;
  parameters: Record<string, unknown>;
  purpose: string;
  traffic_agency_id?: string;
  agent_id?: string;
  device_id?: string;
}

export interface CreateExternalQueryResult {
  snapshot_id: string;
  source: string;
  queried_at: string;
  result: VehicleRecord | DriverRecord;
  divergence_recorded: boolean;
}

export interface ExternalQueryListItem {
  id: string;
  query_type: string;
  purpose: string;
  queried_at: string;
  status: string;
  parameters_hash: string;
  user_ref: string;
  agent_id: string | null;
  device_id: string | null;
}

export interface ExternalQueryListFilters {
  query_type?: string;
  purpose?: string;
  agent_id?: string;
  from?: string;
  to?: string;
}

interface ParsedQuery {
  queryType: ExternalQueryType;
  parameters: Record<string, unknown>;
  purpose: string;
  parametersHash: string;
  trafficAgencyId?: string;
  agentId: string | null;
  deviceId: string | null;
}

export class ExternalQueryCommand {
  constructor(private readonly deps: SnapshotsDeps) {}

  async execute(
    input: CreateExternalQueryInput,
  ): Promise<CreateExternalQueryResult> {
    const parsed = parse(input);
    const { actorId } = tenantScope(this.deps);
    const queriedAt = this.deps.clock.now();
    const source = SOURCE_BY_TYPE[parsed.queryType];
    const trafficAgencyId = await this.resolveAgency(parsed, actorId);
    const base = this.queryRow(parsed, queriedAt, actorId, trafficAgencyId);

    let record: VehicleRecord | DriverRecord | undefined;
    try {
      record = await this.callPort(parsed);
    } catch (cause) {
      await this.record({
        ...base,
        status: 'failed',
        result_summary: codeOf(cause),
      });
      throw new DetranError('TEAT.QUERY_UPSTREAM_UNAVAILABLE', {
        status: 503,
        context: { queryType: parsed.queryType },
        message: 'Sistema nacional indisponível para a consulta.',
        cause,
      });
    }

    if (!record) {
      await this.record({ ...base, status: 'not_found' });
      throw new DetranError('TEAT.QUERY_NOT_FOUND', {
        status: 404,
        context: { queryType: parsed.queryType },
        message: 'Consulta sem registro no sistema nacional.',
      });
    }

    const found = record;
    const frozen =
      parsed.queryType === 'vehicle_by_plate'
        ? vehicleRow(found as VehicleRecord, parsed, source)
        : personRow(found as DriverRecord, parsed, source);
    const existing = await this.findFrozen(parsed, frozen);
    const divergenceRecorded = existing
      ? comparedFieldsOf(parsed).some(
          (field) =>
            normalizeField(existing[field]) !== normalizeField(frozen[field]),
        )
      : false;

    return inTenantTransaction(this.deps, async (tx) => {
      const query = await insertRow(this.deps, tx, 'externalQueries', {
        ...base,
        status: 'ok',
        result_summary: source,
        result_snapshot_json: found as unknown as Record<string, unknown>,
      });

      const table =
        parsed.queryType === 'vehicle_by_plate' ? 'vehicles' : 'persons';
      const stored = existing
        ? ((await patchRow(
            this.deps,
            tx,
            table,
            stringOf(existing.id),
            frozen,
          )) ?? existing)
        : await insertRow(this.deps, tx, table, frozen);

      if (parsed.queryType !== 'vehicle_by_plate') {
        const driver = found as DriverRecord;
        if (driver.licenseNumber)
          await insertRow(this.deps, tx, 'personDocuments', {
            person_id: stringOf(stored.id),
            document_type: 'cnh',
            document_number: stringOf(driver.licenseNumber),
            issuing_uf: driver.licenseState ?? null,
            valid_until: driver.licenseExpiresAt ?? null,
            license_category: driver.currentCategory ?? null,
            status: driver.licenseStatus ?? null,
            source,
          });
        return {
          snapshot_id: stringOf(stored.id),
          source,
          queried_at: queriedAt,
          result: found,
          divergence_recorded: divergenceRecorded,
        };
      }

      const vehicle = found as VehicleRecord;
      const snapshot = await insertRow(this.deps, tx, 'vehicleSnapshots', {
        vehicle_id: stringOf(stored.id),
        plate_snapshot: stringOf(frozen.plate),
        renavam_snapshot: vehicle.renavam ?? null,
        make_model_snapshot: vehicle.makeModelDescription ?? null,
        species_snapshot: null,
        category_snapshot: null,
        color_snapshot: null,
        data_source: source,
        external_query_id: stringOf(query.id),
        divergence_recorded: divergenceRecorded,
        payload_json: vehicle as unknown as Record<string, unknown>,
      });

      return {
        snapshot_id: stringOf(snapshot.id),
        source,
        queried_at: queriedAt,
        result: found,
        divergence_recorded: divergenceRecorded,
      };
    });
  }

  /** §5.2 — `parameters` nunca sai na leitura: só o hash. */
  async list(
    filters: ExternalQueryListFilters = {},
  ): Promise<{ items: ExternalQueryListItem[]; nextCursor: null }> {
    const rows = await inTenantTransaction(this.deps, (tx) =>
      listRows(this.deps, tx, 'externalQueries'),
    );
    const items = rows
      .filter((row) => matches(row, filters))
      .map((row) => ({
        id: stringOf(row.id),
        query_type: stringOf(row.query_type),
        purpose: stringOf(row.purpose),
        queried_at: isoOf(row.queried_at),
        status: stringOf(row.status),
        parameters_hash: stringOf(row.parameters_hash),
        user_ref: stringOf(row.user_ref),
        agent_id: row.agent_id ? stringOf(row.agent_id) : null,
        device_id: row.device_id ? stringOf(row.device_id) : null,
      }));
    return { items, nextCursor: null };
  }

  private callPort(
    parsed: ParsedQuery,
  ): Promise<VehicleRecord | DriverRecord | undefined> {
    const ports = this.deps.ports;
    if (parsed.queryType === 'vehicle_by_plate')
      return ports.wsdenatranRead.findVehicleByPlate(
        stringOf(parsed.parameters.plate),
      );
    if (parsed.queryType === 'driver_by_cpf')
      return ports.renach.findDriverByCpf(stringOf(parsed.parameters.cpf));
    return ports.renach.findDriverByLicense(
      stringOf(parsed.parameters.license_number),
    );
  }

  private findFrozen(
    parsed: ParsedQuery,
    frozen: SnapshotRow,
  ): Promise<SnapshotRow | undefined> {
    const table =
      parsed.queryType === 'vehicle_by_plate' ? 'vehicles' : 'persons';
    const column = table === 'vehicles' ? 'plate' : 'cpf';
    const value = stringOf(frozen[column] ?? '');
    if (!value) return Promise.resolve(undefined);
    return inTenantTransaction(this.deps, async (tx) => {
      const rows = await findRowsWhere(this.deps, tx, table, column, value);
      return rows[0];
    });
  }

  /**
   * §14.3 — o órgão vem do corpo ou do perfil do principal; nunca do id do
   * tenant. Sem fonte, a consulta não é escriturada (fail-closed).
   */
  private async resolveAgency(
    parsed: ParsedQuery,
    actorId: string,
  ): Promise<string> {
    if (parsed.trafficAgencyId) return parsed.trafficAgencyId;
    const fromProfile = await agencyOfPrincipal(this.deps, actorId);
    if (fromProfile) return fromProfile;
    throw validationFailed(
      [{ path: 'traffic_agency_id', rule: 'required' }],
      422,
    );
  }

  private queryRow(
    parsed: ParsedQuery,
    queriedAt: string,
    actorId: string,
    trafficAgencyId: string,
  ): SnapshotRow {
    return {
      traffic_agency_id: trafficAgencyId,
      user_ref: actorId,
      agent_id: parsed.agentId,
      device_id: parsed.deviceId,
      external_system_id: EXTERNAL_SYSTEM_IDS[parsed.queryType],
      query_type: parsed.queryType,
      parameters_hash: parsed.parametersHash,
      purpose: parsed.purpose,
      queried_at: queriedAt,
      protocol: null,
    };
  }

  private async record(values: SnapshotRow): Promise<void> {
    await inTenantTransaction(this.deps, async (tx) => {
      await insertRow(this.deps, tx, 'externalQueries', values);
    });
  }
}

function comparedFieldsOf(parsed: ParsedQuery): readonly string[] {
  return parsed.queryType === 'vehicle_by_plate'
    ? VEHICLE_COMPARED_FIELDS
    : PERSON_COMPARED_FIELDS;
}

function vehicleRow(
  record: VehicleRecord,
  parsed: ParsedQuery,
  source: string,
): SnapshotRow {
  return {
    plate: stringOf(record.plate ?? parsed.parameters.plate ?? ''),
    renavam: record.renavam ?? null,
    chassis: record.chassis ?? null,
    uf: record.jurisdictionState ?? null,
    make_model: record.makeModelDescription ?? null,
    source,
  };
}

function personRow(
  record: DriverRecord,
  parsed: ParsedQuery,
  source: string,
): SnapshotRow {
  const cpf = stringOf(record.cpf ?? parsed.parameters.cpf ?? '');
  return {
    person_type: 'natural',
    name: record.name ?? null,
    cpf: cpf || null,
    birth_date: record.birthDate ?? null,
    mother_name: record.motherName ?? null,
    source,
  };
}

function normalizeField(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function isoOf(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return stringOf(value);
}

function codeOf(cause: unknown): string {
  const candidate = cause as { code?: unknown } | null;
  return typeof candidate?.code === 'string'
    ? candidate.code
    : 'upstream_error';
}

function matches(row: SnapshotRow, filters: ExternalQueryListFilters): boolean {
  if (filters.query_type && row.query_type !== filters.query_type) return false;
  if (filters.purpose && row.purpose !== filters.purpose) return false;
  if (filters.agent_id && stringOf(row.agent_id) !== filters.agent_id)
    return false;
  const queriedAt = isoOf(row.queried_at);
  if (filters.from && queriedAt < filters.from) return false;
  if (filters.to && queriedAt > filters.to) return false;
  return true;
}

function parse(input: CreateExternalQueryInput): ParsedQuery {
  const purpose = stringOf(input?.purpose ?? '').trim();
  if (!purpose)
    throw new DetranError('TEAT.QUERY_PURPOSE_REQUIRED', {
      status: 400,
      context: { field: 'purpose' },
      message: 'A finalidade da consulta é obrigatória.',
    });

  const queryType = stringOf(input?.query_type ?? '');
  if (!(EXTERNAL_QUERY_TYPES as readonly string[]).includes(queryType))
    throw new DetranError('TEAT.ENUM_INVALID', {
      status: 400,
      context: { field: 'query_type', allowed: [...EXTERNAL_QUERY_TYPES] },
      message: 'Tipo de consulta externa fora do conjunto admitido.',
    });

  const parameters =
    input?.parameters && typeof input.parameters === 'object'
      ? (input.parameters as Record<string, unknown>)
      : {};
  const fields: { path: string; rule: string }[] = [];
  if (queryType === 'vehicle_by_plate') {
    const plate = stringOf(parameters.plate ?? '').trim();
    if (plate.length < 7 || plate.length > 8)
      fields.push({ path: 'parameters.plate', rule: 'length' });
  } else if (queryType === 'driver_by_cpf') {
    const cpf = stringOf(parameters.cpf ?? '').trim();
    if (!/^\d{11}$/.test(cpf))
      fields.push({ path: 'parameters.cpf', rule: 'pattern' });
  } else {
    const license = stringOf(parameters.license_number ?? '').trim();
    if (!license)
      fields.push({ path: 'parameters.license_number', rule: 'required' });
  }
  if (fields.length > 0) throw validationFailed(fields);

  return {
    queryType: queryType as ExternalQueryType,
    parameters,
    purpose,
    parametersHash: parametersHashOf(parameters),
    trafficAgencyId: input.traffic_agency_id
      ? stringOf(input.traffic_agency_id)
      : undefined,
    agentId: input.agent_id ? stringOf(input.agent_id) : null,
    deviceId: input.device_id ? stringOf(input.device_id) : null,
  };
}
