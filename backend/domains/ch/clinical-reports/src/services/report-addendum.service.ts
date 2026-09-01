// Generated from BP-CH-REPORTS-001 v1.3.0 sha256:223e3b4e60807d8ac51bcd6d9e1294a65ca305509b8ff1dc2f93649c7f3aa1a5
import { Injectable } from '@nestjs/common';
import { ReportAddendumRepository } from '../repositories/report-addendum.repository.js';
import type { ReportAddendum } from '../entities/report-addendum.entity.js';
import type { CreateReportAddendumDto } from '../dto/create-report-addendum.dto.js';

@Injectable()
export class ReportAddendumService {
  constructor(private readonly repository: ReportAddendumRepository) {}
  findAll(): Promise<ReportAddendum[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ReportAddendum> {
    return this.repository.findOne(id);
  }
  create(dto: CreateReportAddendumDto): Promise<ReportAddendum> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateReportAddendumDto>,
  ): Promise<ReportAddendum> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
