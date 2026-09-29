import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';

import type { Complaint } from './entities/complaint.entity.js';
import { ComplaintRepository } from './repositories/complaint.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export interface CreateComplaintCommand {
  protocol?: string;
  complainantName?: string;
  contact?: string;
  category: string;
  description: string;
  payload?: Record<string, unknown>;
}

export interface TransitionComplaintCommand {
  status: 'TRIAGED' | 'IN_REVIEW' | 'CLOSED' | 'REJECTED';
  assignedTo?: string;
  payload?: Record<string, unknown>;
}

@Injectable()
export class ComplaintLifecycleService {
  constructor(
    private readonly complaints: ComplaintRepository,
    private readonly requestContext: RequestContext,
  ) {}

  create(command: CreateComplaintCommand): Promise<Complaint> {
    const category = command.category?.trim().toUpperCase();
    const description = command.description?.trim();
    if (!category || category.length < 2 || category.length > 80) {
      throw new BadRequestException(
        'Complaint category must contain 2-80 characters',
      );
    }
    if (!description || description.length < 10 || description.length > 2000) {
      throw new BadRequestException(
        'Complaint description must contain 10-2000 characters',
      );
    }

    return this.complaints.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        Complaint & Record<string, unknown>
      >(
        `insert into portal.complaint
          (protocol, complainant_name, contact, category, description, payload)
         values
          (coalesce($1, 'OUV-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 8)),
           $2, $3, $4, $5, $6::jsonb)
         returning *`,
        [
          command.protocol?.trim() || null,
          command.complainantName?.trim() || null,
          command.contact?.trim() || null,
          category,
          description,
          JSON.stringify(command.payload ?? {}),
        ],
      );
      return result.rows[0];
    });
  }

  transition(
    id: string,
    command: TransitionComplaintCommand,
  ): Promise<Complaint> {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId) throw new BadRequestException('Actor context is required');
    return this.complaints.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        Complaint & Record<string, unknown>
      >(
        `update portal.complaint
            set status = $2,
                assigned_to = coalesce($3, assigned_to),
                closed_by = case when $2::varchar in ('CLOSED','REJECTED') then $4::uuid else null end,
                closed_at = case when $2::varchar in ('CLOSED','REJECTED') then now() else null end,
                payload = payload || $5::jsonb,
                updated_at = now()
          where id = $1
         returning *`,
        [
          id,
          command.status,
          command.assignedTo ?? null,
          actorId,
          JSON.stringify(command.payload ?? {}),
        ],
      );
      const complaint = result.rows[0];
      if (!complaint) throw new NotFoundException(`Complaint ${id} not found`);
      return complaint;
    });
  }
}
