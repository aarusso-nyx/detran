// CTG-0004 §6 (R-0008, TASK-0009, RN-TEAT-115, RN-TEAT-138) —
// `POST /v1/inf/speed/measurements`. Módulo atrás de `teat.speed_meters`
// (default `false`, `app.module.ts`); só teste unitário nesta rodada (M15).
//
// `repositories` pode vir vazio (produção: SQL parametrizado na transação do
// comando, mesmo padrão de `inf/measures`/`inf/alcohol`, CTG-0004 §4/§5) ou
// preenchido pelos dublês de teste — nunca a porta gerada diretamente (que
// lança `NotFoundException` em vez de devolver `undefined`, CTG-0004 §6
// pré-condições precisam do caminho "ausente" para os próprios erros de
// negócio, não um 404 genérico).
import { DetranError } from '@detran/shared';
import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';

export type SpeedRow = Record<string, unknown>;

export interface SpeedRowStore {
  findOne?(id: string): Promise<SpeedRow | undefined>;
  find?(id: string): Promise<SpeedRow | undefined>;
  create?(values: SpeedRow): Promise<SpeedRow>;
}

export interface CreateMeasurementDeps {
  database: Pick<Database, 'tx'>;
  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>;
  repositories: {
    measurements?: SpeedRowStore;
    meters?: SpeedRowStore;
    certificates?: SpeedRowStore;
  };
  clock: { now(): string };
}

export interface CreateSpeedMeasurementInput {
  meter_id: string;
  certificate_id: string;
  measured_kmh: number;
  max_error_kmh: number;
  considered_kmh?: number;
  road_limit_kmh: number;
  measured_at: string;
  latitude: number;
  longitude: number;
  plate_image_evidence_id?: string;
  ocr_plate_proposed?: string;
  plate_validated_by_agent?: boolean;
  ait_id?: string;
  agent_id: string;
}

interface SqlQueryable {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

function asQueryable(tx: unknown): SqlQueryable | undefined {
  const candidate = tx as Partial<SqlQueryable> | null | undefined;
  return candidate && typeof candidate.query === 'function'
    ? (candidate as SqlQueryable)
    : undefined;
}

async function findOne(
  store: SpeedRowStore | undefined,
  tx: unknown,
  table: string,
  id: string,
): Promise<SpeedRow | undefined> {
  if (typeof store?.find === 'function') return store.find(id);
  if (typeof store?.findOne === 'function') return store.findOne(id);
  const sql = asQueryable(tx);
  if (!sql) return undefined;
  const result = await sql.query(`select * from ${table} where id = $1`, [id]);
  return result.rows[0];
}

async function insertOne(
  store: SpeedRowStore | undefined,
  tx: unknown,
  table: string,
  values: SpeedRow,
): Promise<SpeedRow> {
  if (typeof store?.create === 'function') return store.create(values);
  const sql = asQueryable(tx);
  if (!sql)
    throw new Error(`Sem porta nem transação para escrever em ${table}`);
  const columns = Object.keys(values);
  if (columns.some((column) => !/^[a-z_]+$/.test(column)))
    throw new Error('Coluna inválida em escrita de velocidade');
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const result = await sql.query(
    `insert into ${table} (${columns.join(', ')}) values (${placeholders}) returning *`,
    columns.map((column) => values[column] ?? null),
  );
  return (result.rows[0] ?? values) as SpeedRow;
}

function isPlateConfirmed(input: CreateSpeedMeasurementInput): boolean {
  return input.plate_validated_by_agent === true;
}

export class CreateMeasurementCommand {
  constructor(private readonly deps: CreateMeasurementDeps) {}

  async execute(
    input: CreateSpeedMeasurementInput,
  ): Promise<Record<string, unknown>> {
    // Contexto utilizável = ativo e com tenant (STYNX 1.5.0 abre o contexto
    // no middleware, antes de tenant/ator); fail-closed sem tenant.
    if (
      !this.deps.requestContext.hasActiveContext() ||
      !this.deps.requestContext.snapshot().tenantId
    )
      throw new Error('Um comando de velocidade exige contexto de requisição');

    return this.deps.database.tx(async (tx) => {
      // 1. certificado do medidor vigente.
      const certificate = await findOne(
        this.deps.repositories.certificates,
        tx,
        'inf.speed_meter_certificate',
        input.certificate_id,
      );
      const validUntil =
        typeof certificate?.valid_until === 'string'
          ? certificate.valid_until
          : '';
      if (
        !certificate ||
        validUntil.slice(0, 10) < input.measured_at.slice(0, 10)
      )
        throw new DetranError('TEAT.AIT_EQUIPMENT_REQUIRED', {
          status: 422,
          context: {
            framingId: null,
            meterId: input.meter_id,
            certificateId: input.certificate_id,
          },
          message: 'Certificado do medidor de velocidade vencido ou ausente.',
        });

      // 2. ait_id exige placa confirmada e excesso sobre o limite.
      if (input.ait_id) {
        if (!isPlateConfirmed(input))
          throw new DetranError('TEAT.AIT_PLATE_NOT_CONFIRMED', {
            status: 422,
            context: { aitId: input.ait_id },
            message: 'Placa não confirmada pelo agente.',
          });
        const considered = input.measured_kmh - input.max_error_kmh;
        if (
          !input.plate_image_evidence_id ||
          !(considered > input.road_limit_kmh)
        )
          throw new DetranError('TEAT.VALIDATION_FAILED', {
            status: 422,
            context: {
              fields: [{ path: 'plate_image_evidence_id', rule: 'required' }],
            },
            message:
              'Vínculo ao AIT exige evidência de placa e excesso sobre o limite.',
          });
      }

      // 3. `considered_kmh` derivado (check do blueprint).
      const considered = input.measured_kmh - input.max_error_kmh;
      if (
        input.considered_kmh !== undefined &&
        Math.abs(input.considered_kmh - considered) > 1e-9
      )
        throw new DetranError('TEAT.VALIDATION_FAILED', {
          status: 422,
          context: {
            fields: [{ path: 'considered_kmh', rule: 'derived' }],
          },
          message: 'considered_kmh deve ser measured_kmh − max_error_kmh.',
        });

      const measurement = await insertOne(
        this.deps.repositories.measurements,
        tx as Transaction,
        'inf.speed_measurement',
        {
          meter_id: input.meter_id,
          certificate_id: input.certificate_id,
          measured_kmh: input.measured_kmh,
          max_error_kmh: input.max_error_kmh,
          considered_kmh: considered,
          road_limit_kmh: input.road_limit_kmh,
          measured_at: input.measured_at,
          latitude: input.latitude,
          longitude: input.longitude,
          plate_image_evidence_id: input.plate_image_evidence_id ?? null,
          ocr_plate_proposed: input.ocr_plate_proposed ?? null,
          plate_validated_by_agent: input.plate_validated_by_agent ?? false,
          ait_id: input.ait_id ?? null,
          agent_id: input.agent_id,
        },
      );

      return {
        id: measurement.id,
        measured_kmh: input.measured_kmh,
        max_error_kmh: input.max_error_kmh,
        considered_kmh: considered,
        road_limit_kmh: input.road_limit_kmh,
        ait_id: input.ait_id ?? null,
      };
    });
  }
}
