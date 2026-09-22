// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { PecDeadlinesRepository } from '../repositories/pec-deadlines.repository.js';
import type { PecDeadlines } from '../entities/pec-deadlines.entity.js';
import type { CreatePecDeadlinesDto } from '../dto/create-pec-deadlines.dto.js';

@Injectable()
export class PecDeadlinesService {
  constructor(private readonly repository: PecDeadlinesRepository) {}
  findAll(): Promise<PecDeadlines[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<PecDeadlines> {
    return this.repository.findOne(id);
  }
  create(dto: CreatePecDeadlinesDto): Promise<PecDeadlines> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreatePecDeadlinesDto>,
  ): Promise<PecDeadlines> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
