// Generated from BP-CH-RETENTION-001 v1.0.0 sha256:8a74485eaee2a6dbb8cbc10772396a77b465cdd84cc5a57db0c90035ef24ea78
import { Injectable } from '@nestjs/common';
import { RetentionHoldRepository } from '../repositories/retention-hold.repository.js';
import type { RetentionHold } from '../entities/retention-hold.entity.js';
import type { CreateRetentionHoldDto } from '../dto/create-retention-hold.dto.js';

@Injectable()
export class RetentionHoldService {
  constructor(private readonly repository: RetentionHoldRepository) {}
  findAll(): Promise<RetentionHold[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RetentionHold> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRetentionHoldDto): Promise<RetentionHold> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRetentionHoldDto>,
  ): Promise<RetentionHold> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
