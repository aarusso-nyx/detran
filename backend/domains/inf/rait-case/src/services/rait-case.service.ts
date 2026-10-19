// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
