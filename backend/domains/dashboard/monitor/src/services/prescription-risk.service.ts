// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { PrescriptionRiskRepository } from '../repositories/prescription-risk.repository.js';
import type { PrescriptionRisk } from '../entities/prescription-risk.entity.js';
import type { CreatePrescriptionRiskDto } from '../dto/create-prescription-risk.dto.js';

@Injectable()
export class PrescriptionRiskService {
  constructor(private readonly repository: PrescriptionRiskRepository) {}
  findAll(): Promise<PrescriptionRisk[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<PrescriptionRisk> {
    return this.repository.findOne(id);
  }
  create(dto: CreatePrescriptionRiskDto): Promise<PrescriptionRisk> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreatePrescriptionRiskDto>,
  ): Promise<PrescriptionRisk> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
