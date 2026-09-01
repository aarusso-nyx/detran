import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';

import type { Inconsistency } from './entities/inconsistency.entity.js';
import { InconsistencyRepository } from './repositories/inconsistency.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export type InconsistencySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DetectInconsistencyCommand {
  encounterId?: string;
  sourceSystem: string;
  severity: InconsistencySeverity;
  detectionReason: string;
  payload?: Record<string, unknown>;
}

export interface CorrectInconsistencyCommand {
  correction: Record<string, unknown>;
  resolutionNote?: string;
}

const SEVERITIES = new Set<InconsistencySeverity>([
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
]);
const CANONICAL_SOURCE = /^[A-Z][A-Z0-9_]{1,79}$/u;

@Injectable()
export class InconsistencyLifecycleService {
  constructor(
    private readonly inconsistencies: InconsistencyRepository,
    private readonly requestContext: RequestContext,
  ) {}

  detect(command: DetectInconsistencyCommand): Promise<Inconsistency> {
    const actorId = this.requireActor();
    const sourceSystem = command.sourceSystem.trim().toUpperCase();
    const detectionReason = command.detectionReason.trim();
    if (!CANONICAL_SOURCE.test(sourceSystem)) {
      throw new BadRequestException('Source system must be a canonical code');
    }
    if (!SEVERITIES.has(command.severity)) {
      throw new BadRequestException('Unsupported inconsistency severity');
    }
    if (detectionReason.length < 5 || detectionReason.length > 500) {
      throw new BadRequestException(
        'Detection reason must contain between 5 and 500 characters',
      );
    }

    return this.inconsistencies.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        Inconsistency & Record<string, unknown>
      >(
        `insert into ch.inconsistency
          (encounter_id, source_system, severity, detection_reason,
           detection_payload, due_at, created_by)
         select $1, $2, $3, $4, $5::jsonb, now() + interval '2 days', $6
          where $1::uuid is null or exists (
            select 1 from ch.encounter where id = $1
          )
         returning *`,
        [
          command.encounterId ?? null,
          sourceSystem,
          command.severity,
          detectionReason,
          JSON.stringify(command.payload ?? {}),
          actorId,
        ],
      );
      const inconsistency = result.rows[0];
      if (!inconsistency) {
        throw new NotFoundException('Encounter not found');
      }
      return inconsistency;
    });
  }

  notify(id: string): Promise<Inconsistency> {
    return this.transition(id, 'DETECTED', 'NOTIFIED', 'notified_at');
  }

  correct(
    id: string,
    command: CorrectInconsistencyCommand,
  ): Promise<Inconsistency> {
    const actorId = this.requireActor();
    return this.inconsistencies.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        Inconsistency & Record<string, unknown>
      >(
        `update ch.inconsistency
            set status = 'CORRECTED', correction = $2::jsonb,
                resolution_note = $3, corrected_at = now(),
                updated_by = $4, updated_at = now()
          where id = $1 and status = 'NOTIFIED'
          returning *`,
        [
          id,
          JSON.stringify(command.correction),
          command.resolutionNote?.trim() || null,
          actorId,
        ],
      );
      return this.requireResult(result.rows[0], 'NOTIFIED', 'CORRECTED');
    });
  }

  reprocess(id: string): Promise<Inconsistency> {
    return this.transition(id, 'CORRECTED', 'REPROCESSED', 'reprocessed_at');
  }

  close(id: string): Promise<Inconsistency> {
    return this.transition(id, 'REPROCESSED', 'CLOSED', 'closed_at');
  }

  private transition(
    id: string,
    from: 'DETECTED' | 'CORRECTED' | 'REPROCESSED',
    to: 'NOTIFIED' | 'REPROCESSED' | 'CLOSED',
    timestampColumn: 'notified_at' | 'reprocessed_at' | 'closed_at',
  ): Promise<Inconsistency> {
    const actorId = this.requireActor();
    return this.inconsistencies.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        Inconsistency & Record<string, unknown>
      >(
        `update ch.inconsistency
            set status = $2, ${timestampColumn} = now(),
                updated_by = $3, updated_at = now()
          where id = $1 and status = $4
          returning *`,
        [id, to, actorId, from],
      );
      return this.requireResult(result.rows[0], from, to);
    });
  }

  private requireResult(
    result: Inconsistency | undefined,
    from: string,
    to: string,
  ): Inconsistency {
    if (!result) {
      throw new ConflictException(
        `Inconsistency must be ${from} before transition to ${to}`,
      );
    }
    return result;
  }

  private requireActor(): string {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId) throw new BadRequestException('Actor context is required');
    return actorId;
  }
}
