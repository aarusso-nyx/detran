// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
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
