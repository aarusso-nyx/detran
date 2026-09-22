// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
