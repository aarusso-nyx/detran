// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:060a1bba7bd902d60194a1ee2fe169a4b0972602bd54e5330083d9c518641e52
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
