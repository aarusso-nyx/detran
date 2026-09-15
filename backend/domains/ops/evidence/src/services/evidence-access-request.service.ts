// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:7c0a0e3e7c424b57f2ad54fff4a784959470ca1969c50cf0cc9e0af6daaa16c4
import { Injectable } from '@nestjs/common';
import { EvidenceAccessRequestRepository } from '../repositories/evidence-access-request.repository.js';
import type { EvidenceAccessRequest } from '../entities/evidence-access-request.entity.js';
import type { CreateEvidenceAccessRequestDto } from '../dto/create-evidence-access-request.dto.js';

@Injectable()
export class EvidenceAccessRequestService {
  constructor(private readonly repository: EvidenceAccessRequestRepository) {}
  findAll(): Promise<EvidenceAccessRequest[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<EvidenceAccessRequest> {
    return this.repository.findOne(id);
  }
  create(dto: CreateEvidenceAccessRequestDto): Promise<EvidenceAccessRequest> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateEvidenceAccessRequestDto>,
  ): Promise<EvidenceAccessRequest> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
