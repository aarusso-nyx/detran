import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import type { DriverProcessType, RenachPort } from '@detran/senatran-adapter';
import { withTenantContext } from '@detran/shared';

import { PEC_RENACH_PORT } from './pec-renach-transmission.service.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

interface EncounterProcessSource {
  id: string;
  patient_id: string;
  patient_cpf: string;
  renach_process_key: string | null;
  renach_process_type: DriverProcessType | null;
  current_category: string | null;
  requested_category: string | null;
}

export interface OpenRenachProcessCommand {
  processType: DriverProcessType;
  currentCategory?: string;
  requestedCategory?: string;
}

export interface RenachProcessBindingResult {
  encounterId: string;
  renachProcessKey: string;
  status: 'OPENED' | 'ALREADY_OPEN' | 'LOCAL_ALREADY_LINKED';
  requestId?: string;
}

const PROCESS_TYPES = new Set<DriverProcessType>([
  'FIRST_LICENSE',
  'RENEWAL',
  'CATEGORY_CHANGE',
  'CATEGORY_ADDITION',
]);

@Injectable()
export class PecRenachProcessService {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
    @Inject(PEC_RENACH_PORT) private readonly renach: RenachPort,
  ) {}

  async openAndBind(
    encounterId: string,
    command: OpenRenachProcessCommand,
  ): Promise<RenachProcessBindingResult> {
    if (!PROCESS_TYPES.has(command.processType)) {
      throw new BadRequestException('Unsupported RENACH process type');
    }
    const source = await this.loadEncounter(encounterId);
    if (source.renach_process_key) {
      this.assertCompatibleBinding(source, command);
      return this.localResult(source.id, source.renach_process_key);
    }

    const context = this.requestContext.snapshot();
    const process = await this.renach.openProcess(
      {
        cpf: source.patient_cpf,
        processType: command.processType,
        currentCategory: command.currentCategory,
        requestedCategory: command.requestedCategory,
      },
      {
        tenantId: context.tenantId,
        actorId: context.actorId,
        correlationId: context.requestId,
        metadata: {
          idempotencyKey: `ch.encounter:${encounterId}:renach:${command.processType}`,
        },
      },
    );
    if (!process.renachNumber) {
      throw new Error('RENACH process response has no process key');
    }
    if (process.processType && process.processType !== command.processType) {
      throw new ConflictException(
        'RENACH returned a process with a different process type',
      );
    }

    const status = process.openingResult ?? 'OPENED';
    const binding = await this.bindProcess(
      encounterId,
      source.patient_id,
      process.renachNumber,
      command,
    );
    if (binding === 'LOCAL_ALREADY_LINKED') {
      return this.localResult(encounterId, process.renachNumber);
    }
    return {
      encounterId,
      renachProcessKey: process.renachNumber,
      status,
      ...(process.protocol ? { requestId: process.protocol } : {}),
    };
  }

  private async loadEncounter(
    encounterId: string,
  ): Promise<EncounterProcessSource> {
    const result = await this.transaction((tx) =>
      tx.query<EncounterProcessSource>(
        `select encounter.id, encounter.patient_id,
                patient.national_id as patient_cpf,
                encounter.renach_process_key, encounter.renach_process_type,
                encounter.current_category, encounter.requested_category
           from ch.encounter encounter
           join ch.patient patient on patient.id = encounter.patient_id
          where encounter.id = $1`,
        [encounterId],
      ),
    );
    const source = result.rows[0];
    if (!source)
      throw new NotFoundException(`Encounter ${encounterId} not found`);
    return source;
  }

  private bindProcess(
    encounterId: string,
    patientId: string,
    renachProcessKey: string,
    command: OpenRenachProcessCommand,
  ): Promise<'BOUND' | 'LOCAL_ALREADY_LINKED'> {
    return this.bindProcessTransaction(
      encounterId,
      patientId,
      renachProcessKey,
      command,
    ).catch((error: unknown) => {
      if (isPostgresUniqueViolation(error)) {
        throw new ConflictException(
          'RENACH process key is already linked to another encounter',
        );
      }
      throw error;
    });
  }

  private bindProcessTransaction(
    encounterId: string,
    patientId: string,
    renachProcessKey: string,
    command: OpenRenachProcessCommand,
  ): Promise<'BOUND' | 'LOCAL_ALREADY_LINKED'> {
    return this.transaction(async (tx) => {
      const current = await tx.query<{
        patient_id: string;
        renach_process_key: string | null;
        renach_process_type: DriverProcessType | null;
        current_category: string | null;
        requested_category: string | null;
      }>(
        `select patient_id, renach_process_key, renach_process_type,
                current_category, requested_category
           from ch.encounter where id = $1 for update`,
        [encounterId],
      );
      const row = current.rows[0];
      if (!row)
        throw new NotFoundException(`Encounter ${encounterId} not found`);
      if (row.patient_id !== patientId) {
        throw new ConflictException(
          'Encounter patient changed during RENACH opening',
        );
      }
      if (row.renach_process_key) {
        if (row.renach_process_key === renachProcessKey) {
          this.assertCompatibleBinding(row, command);
          return 'LOCAL_ALREADY_LINKED';
        }
        throw new ConflictException(
          'Encounter was linked to a different RENACH process concurrently',
        );
      }

      const conflict = await tx.query<{ id: string }>(
        `select id from ch.encounter
          where renach_process_key = $1 and id <> $2
          limit 1`,
        [renachProcessKey, encounterId],
      );
      if (conflict.rows[0]) {
        throw new ConflictException(
          'RENACH process key is already linked to another encounter',
        );
      }

      const updated = await tx.query<{ id: string }>(
        `update ch.encounter
            set renach_process_key = $2, renach_process_type = $3,
                current_category = $4, requested_category = $5,
                updated_at = now()
          where id = $1 and renach_process_key is null
          returning id`,
        [
          encounterId,
          renachProcessKey,
          command.processType,
          command.currentCategory ?? null,
          command.requestedCategory ?? null,
        ],
      );
      if (!updated.rows[0]) {
        throw new ConflictException('RENACH process binding did not persist');
      }
      return 'BOUND';
    });
  }

  private assertCompatibleBinding(
    binding: Pick<
      EncounterProcessSource,
      'renach_process_type' | 'current_category' | 'requested_category'
    >,
    command: OpenRenachProcessCommand,
  ): void {
    if (binding.renach_process_type !== command.processType) {
      throw new ConflictException(
        'Encounter is already linked to a different RENACH process type',
      );
    }
    if (
      command.currentCategory !== undefined &&
      binding.current_category !== command.currentCategory
    ) {
      throw new ConflictException(
        'RENACH process replay has a different current category',
      );
    }
    if (
      command.requestedCategory !== undefined &&
      binding.requested_category !== command.requestedCategory
    ) {
      throw new ConflictException(
        'RENACH process replay has a different requested category',
      );
    }
  }

  private localResult(
    encounterId: string,
    renachProcessKey: string,
  ): RenachProcessBindingResult {
    return {
      encounterId,
      renachProcessKey,
      status: 'LOCAL_ALREADY_LINKED',
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

function isPostgresUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505'
  );
}
