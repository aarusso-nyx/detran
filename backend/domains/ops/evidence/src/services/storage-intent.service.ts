// Generated from BP-OPS-EVIDENCE-001 v1.0.0 sha256:a8692e7ee4171aea45d3aa6a8ca457251f3005b1dc05d1b03e2aa5ebc8f1923f
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
