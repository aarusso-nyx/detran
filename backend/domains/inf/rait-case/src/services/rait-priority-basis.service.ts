// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
