// Generated from BP-CH-INCONSISTENCIES-001 v1.0.0 sha256:8d41845822fa8f12974a6647c408a271a91454cc1edf96a2d24a695385b1f72e
import { Injectable } from '@nestjs/common';
import { InconsistencyRepository } from '../repositories/inconsistency.repository.js';
import type { Inconsistency } from '../entities/inconsistency.entity.js';
import type { CreateInconsistencyDto } from '../dto/create-inconsistency.dto.js';

@Injectable()
export class InconsistencyService {
  constructor(private readonly repository: InconsistencyRepository) {}
  findAll(): Promise<Inconsistency[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Inconsistency> {
    return this.repository.findOne(id);
  }
  create(dto: CreateInconsistencyDto): Promise<Inconsistency> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateInconsistencyDto>,
  ): Promise<Inconsistency> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
