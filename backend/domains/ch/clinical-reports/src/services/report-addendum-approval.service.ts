// Generated from BP-CH-REPORTS-001 v1.3.0 sha256:223e3b4e60807d8ac51bcd6d9e1294a65ca305509b8ff1dc2f93649c7f3aa1a5
import { Injectable } from '@nestjs/common';
import { ReportAddendumApprovalRepository } from '../repositories/report-addendum-approval.repository.js';
import type { ReportAddendumApproval } from '../entities/report-addendum-approval.entity.js';
import type { CreateReportAddendumApprovalDto } from '../dto/create-report-addendum-approval.dto.js';

@Injectable()
export class ReportAddendumApprovalService {
  constructor(private readonly repository: ReportAddendumApprovalRepository) {}
  findAll(): Promise<ReportAddendumApproval[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ReportAddendumApproval> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateReportAddendumApprovalDto,
  ): Promise<ReportAddendumApproval> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateReportAddendumApprovalDto>,
  ): Promise<ReportAddendumApproval> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
