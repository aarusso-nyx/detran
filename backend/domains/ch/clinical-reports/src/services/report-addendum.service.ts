// Generated from BP-CH-REPORTS-001 v1.0.0 sha256:959226a383e0fb64d104a887fe34cb5dba462d875869163a39abc94227f6f966
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
