// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
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
