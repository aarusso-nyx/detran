// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
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
