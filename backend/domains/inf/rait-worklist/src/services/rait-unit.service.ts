// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
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
