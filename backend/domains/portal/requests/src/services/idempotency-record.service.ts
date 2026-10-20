// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:5473ac653449e703579b07347c595f918249dd6308961a12198eab656de781ae
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
