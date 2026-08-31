import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';

import type { ClinicalControlEvent } from './entities/clinical-control-event.entity.js';
import { ClinicalControlEventRepository } from './repositories/clinical-control-event.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export type ClinicalControlKind =
  | 'OPHTHALMOLOGY'
  | 'SLEEP'
  | 'DEVOLUTIVE'
  | 'SATISFACTION'
  | 'INTERN_DOUBLE_VALIDATION';

export interface RecordClinicalControlCommand {
  encounterId: string;
  medicalExamId?: string;
  psychologicalExamId?: string;
  controlKind: ClinicalControlKind;
  payload: Record<string, unknown>;
}

const REQUIRED_PAYLOAD: Record<ClinicalControlKind, readonly string[]> = {
  OPHTHALMOLOGY: [
    'visualAcuityLeft',
    'visualAcuityRight',
    'colorVision',
    'fieldOfVision',
  ],
  SLEEP: ['epworthScore', 'polysomnographyRequired'],
  DEVOLUTIVE: ['deliveredAt', 'summary'],
  SATISFACTION: ['score', 'channel'],
  INTERN_DOUBLE_VALIDATION: ['internId', 'supervisorId', 'validatedAt'],
};

@Injectable()
export class ClinicalControlLifecycleService {
  constructor(
    private readonly events: ClinicalControlEventRepository,
    private readonly requestContext: RequestContext,
  ) {}

  record(command: RecordClinicalControlCommand): Promise<ClinicalControlEvent> {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId) throw new BadRequestException('Actor context is required');
    if (command.medicalExamId && command.psychologicalExamId) {
      throw new BadRequestException(
        'A clinical control may reference at most one typed exam',
      );
    }
    this.assertPayload(command.controlKind, command.payload);

    return this.events.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        ClinicalControlEvent & Record<string, unknown>
      >(
        `insert into ch.clinical_control_event
          (encounter_id, medical_exam_id, psychological_exam_id,
           control_kind, payload, recorded_by)
         select encounter.id, $2, $3, $4, $5::jsonb, $6
           from ch.encounter encounter
          where encounter.id = $1
            and ($2::uuid is null or exists (
              select 1 from ch.medical_exam exam
               where exam.id = $2 and exam.encounter_id = encounter.id
            ))
            and ($3::uuid is null or exists (
              select 1 from ch.psychological_exam exam
               where exam.id = $3 and exam.encounter_id = encounter.id
            ))
         returning *`,
        [
          command.encounterId,
          command.medicalExamId ?? null,
          command.psychologicalExamId ?? null,
          command.controlKind,
          JSON.stringify(command.payload),
          actorId,
        ],
      );
      const event = result.rows[0];
      if (!event) {
        throw new NotFoundException(
          'Encounter or same-encounter exam reference not found',
        );
      }
      return event;
    });
  }

  private assertPayload(
    kind: ClinicalControlKind,
    payload: Record<string, unknown>,
  ): void {
    const required = REQUIRED_PAYLOAD[kind];
    if (!required) {
      throw new BadRequestException('Unsupported clinical control kind');
    }
    const missing = required.filter(
      (key) => payload[key] === undefined || payload[key] === null,
    );
    if (missing.length > 0) {
      throw new BadRequestException(
        `${kind} payload missing required fields: ${missing.join(', ')}`,
      );
    }
    if (
      kind === 'INTERN_DOUBLE_VALIDATION' &&
      payload.internId === payload.supervisorId
    ) {
      throw new BadRequestException(
        'Intern and supervising professional must be distinct',
      );
    }
  }
}
