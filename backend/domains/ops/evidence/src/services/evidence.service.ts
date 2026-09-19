// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:e739cf21c78ced39113911fbf0c9950d0c2091ab58cc4efedee4225786fe9eac
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
