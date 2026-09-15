// Generated from BP-OPS-OFFLINE-SYNC-001 v1.1.0 sha256:fb2ab9cef5ee5621be533d83fd88a694912460d6fbe4cd446bc2c8d7f7bcfc3d
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
