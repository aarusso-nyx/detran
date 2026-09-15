// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
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
