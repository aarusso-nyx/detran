// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { GeneratedReportRepository } from '../repositories/generated-report.repository.js';
import type { GeneratedReport } from '../entities/generated-report.entity.js';
import type { CreateGeneratedReportDto } from '../dto/create-generated-report.dto.js';

@Injectable()
export class GeneratedReportService {
  constructor(private readonly repository: GeneratedReportRepository) {}
  findAll(): Promise<GeneratedReport[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<GeneratedReport> {
    return this.repository.findOne(id);
  }
  create(dto: CreateGeneratedReportDto): Promise<GeneratedReport> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateGeneratedReportDto>,
  ): Promise<GeneratedReport> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
