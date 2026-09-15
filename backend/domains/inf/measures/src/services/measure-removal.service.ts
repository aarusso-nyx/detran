// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
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
