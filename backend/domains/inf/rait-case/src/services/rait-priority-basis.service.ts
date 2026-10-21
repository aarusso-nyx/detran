// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
