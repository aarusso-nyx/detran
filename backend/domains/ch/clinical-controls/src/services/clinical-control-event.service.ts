// Generated from BP-CH-CLINICAL-CONTROLS-001 v1.0.0 sha256:0fc842b8a5a36fe3ca506127d7341f9c7bf183f2956d1c77485c5e3f6a8db18c
import { Injectable } from '@nestjs/common';
import { ClinicalControlEventRepository } from '../repositories/clinical-control-event.repository.js';
import type { ClinicalControlEvent } from '../entities/clinical-control-event.entity.js';
import type { CreateClinicalControlEventDto } from '../dto/create-clinical-control-event.dto.js';

@Injectable()
export class ClinicalControlEventService {
  constructor(private readonly repository: ClinicalControlEventRepository) {}
  findAll(): Promise<ClinicalControlEvent[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ClinicalControlEvent> {
    return this.repository.findOne(id);
  }
  create(dto: CreateClinicalControlEventDto): Promise<ClinicalControlEvent> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateClinicalControlEventDto>,
  ): Promise<ClinicalControlEvent> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
