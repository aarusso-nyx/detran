// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:7c0a0e3e7c424b57f2ad54fff4a784959470ca1969c50cf0cc9e0af6daaa16c4
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
