// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:060a1bba7bd902d60194a1ee2fe169a4b0972602bd54e5330083d9c518641e52
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
