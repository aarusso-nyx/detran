// Generated from BP-PORTAL-REQUESTS-001 v1.0.1 sha256:7d0a55a7a82e70ee07788622c4eec34061cd514ce99ee2f768622565ca290904
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
