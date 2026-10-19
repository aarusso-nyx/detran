// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
import { Injectable } from '@nestjs/common';
import { RaitAdmissibilityRepository } from '../repositories/rait-admissibility.repository.js';
import type { RaitAdmissibility } from '../entities/rait-admissibility.entity.js';
import type { CreateRaitAdmissibilityDto } from '../dto/create-rait-admissibility.dto.js';

@Injectable()
export class RaitAdmissibilityService {
  constructor(private readonly repository: RaitAdmissibilityRepository) {}
  findAll(): Promise<RaitAdmissibility[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitAdmissibility> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitAdmissibilityDto): Promise<RaitAdmissibility> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitAdmissibilityDto>,
  ): Promise<RaitAdmissibility> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
