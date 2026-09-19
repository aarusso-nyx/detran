// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
import { Injectable } from '@nestjs/common';
import { MeasureRemovalRepository } from '../repositories/measure-removal.repository.js';
import type { MeasureRemoval } from '../entities/measure-removal.entity.js';
import type { CreateMeasureRemovalDto } from '../dto/create-measure-removal.dto.js';

@Injectable()
export class MeasureRemovalService {
  constructor(private readonly repository: MeasureRemovalRepository) {}
  findAll(): Promise<MeasureRemoval[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<MeasureRemoval> {
    return this.repository.findOne(id);
  }
  create(dto: CreateMeasureRemovalDto): Promise<MeasureRemoval> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateMeasureRemovalDto>,
  ): Promise<MeasureRemoval> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
