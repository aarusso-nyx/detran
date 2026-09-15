// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
import { Injectable } from '@nestjs/common';
import { AdministrativeMeasureRepository } from '../repositories/administrative-measure.repository.js';
import type { AdministrativeMeasure } from '../entities/administrative-measure.entity.js';
import type { CreateAdministrativeMeasureDto } from '../dto/create-administrative-measure.dto.js';

@Injectable()
export class AdministrativeMeasureService {
  constructor(private readonly repository: AdministrativeMeasureRepository) {}
  findAll(): Promise<AdministrativeMeasure[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AdministrativeMeasure> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAdministrativeMeasureDto): Promise<AdministrativeMeasure> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAdministrativeMeasureDto>,
  ): Promise<AdministrativeMeasure> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
