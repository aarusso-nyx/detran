// Generated from BP-OPS-OFFLINE-SYNC-001 v1.0.0 sha256:21bcd6e203b7ff643de48a32fe2947a4e7ad1f7b62b66209c60e24c97da59ce9
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
