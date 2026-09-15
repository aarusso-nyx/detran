// Generated from BP-INF-AIT-001 v1.1.0 sha256:de3a429b81e860fb45d3abba728570d01cdfd3b886f55ff770273d4d6fff365f
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
