import { BadRequestException, Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';

import type { OperationalRecord } from './entities/operational-record.entity.js';
import { OperationalRecordRepository } from './repositories/operational-record.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export type OperationalRecordKind =
  | 'CLINIC_INSPECTION'
  | 'CREDENTIALING_STATUS'
  | 'SANCTION'
  | 'DASHBOARD_SNAPSHOT'
  | 'BACKUP_DRILL'
  | 'SUPPORT_TICKET'
  | 'RELEASE_WINDOW';

export interface RecordOperationalControlCommand {
  recordKind: OperationalRecordKind;
  subjectType: string;
  subjectId?: string;
  clinicId?: string;
  status: string;
  payload: Record<string, unknown>;
}

export interface ValidateClinicLocationCommand {
  clinicId: string;
  stationId?: string;
  latitude: number;
  longitude: number;
  expectedLatitude: number;
  expectedLongitude: number;
  maxDistanceMeters: number;
}

export interface OperationalDashboardRow {
  recordKind: string;
  status: string;
  total: number;
}

const KINDS = new Set<OperationalRecordKind>([
  'CLINIC_INSPECTION',
  'CREDENTIALING_STATUS',
  'SANCTION',
  'DASHBOARD_SNAPSHOT',
  'BACKUP_DRILL',
  'SUPPORT_TICKET',
  'RELEASE_WINDOW',
]);
const CANONICAL_CODE = /^[A-Z][A-Z0-9_]{1,79}$/u;

@Injectable()
export class OperationalControlService {
  constructor(
    private readonly records: OperationalRecordRepository,
    private readonly requestContext: RequestContext,
  ) {}

  record(command: RecordOperationalControlCommand): Promise<OperationalRecord> {
    if (!KINDS.has(command.recordKind)) {
      throw new BadRequestException('Unsupported operational record kind');
    }
    const subjectType = this.canonical(command.subjectType, 'subject type');
    const status = this.canonical(command.status, 'status');
    return this.insert(
      command.recordKind,
      subjectType,
      command.subjectId ?? null,
      command.clinicId ?? null,
      status,
      command.payload,
    );
  }

  validateClinicLocation(
    command: ValidateClinicLocationCommand,
  ): Promise<OperationalRecord> {
    this.requireCoordinates(command);
    const distanceMeters = haversineMeters(
      command.latitude,
      command.longitude,
      command.expectedLatitude,
      command.expectedLongitude,
    );
    return this.insert(
      'CLINIC_LOCATION',
      'CLINIC',
      command.clinicId,
      command.clinicId,
      distanceMeters <= command.maxDistanceMeters ? 'IN_RANGE' : 'OUT_OF_RANGE',
      {
        latitude: command.latitude,
        longitude: command.longitude,
        expectedLatitude: command.expectedLatitude,
        expectedLongitude: command.expectedLongitude,
        maxDistanceMeters: command.maxDistanceMeters,
        distanceMeters,
        stationId: command.stationId ?? null,
      },
    );
  }

  dashboard(): Promise<OperationalDashboardRow[]> {
    return this.records.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        OperationalDashboardRow & Record<string, unknown>
      >(
        `select record_kind as "recordKind", status,
                count(*)::integer as total
           from ch.operational_record
          group by record_kind, status
          order by record_kind, status`,
      );
      return result.rows;
    });
  }

  private insert(
    recordKind: OperationalRecordKind | 'CLINIC_LOCATION',
    subjectType: string,
    subjectId: string | null,
    clinicId: string | null,
    status: string,
    payload: Record<string, unknown>,
  ): Promise<OperationalRecord> {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId) throw new BadRequestException('Actor context is required');
    return this.records.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        OperationalRecord & Record<string, unknown>
      >(
        `insert into ch.operational_record
          (record_kind, subject_type, subject_id, clinic_id,
           status, payload, created_by)
         values ($1, $2, $3, $4, $5, $6::jsonb, $7)
         returning *`,
        [
          recordKind,
          subjectType,
          subjectId,
          clinicId,
          status,
          JSON.stringify(payload),
          actorId,
        ],
      );
      return result.rows[0] as OperationalRecord;
    });
  }

  private canonical(value: string, label: string): string {
    const code = value.trim().toUpperCase();
    if (!CANONICAL_CODE.test(code)) {
      throw new BadRequestException(`${label} must be a canonical code`);
    }
    return code;
  }

  private requireCoordinates(command: ValidateClinicLocationCommand): void {
    const valid =
      Number.isFinite(command.latitude) &&
      command.latitude >= -90 &&
      command.latitude <= 90 &&
      Number.isFinite(command.expectedLatitude) &&
      command.expectedLatitude >= -90 &&
      command.expectedLatitude <= 90 &&
      Number.isFinite(command.longitude) &&
      command.longitude >= -180 &&
      command.longitude <= 180 &&
      Number.isFinite(command.expectedLongitude) &&
      command.expectedLongitude >= -180 &&
      command.expectedLongitude <= 180 &&
      Number.isFinite(command.maxDistanceMeters) &&
      command.maxDistanceMeters > 0;
    if (!valid) {
      throw new BadRequestException(
        'Valid coordinates and a positive maximum distance are required',
      );
    }
  }
}

export function haversineMeters(
  latitude: number,
  longitude: number,
  expectedLatitude: number,
  expectedLongitude: number,
): number {
  const radiusMeters = 6_371_000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const deltaLatitude = toRadians(expectedLatitude - latitude);
  const deltaLongitude = toRadians(expectedLongitude - longitude);
  const lat1 = toRadians(latitude);
  const lat2 = toRadians(expectedLatitude);
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLongitude / 2) ** 2;
  return Math.round(
    radiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
  );
}
