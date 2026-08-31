// Generated from BP-CH-REPORTS-001 v1.0.0 sha256:959226a383e0fb64d104a887fe34cb5dba462d875869163a39abc94227f6f966
import { Injectable } from '@nestjs/common';
import { ReportRepository } from '../repositories/report.repository.js';
import type { Report } from '../entities/report.entity.js';
import type { CreateReportDto } from '../dto/create-report.dto.js';

@Injectable()
export class ReportService {
  constructor(private readonly repository: ReportRepository) {}
  findAll(): Promise<Report[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Report> {
    return this.repository.findOne(id);
  }
  create(dto: CreateReportDto): Promise<Report> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateReportDto>): Promise<Report> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
