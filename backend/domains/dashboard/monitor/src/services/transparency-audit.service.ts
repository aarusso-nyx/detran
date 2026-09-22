// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
