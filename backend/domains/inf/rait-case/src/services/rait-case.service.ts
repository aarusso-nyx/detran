// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
import { Injectable } from '@nestjs/common';
import { RaitCaseRepository } from '../repositories/rait-case.repository.js';
import type { RaitCase } from '../entities/rait-case.entity.js';
import type { CreateRaitCaseDto } from '../dto/create-rait-case.dto.js';

@Injectable()
export class RaitCaseService {
  constructor(private readonly repository: RaitCaseRepository) {}
  findAll(): Promise<RaitCase[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitCase> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitCaseDto): Promise<RaitCase> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRaitCaseDto>): Promise<RaitCase> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
