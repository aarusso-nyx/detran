// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { ExportLogRepository } from '../repositories/export-log.repository.js';
import type { ExportLog } from '../entities/export-log.entity.js';
import type { CreateExportLogDto } from '../dto/create-export-log.dto.js';

@Injectable()
export class ExportLogService {
  constructor(private readonly repository: ExportLogRepository) {}
  findAll(): Promise<ExportLog[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ExportLog> {
    return this.repository.findOne(id);
  }
  create(dto: CreateExportLogDto): Promise<ExportLog> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateExportLogDto>): Promise<ExportLog> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
