// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:7c0a0e3e7c424b57f2ad54fff4a784959470ca1969c50cf0cc9e0af6daaa16c4
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
