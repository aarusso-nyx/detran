// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
