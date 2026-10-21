// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
import { Injectable } from '@nestjs/common';
import { CrashReportDocumentRepository } from '../repositories/crash-report-document.repository.js';
import type { CrashReportDocument } from '../entities/crash-report-document.entity.js';
import type { CreateCrashReportDocumentDto } from '../dto/create-crash-report-document.dto.js';

@Injectable()
export class CrashReportDocumentService {
  constructor(private readonly repository: CrashReportDocumentRepository) {}
  findAll(): Promise<CrashReportDocument[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CrashReportDocument> {
    return this.repository.findOne(id);
  }
  create(dto: CreateCrashReportDocumentDto): Promise<CrashReportDocument> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateCrashReportDocumentDto>,
  ): Promise<CrashReportDocument> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
