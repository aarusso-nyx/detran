// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
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
