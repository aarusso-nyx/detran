// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
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
