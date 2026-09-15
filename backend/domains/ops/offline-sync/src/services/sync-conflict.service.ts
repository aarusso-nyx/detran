// Generated from BP-OPS-OFFLINE-SYNC-001 v1.1.0 sha256:fb2ab9cef5ee5621be533d83fd88a694912460d6fbe4cd446bc2c8d7f7bcfc3d
import { Injectable } from '@nestjs/common';
import { SyncConflictRepository } from '../repositories/sync-conflict.repository.js';
import type { SyncConflict } from '../entities/sync-conflict.entity.js';
import type { CreateSyncConflictDto } from '../dto/create-sync-conflict.dto.js';

@Injectable()
export class SyncConflictService {
  constructor(private readonly repository: SyncConflictRepository) {}
  findAll(): Promise<SyncConflict[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<SyncConflict> {
    return this.repository.findOne(id);
  }
  create(dto: CreateSyncConflictDto): Promise<SyncConflict> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateSyncConflictDto>,
  ): Promise<SyncConflict> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
