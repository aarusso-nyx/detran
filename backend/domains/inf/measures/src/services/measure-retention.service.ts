// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
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
