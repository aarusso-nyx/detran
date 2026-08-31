// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:9d98d9786bc2f4b27bd75cb5516d4a00b6d74e520f3dbc52c39f33effb27f60e
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
