// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
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
