// Generated from BP-CH-RETENTION-001 v1.0.0 sha256:8a74485eaee2a6dbb8cbc10772396a77b465cdd84cc5a57db0c90035ef24ea78
import { Injectable } from '@nestjs/common';
import { RetentionDispositionRepository } from '../repositories/retention-disposition.repository.js';
import type { RetentionDisposition } from '../entities/retention-disposition.entity.js';
import type { CreateRetentionDispositionDto } from '../dto/create-retention-disposition.dto.js';

@Injectable()
export class RetentionDispositionService {
  constructor(private readonly repository: RetentionDispositionRepository) {}
  findAll(): Promise<RetentionDisposition[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RetentionDisposition> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRetentionDispositionDto): Promise<RetentionDisposition> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRetentionDispositionDto>,
  ): Promise<RetentionDisposition> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
