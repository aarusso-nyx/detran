// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { DutyEvidenceRepository } from '../repositories/duty-evidence.repository.js';
import type { DutyEvidence } from '../entities/duty-evidence.entity.js';
import type { CreateDutyEvidenceDto } from '../dto/create-duty-evidence.dto.js';

@Injectable()
export class DutyEvidenceService {
  constructor(private readonly repository: DutyEvidenceRepository) {}
  findAll(): Promise<DutyEvidence[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<DutyEvidence> {
    return this.repository.findOne(id);
  }
  create(dto: CreateDutyEvidenceDto): Promise<DutyEvidence> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateDutyEvidenceDto>,
  ): Promise<DutyEvidence> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
