// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
import { Injectable } from '@nestjs/common';
import { RaitUnitRepository } from '../repositories/rait-unit.repository.js';
import type { RaitUnit } from '../entities/rait-unit.entity.js';
import type { CreateRaitUnitDto } from '../dto/create-rait-unit.dto.js';

@Injectable()
export class RaitUnitService {
  constructor(private readonly repository: RaitUnitRepository) {}
  findAll(): Promise<RaitUnit[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitUnit> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitUnitDto): Promise<RaitUnit> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRaitUnitDto>): Promise<RaitUnit> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
