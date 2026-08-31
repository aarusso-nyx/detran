// Generated from BP-CH-RETENTION-001 v1.0.0 sha256:8a74485eaee2a6dbb8cbc10772396a77b465cdd84cc5a57db0c90035ef24ea78
import { Injectable } from '@nestjs/common';
import { RetentionCaseRepository } from '../repositories/retention-case.repository.js';
import type { RetentionCase } from '../entities/retention-case.entity.js';
import type { CreateRetentionCaseDto } from '../dto/create-retention-case.dto.js';

@Injectable()
export class RetentionCaseService {
  constructor(private readonly repository: RetentionCaseRepository) {}
  findAll(): Promise<RetentionCase[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RetentionCase> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRetentionCaseDto): Promise<RetentionCase> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRetentionCaseDto>,
  ): Promise<RetentionCase> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
