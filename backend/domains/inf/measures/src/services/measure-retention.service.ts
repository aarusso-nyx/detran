// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
import { Injectable } from '@nestjs/common';
import { MeasureRetentionRepository } from '../repositories/measure-retention.repository.js';
import type { MeasureRetention } from '../entities/measure-retention.entity.js';
import type { CreateMeasureRetentionDto } from '../dto/create-measure-retention.dto.js';

@Injectable()
export class MeasureRetentionService {
  constructor(private readonly repository: MeasureRetentionRepository) {}
  findAll(): Promise<MeasureRetention[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<MeasureRetention> {
    return this.repository.findOne(id);
  }
  create(dto: CreateMeasureRetentionDto): Promise<MeasureRetention> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateMeasureRetentionDto>,
  ): Promise<MeasureRetention> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
