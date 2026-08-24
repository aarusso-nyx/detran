// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
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
