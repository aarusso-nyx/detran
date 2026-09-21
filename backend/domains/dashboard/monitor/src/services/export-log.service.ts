// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
