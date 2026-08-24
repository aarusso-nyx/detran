// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
import { Injectable } from '@nestjs/common';
import { MeasureStatusHistoryRepository } from '../repositories/measure-status-history.repository.js';
import type { MeasureStatusHistory } from '../entities/measure-status-history.entity.js';
import type { CreateMeasureStatusHistoryDto } from '../dto/create-measure-status-history.dto.js';

@Injectable()
export class MeasureStatusHistoryService {
  constructor(private readonly repository: MeasureStatusHistoryRepository) {}
  findAll(): Promise<MeasureStatusHistory[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<MeasureStatusHistory> {
    return this.repository.findOne(id);
  }
  create(dto: CreateMeasureStatusHistoryDto): Promise<MeasureStatusHistory> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateMeasureStatusHistoryDto>,
  ): Promise<MeasureStatusHistory> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
