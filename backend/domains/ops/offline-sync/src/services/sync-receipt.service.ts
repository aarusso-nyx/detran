// Generated from BP-OPS-OFFLINE-SYNC-001 v1.1.0 sha256:fb2ab9cef5ee5621be533d83fd88a694912460d6fbe4cd446bc2c8d7f7bcfc3d
import { Injectable } from '@nestjs/common';
import { SyncReceiptRepository } from '../repositories/sync-receipt.repository.js';
import type { SyncReceipt } from '../entities/sync-receipt.entity.js';
import type { CreateSyncReceiptDto } from '../dto/create-sync-receipt.dto.js';

@Injectable()
export class SyncReceiptService {
  constructor(private readonly repository: SyncReceiptRepository) {}
  findAll(): Promise<SyncReceipt[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<SyncReceipt> {
    return this.repository.findOne(id);
  }
  create(dto: CreateSyncReceiptDto): Promise<SyncReceipt> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateSyncReceiptDto>): Promise<SyncReceipt> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
