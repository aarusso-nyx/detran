// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
import { Injectable } from '@nestjs/common';
import { RaitCasePoolScopeRecordRepository } from '../repositories/rait-case-pool-scope-record.repository.js';
import type { RaitCasePoolScopeRecord } from '../entities/rait-case-pool-scope-record.entity.js';
import type { CreateRaitCasePoolScopeRecordDto } from '../dto/create-rait-case-pool-scope-record.dto.js';

@Injectable()
export class RaitCasePoolScopeRecordService {
  constructor(private readonly repository: RaitCasePoolScopeRecordRepository) {}
  findAll(): Promise<RaitCasePoolScopeRecord[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitCasePoolScopeRecord> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateRaitCasePoolScopeRecordDto,
  ): Promise<RaitCasePoolScopeRecord> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitCasePoolScopeRecordDto>,
  ): Promise<RaitCasePoolScopeRecord> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
