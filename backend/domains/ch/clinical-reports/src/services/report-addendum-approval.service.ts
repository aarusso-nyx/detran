// Generated from BP-CH-REPORTS-001 v1.2.0 sha256:5045696b00b62bf7bd1c4ae7976e61f61de9954c392aed7987edaa45ba169501
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
