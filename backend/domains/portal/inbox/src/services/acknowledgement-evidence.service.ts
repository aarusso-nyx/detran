// Generated from BP-PORTAL-INBOX-001 v1.0.1 sha256:1ddffdafcda20768cbaa66e39e4ee4f5346513517e6bb95c6216878d42314ccd
import { Injectable } from '@nestjs/common';
import { AcknowledgementEvidenceRepository } from '../repositories/acknowledgement-evidence.repository.js';
import type { AcknowledgementEvidence } from '../entities/acknowledgement-evidence.entity.js';
import type { CreateAcknowledgementEvidenceDto } from '../dto/create-acknowledgement-evidence.dto.js';

@Injectable()
export class AcknowledgementEvidenceService {
  constructor(private readonly repository: AcknowledgementEvidenceRepository) {}
  findAll(): Promise<AcknowledgementEvidence[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AcknowledgementEvidence> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateAcknowledgementEvidenceDto,
  ): Promise<AcknowledgementEvidence> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAcknowledgementEvidenceDto>,
  ): Promise<AcknowledgementEvidence> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
