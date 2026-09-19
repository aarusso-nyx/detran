// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:e739cf21c78ced39113911fbf0c9950d0c2091ab58cc4efedee4225786fe9eac
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
