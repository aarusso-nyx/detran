// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
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
