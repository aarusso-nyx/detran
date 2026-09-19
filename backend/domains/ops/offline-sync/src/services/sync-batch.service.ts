// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:c35fb9b7cf739cf06c18b8cc02b1ec4cd968c63916ffd149c79d29937faa2c67
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
