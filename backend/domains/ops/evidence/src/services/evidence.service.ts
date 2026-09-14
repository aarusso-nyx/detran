// Generated from BP-OPS-EVIDENCE-001 v1.0.0 sha256:a8692e7ee4171aea45d3aa6a8ca457251f3005b1dc05d1b03e2aa5ebc8f1923f
import { Injectable } from '@nestjs/common';
import { EvidenceRepository } from '../repositories/evidence.repository.js';
import type { Evidence } from '../entities/evidence.entity.js';
import type { CreateEvidenceDto } from '../dto/create-evidence.dto.js';

@Injectable()
export class EvidenceService {
  constructor(private readonly repository: EvidenceRepository) {}
  findAll(): Promise<Evidence[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Evidence> {
    return this.repository.findOne(id);
  }
  create(dto: CreateEvidenceDto): Promise<Evidence> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateEvidenceDto>): Promise<Evidence> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
