import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';

import type { ProcessBlock } from './entities/process-block.entity.js';
import { ProcessBlockRepository } from './repositories/process-block.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export interface CreateProcessBlockCommand {
  encounterId: string;
  blockKind: string;
  sourceSystem?: string;
  message?: string;
}

const CANONICAL_CODE = /^[A-Z][A-Z0-9_]{1,63}$/u;

@Injectable()
export class ProcessBlockLifecycleService {
  constructor(
    private readonly blocks: ProcessBlockRepository,
    private readonly requestContext: RequestContext,
  ) {}

  create(command: CreateProcessBlockCommand): Promise<ProcessBlock> {
    const actorId = this.requireActor();
    const blockKind = command.blockKind.trim().toUpperCase();
    const sourceSystem = (command.sourceSystem ?? 'PEC').trim().toUpperCase();
    if (!CANONICAL_CODE.test(blockKind)) {
      throw new BadRequestException('Block kind must be a canonical code');
    }
    if (!CANONICAL_CODE.test(sourceSystem)) {
      throw new BadRequestException('Source system must be a canonical code');
    }
    const message = command.message?.trim() || null;

    return this.blocks.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        ProcessBlock & Record<string, unknown>
      >(
        `insert into ch.process_block
          (encounter_id, block_kind, source_system, message, active, created_by)
         select encounter.id, $2, $3, $4, true, $5
           from ch.encounter encounter
          where encounter.id = $1
         on conflict (tenant_id, encounter_id, block_kind, source_system)
           where active
         do update set message = excluded.message, updated_at = now()
         returning *`,
        [command.encounterId, blockKind, sourceSystem, message, actorId],
      );
      const block = result.rows[0];
      if (!block) {
        throw new NotFoundException(
          `Encounter ${command.encounterId} not found`,
        );
      }
      return block;
    });
  }

  resolve(id: string): Promise<ProcessBlock> {
    const actorId = this.requireActor();
    return this.blocks.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        ProcessBlock & Record<string, unknown>
      >(
        `update ch.process_block
            set active = false, resolved_by = $2, resolved_at = now(),
                updated_at = now()
          where id = $1 and active
         returning *`,
        [id, actorId],
      );
      const block = result.rows[0];
      if (!block) {
        throw new BadRequestException(`Active process block ${id} not found`);
      }
      return block;
    });
  }

  private requireActor(): string {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId) throw new BadRequestException('Actor context is required');
    return actorId;
  }
}
