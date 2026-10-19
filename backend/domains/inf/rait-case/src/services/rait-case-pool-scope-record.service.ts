// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
