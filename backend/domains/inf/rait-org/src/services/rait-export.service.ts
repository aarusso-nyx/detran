// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
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
