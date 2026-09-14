// Generated from BP-OPS-EVIDENCE-001 v1.0.0 sha256:a8692e7ee4171aea45d3aa6a8ca457251f3005b1dc05d1b03e2aa5ebc8f1923f
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
