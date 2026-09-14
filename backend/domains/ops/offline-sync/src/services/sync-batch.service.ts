// Generated from BP-OPS-OFFLINE-SYNC-001 v1.0.0 sha256:21bcd6e203b7ff643de48a32fe2947a4e7ad1f7b62b66209c60e24c97da59ce9
import { Injectable } from '@nestjs/common';
import { SyncBatchRepository } from '../repositories/sync-batch.repository.js';
import type { SyncBatch } from '../entities/sync-batch.entity.js';
import type { CreateSyncBatchDto } from '../dto/create-sync-batch.dto.js';

@Injectable()
export class SyncBatchService {
  constructor(private readonly repository: SyncBatchRepository) {}
  findAll(): Promise<SyncBatch[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<SyncBatch> {
    return this.repository.findOne(id);
  }
  create(dto: CreateSyncBatchDto): Promise<SyncBatch> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateSyncBatchDto>): Promise<SyncBatch> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
