// Generated from BP-CH-REPORTS-001 v1.3.0 sha256:223e3b4e60807d8ac51bcd6d9e1294a65ca305509b8ff1dc2f93649c7f3aa1a5
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
