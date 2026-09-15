// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
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
