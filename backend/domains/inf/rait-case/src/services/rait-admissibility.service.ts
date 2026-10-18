// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
