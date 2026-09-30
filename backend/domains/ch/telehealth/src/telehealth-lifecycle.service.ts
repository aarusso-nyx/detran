import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';

import type { TelehealthSession } from './entities/telehealth-session.entity.js';
import { TelehealthSessionRepository } from './repositories/telehealth-session.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export interface StartTelehealthCommand {
  encounterId: string;
  professionalId: string;
  appointmentId?: string;
  provider: string;
  externalSessionId: string;
  lfdRequired?: boolean;
  lfdPassed: boolean;
}

const CANONICAL_PROVIDER = /^[A-Z][A-Z0-9_]{1,63}$/u;

@Injectable()
export class TelehealthLifecycleService {
  constructor(
    private readonly sessions: TelehealthSessionRepository,
    private readonly requestContext: RequestContext,
  ) {}

  start(command: StartTelehealthCommand): Promise<TelehealthSession> {
    const actorId = this.requireActor();
    const provider = command.provider.trim().toUpperCase();
    const externalSessionId = command.externalSessionId.trim();
    if (!CANONICAL_PROVIDER.test(provider))
      throw new BadRequestException('Provider must be a canonical code');
    if (!externalSessionId || /[/?#]/u.test(externalSessionId))
      throw new BadRequestException(
        'External session id must be opaque and contain no URL credential material',
      );
    if ((command.lfdRequired ?? true) && !command.lfdPassed)
      throw new BadRequestException('Telehealth start requires passing LFD');

    return this.sessions
      .transaction(async (transaction) => {
        const result = await (transaction as SqlTransaction).query<
          TelehealthSession & Record<string, unknown>
        >(
          `insert into ch.telehealth_session
            (encounter_id, professional_id, appointment_id, provider,
             external_session_id, lfd_required, lfd_passed, created_by)
           select encounter.id, professional.id, $3, $4, $5, $6, $7, $8
             from ch.encounter encounter
             join ch.professional professional
               on professional.id = $2 and professional.clinic_id = encounter.clinic_id
            where encounter.id = $1
              and ($3::uuid is null or encounter.appointment_id = $3)
           returning *`,
          [
            command.encounterId,
            command.professionalId,
            command.appointmentId ?? null,
            provider,
            externalSessionId,
            command.lfdRequired ?? true,
            command.lfdPassed,
            actorId,
          ],
        );
        const session = result.rows[0];
        if (!session)
          throw new NotFoundException(
            'Encounter, professional, or appointment is not eligible for telehealth',
          );
        return session;
      })
      .catch((error: unknown) => {
        if (isUniqueViolation(error))
          throw new ConflictException(
            'External telehealth session already exists',
          );
        throw error;
      });
  }

  conclude(
    id: string,
    conclusion: Record<string, unknown>,
    lfdPassed: boolean,
    createBillableItem = false,
  ): Promise<TelehealthSession> {
    const actorId = this.requireActor();
    if (!lfdPassed)
      throw new BadRequestException(
        'Telehealth conclusion requires passing LFD',
      );
    return this.sessions.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const result = await tx.query<
        TelehealthSession & Record<string, unknown>
      >(
        `update ch.telehealth_session
            set status = 'COMPLETED', lfd_passed = true, completed_at = now(),
                conclusion = $2::jsonb, updated_at = now()
          where id = $1 and status = 'STARTED' returning *`,
        [id, JSON.stringify(conclusion)],
      );
      const session = result.rows[0];
      if (!session)
        throw new NotFoundException(
          `Started telehealth session ${id} not found`,
        );
      if (createBillableItem) {
        await tx.query(
          `insert into ch.billing_item
            (encounter_id, telehealth_session_id, item_kind, source,
             amount_cents, status, payload, created_by)
           values ($1, $2, 'TELEHEALTH', 'TELEHEALTH', 0, 'ISSUED',
                   jsonb_build_object('sessionId', $2::uuid), $3)`,
          [session.encounter_id, session.id, actorId],
        );
        await tx.query(
          `insert into ch.process_block
            (encounter_id, block_kind, source_system, message, active, created_by)
           values ($1, 'FINANCIAL', 'BILLING', 'Financial validation pending', true, $2)
           on conflict (tenant_id, encounter_id, block_kind, source_system)
             where active do nothing`,
          [session.encounter_id, actorId],
        );
      }
      return session;
    });
  }

  private requireActor(): string {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId) throw new BadRequestException('Actor context is required');
    return actorId;
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505'
  );
}
