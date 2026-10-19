// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
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
