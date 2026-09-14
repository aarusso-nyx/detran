// Generated from BP-OPS-OFFLINE-SYNC-001 v1.0.0 sha256:21bcd6e203b7ff643de48a32fe2947a4e7ad1f7b62b66209c60e24c97da59ce9
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
