// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:1861cc41e71895a553a106b4be9f7f02958d1829af65885904d1c8f6a9aeb07c
import { Injectable } from '@nestjs/common';
import { IdempotencyRecordRepository } from '../repositories/idempotency-record.repository.js';
import type { IdempotencyRecord } from '../entities/idempotency-record.entity.js';
import type { CreateIdempotencyRecordDto } from '../dto/create-idempotency-record.dto.js';

@Injectable()
export class IdempotencyRecordService {
  constructor(private readonly repository: IdempotencyRecordRepository) {}
  findAll(): Promise<IdempotencyRecord[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<IdempotencyRecord> {
    return this.repository.findOne(id);
  }
  create(dto: CreateIdempotencyRecordDto): Promise<IdempotencyRecord> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateIdempotencyRecordDto>,
  ): Promise<IdempotencyRecord> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
