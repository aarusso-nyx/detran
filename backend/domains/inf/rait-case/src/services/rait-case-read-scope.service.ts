// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
