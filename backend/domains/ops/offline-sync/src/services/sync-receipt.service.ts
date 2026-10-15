// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:060a1bba7bd902d60194a1ee2fe169a4b0972602bd54e5330083d9c518641e52
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
