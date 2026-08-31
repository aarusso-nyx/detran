// Generated from BP-CH-REPORTS-001 v1.1.0 sha256:beee4caafe2a85a62db62a7c64f47b7e234388f5606028dbc331786eb1e2f350
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
