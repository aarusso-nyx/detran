// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
