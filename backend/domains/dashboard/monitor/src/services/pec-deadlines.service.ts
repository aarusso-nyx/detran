// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
