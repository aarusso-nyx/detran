// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
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
