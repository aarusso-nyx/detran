// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
