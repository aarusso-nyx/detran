// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
import { Injectable } from '@nestjs/common';
import { RaitPriorityBasisRepository } from '../repositories/rait-priority-basis.repository.js';
import type { RaitPriorityBasis } from '../entities/rait-priority-basis.entity.js';
import type { CreateRaitPriorityBasisDto } from '../dto/create-rait-priority-basis.dto.js';

@Injectable()
export class RaitPriorityBasisService {
  constructor(private readonly repository: RaitPriorityBasisRepository) {}
  findAll(): Promise<RaitPriorityBasis[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitPriorityBasis> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitPriorityBasisDto): Promise<RaitPriorityBasis> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitPriorityBasisDto>,
  ): Promise<RaitPriorityBasis> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
