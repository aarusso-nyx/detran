// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { TransparencyAuditRepository } from '../repositories/transparency-audit.repository.js';
import type { TransparencyAudit } from '../entities/transparency-audit.entity.js';
import type { CreateTransparencyAuditDto } from '../dto/create-transparency-audit.dto.js';

@Injectable()
export class TransparencyAuditService {
  constructor(private readonly repository: TransparencyAuditRepository) {}
  findAll(): Promise<TransparencyAudit[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<TransparencyAudit> {
    return this.repository.findOne(id);
  }
  create(dto: CreateTransparencyAuditDto): Promise<TransparencyAudit> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateTransparencyAuditDto>,
  ): Promise<TransparencyAudit> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
