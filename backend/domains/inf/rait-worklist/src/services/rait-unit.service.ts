// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
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
