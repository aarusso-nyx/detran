// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { DatasetRepository } from '../repositories/dataset.repository.js';
import type { Dataset } from '../entities/dataset.entity.js';
import type { CreateDatasetDto } from '../dto/create-dataset.dto.js';

@Injectable()
export class DatasetService {
  constructor(private readonly repository: DatasetRepository) {}
  findAll(): Promise<Dataset[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Dataset> {
    return this.repository.findOne(id);
  }
  create(dto: CreateDatasetDto): Promise<Dataset> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateDatasetDto>): Promise<Dataset> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
