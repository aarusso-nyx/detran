// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:9d98d9786bc2f4b27bd75cb5516d4a00b6d74e520f3dbc52c39f33effb27f60e
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
