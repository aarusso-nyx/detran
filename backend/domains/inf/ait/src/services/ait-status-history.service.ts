// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
import { Injectable } from '@nestjs/common';
import { AitStatusHistoryRepository } from '../repositories/ait-status-history.repository.js';
import type { AitStatusHistory } from '../entities/ait-status-history.entity.js';
import type { CreateAitStatusHistoryDto } from '../dto/create-ait-status-history.dto.js';

@Injectable()
export class AitStatusHistoryService {
  constructor(private readonly repository: AitStatusHistoryRepository) {}
  findAll(): Promise<AitStatusHistory[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AitStatusHistory> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAitStatusHistoryDto): Promise<AitStatusHistory> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAitStatusHistoryDto>,
  ): Promise<AitStatusHistory> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
