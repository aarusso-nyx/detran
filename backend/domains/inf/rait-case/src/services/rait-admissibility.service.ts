// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:aa7b398ec04e8ec20dddff316e606e4dc5b3dcad6348495f967681cbaf63f107
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
