// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
import { Injectable } from '@nestjs/common';
import { MeasureTypeRepository } from '../repositories/measure-type.repository.js';
import type { MeasureType } from '../entities/measure-type.entity.js';
import type { CreateMeasureTypeDto } from '../dto/create-measure-type.dto.js';

@Injectable()
export class MeasureTypeService {
  constructor(private readonly repository: MeasureTypeRepository) {}
  findAll(): Promise<MeasureType[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<MeasureType> {
    return this.repository.findOne(id);
  }
  create(dto: CreateMeasureTypeDto): Promise<MeasureType> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateMeasureTypeDto>): Promise<MeasureType> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
