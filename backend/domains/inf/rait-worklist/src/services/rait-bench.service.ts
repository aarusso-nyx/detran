// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
import { Injectable } from '@nestjs/common';
import { RaitBenchRepository } from '../repositories/rait-bench.repository.js';
import type { RaitBench } from '../entities/rait-bench.entity.js';
import type { CreateRaitBenchDto } from '../dto/create-rait-bench.dto.js';

@Injectable()
export class RaitBenchService {
  constructor(private readonly repository: RaitBenchRepository) {}
  findAll(): Promise<RaitBench[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitBench> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitBenchDto): Promise<RaitBench> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRaitBenchDto>): Promise<RaitBench> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
