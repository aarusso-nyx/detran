// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
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
