// Generated from BP-OPS-EVIDENCE-001 v1.0.0 sha256:a8692e7ee4171aea45d3aa6a8ca457251f3005b1dc05d1b03e2aa5ebc8f1923f
import { Injectable } from '@nestjs/common';
import { EvidenceLinkRepository } from '../repositories/evidence-link.repository.js';
import type { EvidenceLink } from '../entities/evidence-link.entity.js';
import type { CreateEvidenceLinkDto } from '../dto/create-evidence-link.dto.js';

@Injectable()
export class EvidenceLinkService {
  constructor(private readonly repository: EvidenceLinkRepository) {}
  findAll(): Promise<EvidenceLink[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<EvidenceLink> {
    return this.repository.findOne(id);
  }
  create(dto: CreateEvidenceLinkDto): Promise<EvidenceLink> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateEvidenceLinkDto>,
  ): Promise<EvidenceLink> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
