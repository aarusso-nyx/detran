// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:7c0a0e3e7c424b57f2ad54fff4a784959470ca1969c50cf0cc9e0af6daaa16c4
import { Injectable } from '@nestjs/common';
import { StorageIntentRepository } from '../repositories/storage-intent.repository.js';
import type { StorageIntent } from '../entities/storage-intent.entity.js';
import type { CreateStorageIntentDto } from '../dto/create-storage-intent.dto.js';

@Injectable()
export class StorageIntentService {
  constructor(private readonly repository: StorageIntentRepository) {}
  findAll(): Promise<StorageIntent[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<StorageIntent> {
    return this.repository.findOne(id);
  }
  create(dto: CreateStorageIntentDto): Promise<StorageIntent> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateStorageIntentDto>,
  ): Promise<StorageIntent> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
