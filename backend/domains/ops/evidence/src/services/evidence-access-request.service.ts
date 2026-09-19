// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:e739cf21c78ced39113911fbf0c9950d0c2091ab58cc4efedee4225786fe9eac
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
