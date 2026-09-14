// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
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
