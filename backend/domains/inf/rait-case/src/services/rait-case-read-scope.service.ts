// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
import { Injectable } from '@nestjs/common';
import { RaitCaseReadScopeRepository } from '../repositories/rait-case-read-scope.repository.js';
import type { RaitCaseReadScope } from '../entities/rait-case-read-scope.entity.js';
import type { CreateRaitCaseReadScopeDto } from '../dto/create-rait-case-read-scope.dto.js';

@Injectable()
export class RaitCaseReadScopeService {
  constructor(private readonly repository: RaitCaseReadScopeRepository) {}
  findAll(): Promise<RaitCaseReadScope[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitCaseReadScope> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitCaseReadScopeDto): Promise<RaitCaseReadScope> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitCaseReadScopeDto>,
  ): Promise<RaitCaseReadScope> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
