// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:2297f42351909b6ac68f4a18e7c8b535508fa219dfdaa0f9b087f1ca3b745234
import { Injectable } from '@nestjs/common';
import { RaitImpedimentRepository } from '../repositories/rait-impediment.repository.js';
import type { RaitImpediment } from '../entities/rait-impediment.entity.js';
import type { CreateRaitImpedimentDto } from '../dto/create-rait-impediment.dto.js';

@Injectable()
export class RaitImpedimentService {
  constructor(private readonly repository: RaitImpedimentRepository) {}
  findAll(): Promise<RaitImpediment[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitImpediment> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitImpedimentDto): Promise<RaitImpediment> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitImpedimentDto>,
  ): Promise<RaitImpediment> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
