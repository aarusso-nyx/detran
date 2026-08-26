// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:badca32b76e1022606203a012cf996ec5b175c2226d13b99d80123cb84352167
import { Injectable } from '@nestjs/common';
import { RaitDeadlineRepository } from '../repositories/rait-deadline.repository.js';
import type { RaitDeadline } from '../entities/rait-deadline.entity.js';
import type { CreateRaitDeadlineDto } from '../dto/create-rait-deadline.dto.js';

@Injectable()
export class RaitDeadlineService {
  constructor(private readonly repository: RaitDeadlineRepository) {}
  findAll(): Promise<RaitDeadline[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitDeadline> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitDeadlineDto): Promise<RaitDeadline> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitDeadlineDto>,
  ): Promise<RaitDeadline> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
