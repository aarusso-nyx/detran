import { BadRequestException, Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';

import type { EncounterRestriction } from './entities/encounter-restriction.entity.js';
import { EncounterRestrictionRepository } from './repositories/encounter-restriction.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export interface ApplyRestrictionInput {
  encounterId: string;
  reportId?: string;
  restrictionCodeId: string;
  notes?: string;
}

@Injectable()
export class RestrictionLifecycleService {
  constructor(
    private readonly restrictions: EncounterRestrictionRepository,
    private readonly requestContext: RequestContext,
  ) {}

  apply(input: ApplyRestrictionInput): Promise<EncounterRestriction> {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId)
      throw new BadRequestException('Authenticated actor is required');
    return this.restrictions.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const gate = await tx.query<{
        professional_id: string;
        result: string;
        code_id: string | null;
      }>(
        `select exam.professional_id, exam.result, code.id as code_id
           from ch.medical_exam exam
           join ch.professional professional
             on professional.id = exam.professional_id
            and professional.user_id = $2
           left join ch.restriction_code code
             on code.id = $3 and code.is_active
            and code.effective_from <= current_date
            and (code.effective_to is null or code.effective_to >= current_date)
          where exam.encounter_id = $1`,
        [input.encounterId, actorId, input.restrictionCodeId],
      );
      const row = gate.rows[0];
      if (!row || row.result !== 'APTO_COM_RESTRICOES') {
        throw new BadRequestException(
          'Restrictions require the responsible medical examiner and APTO_COM_RESTRICOES',
        );
      }
      if (!row.code_id) {
        throw new BadRequestException(
          'Restriction code is absent from the active authoritative Anexo XV catalog',
        );
      }
      const result = await tx.query<
        EncounterRestriction & Record<string, unknown>
      >(
        `insert into ch.encounter_restriction
          (encounter_id, report_id, restriction_code_id, prescribed_by, notes)
         values ($1, $2, $3, $4, $5)
         returning *`,
        [
          input.encounterId,
          input.reportId ?? null,
          input.restrictionCodeId,
          row.professional_id,
          input.notes?.trim() ?? null,
        ],
      );
      return result.rows[0] as EncounterRestriction;
    });
  }
}
