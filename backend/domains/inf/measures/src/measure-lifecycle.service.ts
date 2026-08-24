import { createHash } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import type { Transaction } from '@stynx-nyx/data';

import type { AdministrativeMeasure } from './entities/administrative-measure.entity.js';
import type { AdministrativeMeasureRepository } from './repositories/administrative-measure.repository.js';
import type { AdministrativeTermRepository } from './repositories/administrative-term.repository.js';
import type { MeasureRemovalRepository } from './repositories/measure-removal.repository.js';
import type { MeasureRetentionRepository } from './repositories/measure-retention.repository.js';
import type { MeasureStatusHistoryRepository } from './repositories/measure-status-history.repository.js';
import type { VehicleInventoryRepository } from './repositories/vehicle-inventory.repository.js';

type MeasureStatus =
  | 'started'
  | 'in_execution'
  | 'pending_external_resource'
  | 'released'
  | 'concluded'
  | 'cancelled'
  | 'rejected';

export interface MeasureRepositories {
  measures: AdministrativeMeasureRepository;
  terms: AdministrativeTermRepository;
  retentions: MeasureRetentionRepository;
  removals: MeasureRemovalRepository;
  inventories: VehicleInventoryRepository;
  history: MeasureStatusHistoryRepository;
}

@Injectable()
export class MeasureLifecycleService {
  constructor(private readonly repositories: MeasureRepositories) {}

  start(id: string, actorId?: string) {
    return this.transitionFrom(
      id,
      ['started'],
      'in_execution',
      'Administrative measure started',
      actorId,
    );
  }

  issueTerm(
    id: string,
    dto: {
      term_type: string;
      term_number: string;
      content_hash?: string;
      file_evidence_id?: string;
      issued_at?: string;
      signed_by_person_id?: string;
      user_ref?: string;
    },
  ) {
    return this.repositories.measures.transaction(async (tx) => {
      const measure = await this.requireStatus(
        id,
        ['started', 'in_execution', 'released', 'concluded'],
        tx,
      );
      const term = await this.repositories.terms.create(
        {
          measure_id: id,
          term_type: dto.term_type,
          term_number: dto.term_number,
          content_hash: dto.content_hash ?? termHash(measure, dto),
          file_evidence_id: dto.file_evidence_id ?? null,
          issued_at: dto.issued_at ?? new Date().toISOString(),
          signed_by_person_id: dto.signed_by_person_id ?? null,
          status: 'issued',
        },
        tx,
      );
      await this.history(
        measure,
        measure.current_status as MeasureStatus,
        'Administrative term issued',
        tx,
        dto.user_ref,
      );
      return term;
    });
  }

  recordRetention(
    id: string,
    dto: {
      vehicle_snapshot_id: string;
      retention_reason: string;
      user_ref?: string;
    },
  ) {
    return this.repositories.measures.transaction(async (tx) => {
      const measure = await this.requireStatus(
        id,
        ['started', 'in_execution'],
        tx,
      );
      const retention = await this.repositories.retentions.create(
        {
          measure_id: id,
          vehicle_snapshot_id: dto.vehicle_snapshot_id,
          retention_reason: dto.retention_reason,
        },
        tx,
      );
      await this.transition(
        measure,
        'in_execution',
        'Retention recorded',
        tx,
        dto.user_ref,
      );
      return retention;
    });
  }

  recordRemoval(
    id: string,
    dto: {
      vehicle_snapshot_id: string;
      tow_provider_id?: string;
      yard_id?: string;
      destination_description?: string;
      user_ref?: string;
    },
  ) {
    return this.repositories.measures.transaction(async (tx) => {
      const measure = await this.requireStatus(
        id,
        ['started', 'in_execution'],
        tx,
      );
      const removal = await this.repositories.removals.create(
        {
          measure_id: id,
          vehicle_snapshot_id: dto.vehicle_snapshot_id,
          tow_provider_id: dto.tow_provider_id ?? null,
          yard_id: dto.yard_id ?? null,
          requested_at: new Date().toISOString(),
          destination_description: dto.destination_description ?? null,
        },
        tx,
      );
      await this.transition(
        measure,
        'in_execution',
        'Removal recorded',
        tx,
        dto.user_ref,
      );
      return removal;
    });
  }

  recordInventory(
    id: string,
    dto: {
      vehicle_snapshot_id: string;
      inventory_json: Record<string, unknown>;
      damage_description?: string;
      signed_by_person_id?: string;
      user_ref?: string;
    },
  ) {
    return this.repositories.measures.transaction(async (tx) => {
      const measure = await this.requireStatus(
        id,
        ['started', 'in_execution'],
        tx,
      );
      const inventory = await this.repositories.inventories.create(
        {
          measure_id: id,
          vehicle_snapshot_id: dto.vehicle_snapshot_id,
          inventory_json: dto.inventory_json,
          damage_description: dto.damage_description ?? null,
          signed_by_person_id: dto.signed_by_person_id ?? null,
        },
        tx,
      );
      await this.history(
        measure,
        measure.current_status as MeasureStatus,
        'Vehicle inventory recorded',
        tx,
        dto.user_ref,
      );
      return inventory;
    });
  }

  release(retentionId: string, actorId?: string) {
    return this.repositories.measures.transaction(async (tx) => {
      const retention = await this.repositories.retentions.findOne(
        retentionId,
        tx,
      );
      if (retention.released_at)
        throw new BadRequestException(
          `Retention ${retentionId} is already released`,
        );
      const measure = await this.repositories.measures.findOne(
        retention.measure_id,
        tx,
      );
      const released = await this.repositories.retentions.update(
        retentionId,
        {
          released_at: new Date().toISOString(),
          release_user_ref: actorId ?? null,
        },
        tx,
      );
      await this.transition(
        measure,
        'released',
        'Retention released',
        tx,
        actorId,
      );
      return released;
    });
  }

  conclude(id: string, actorId?: string) {
    return this.repositories.measures.transaction(async (tx) => {
      const measure = await this.requireStatus(
        id,
        ['started', 'in_execution', 'released'],
        tx,
      );
      return this.transition(
        measure,
        'concluded',
        'Administrative measure concluded',
        tx,
        actorId,
        { ended_at: new Date().toISOString() },
      );
    });
  }

  cancel(id: string, reason: string, actorId?: string) {
    return this.transitionFrom(
      id,
      ['started', 'in_execution', 'pending_external_resource'],
      'cancelled',
      reason,
      actorId,
    );
  }

  private transitionFrom(
    id: string,
    allowed: MeasureStatus[],
    target: MeasureStatus,
    reason: string,
    actorId?: string,
  ) {
    return this.repositories.measures.transaction(async (tx) => {
      const measure = await this.requireStatus(id, allowed, tx);
      return this.transition(measure, target, reason, tx, actorId);
    });
  }

  private async requireStatus(
    id: string,
    allowed: MeasureStatus[],
    tx: Transaction,
  ) {
    const measure = await this.repositories.measures.findOne(id, tx);
    if (!allowed.includes(measure.current_status as MeasureStatus))
      throw new BadRequestException(
        `Measure ${id} is ${measure.current_status}; expected ${allowed.join(', ')}`,
      );
    return measure;
  }

  private async transition(
    measure: AdministrativeMeasure,
    target: MeasureStatus,
    reason: string,
    tx: Transaction,
    actorId?: string,
    patch: Record<string, unknown> = {},
  ) {
    await this.history(measure, target, reason, tx, actorId);
    return this.repositories.measures.update(
      measure.id,
      { ...patch, current_status: target },
      tx,
    );
  }

  private history(
    measure: AdministrativeMeasure,
    status: MeasureStatus,
    reason: string,
    tx: Transaction,
    actorId?: string,
  ) {
    return this.repositories.history.create(
      { measure_id: measure.id, status, user_ref: actorId ?? null, reason },
      tx,
    );
  }
}

function termHash(measure: AdministrativeMeasure, term: object): string {
  return createHash('sha256')
    .update(JSON.stringify({ measure_id: measure.id, term }))
    .digest('hex');
}
