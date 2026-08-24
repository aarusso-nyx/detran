// Generated from BP-INF-AIT-001 v1.0.0 sha256:ef69813e9ad97641c04b7bbbdb8110fe97446523d552fdf17da429d55de0b510
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
