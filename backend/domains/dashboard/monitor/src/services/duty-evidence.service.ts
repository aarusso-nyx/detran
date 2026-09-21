// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
