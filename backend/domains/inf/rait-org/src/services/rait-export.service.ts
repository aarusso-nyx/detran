// Generated from BP-INF-RAIT-ORG-001 v1.0.1 sha256:7ece9578325dfb4c1a393f1ce7805146a621d5e7b4b843176533126efd74d55d
import { Injectable } from '@nestjs/common';
import { RaitExportRepository } from '../repositories/rait-export.repository.js';
import type { RaitExport } from '../entities/rait-export.entity.js';
import type { CreateRaitExportDto } from '../dto/create-rait-export.dto.js';

@Injectable()
export class RaitExportService {
  constructor(private readonly repository: RaitExportRepository) {}
  findAll(): Promise<RaitExport[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitExport> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitExportDto): Promise<RaitExport> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRaitExportDto>): Promise<RaitExport> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
