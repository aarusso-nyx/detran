// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:c35fb9b7cf739cf06c18b8cc02b1ec4cd968c63916ffd149c79d29937faa2c67
import { Injectable } from '@nestjs/common';
import { SyncQueueItemRepository } from '../repositories/sync-queue-item.repository.js';
import type { SyncQueueItem } from '../entities/sync-queue-item.entity.js';
import type { CreateSyncQueueItemDto } from '../dto/create-sync-queue-item.dto.js';

@Injectable()
export class SyncQueueItemService {
  constructor(private readonly repository: SyncQueueItemRepository) {}
  findAll(): Promise<SyncQueueItem[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<SyncQueueItem> {
    return this.repository.findOne(id);
  }
  create(dto: CreateSyncQueueItemDto): Promise<SyncQueueItem> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateSyncQueueItemDto>,
  ): Promise<SyncQueueItem> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
