// Generated from BP-INF-AIT-001 v1.2.0 sha256:a92e771e8f034647144a60080673e25e807fdbc93a27c59a1da0fc32710fd2ea
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
