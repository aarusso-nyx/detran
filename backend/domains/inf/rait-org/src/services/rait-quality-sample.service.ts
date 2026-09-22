// Generated from BP-INF-RAIT-ORG-001 v1.0.1 sha256:7ece9578325dfb4c1a393f1ce7805146a621d5e7b4b843176533126efd74d55d
import { Injectable } from '@nestjs/common';
import { RaitQualitySampleRepository } from '../repositories/rait-quality-sample.repository.js';
import type { RaitQualitySample } from '../entities/rait-quality-sample.entity.js';
import type { CreateRaitQualitySampleDto } from '../dto/create-rait-quality-sample.dto.js';

@Injectable()
export class RaitQualitySampleService {
  constructor(private readonly repository: RaitQualitySampleRepository) {}
  findAll(): Promise<RaitQualitySample[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitQualitySample> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitQualitySampleDto): Promise<RaitQualitySample> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitQualitySampleDto>,
  ): Promise<RaitQualitySample> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
